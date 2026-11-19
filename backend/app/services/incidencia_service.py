import uuid
from pathlib import Path

from fastapi import HTTPException, UploadFile, status

from app.models import Evidencia, Incidencia, Usuario
from app.models.enums import EstadoIncidencia, EstadoPractica, Rol
from app.notifications.service import notificar
from app.repositories.incidencia_repository import IncidenciaRepository
from app.repositories.practica_repository import PracticaRepository
from app.repositories.usuario_repository import UsuarioRepository
from app.schemas.incidencia import ClasificarIn, IncidenciaCreate

UPLOAD_DIR = Path("uploads/evidencias")
EXTENSIONES = {".pdf", ".png", ".jpg", ".jpeg"}
MAX_BYTES = 5 * 1024 * 1024  # 5 MB

# Máquina de estados de la incidencia
TRANSICIONES = {
    EstadoIncidencia.ABIERTA: {EstadoIncidencia.EN_REVISION},
    EstadoIncidencia.EN_REVISION: {EstadoIncidencia.EN_REVISION,   # volver a clasificar
                                   EstadoIncidencia.ESCALADA,
                                   EstadoIncidencia.CERRADA},
    EstadoIncidencia.ESCALADA: {EstadoIncidencia.CERRADA},
    EstadoIncidencia.CERRADA: set(),
}


class IncidenciaService:
    def __init__(self, repo: IncidenciaRepository, practicas: PracticaRepository,
                 usuarios: UsuarioRepository):
        self.repo = repo
        self.practicas = practicas
        self.usuarios = usuarios

    # RF13: estudiante o empresa reportan ------------------------------
    def registrar(self, data: IncidenciaCreate, usuario: Usuario) -> Incidencia:
        practica, _, _, estudiante, empresa = self._contexto(data.practica_id)
        self._verificar_acceso(usuario, estudiante, empresa)

        if practica.estado not in (EstadoPractica.APROBADA, EstadoPractica.EN_CURSO):
            raise HTTPException(status.HTTP_400_BAD_REQUEST,
                                "Solo se reportan incidencias en prácticas aprobadas o en curso")

        incidencia = Incidencia(practica_id=data.practica_id, reportada_por_id=usuario.id,
                                descripcion=data.descripcion)
        self.repo.add(incidencia)

        quien = estudiante.nombre if usuario.rol == Rol.ESTUDIANTE else empresa.nombre
        for gestor_uid in self.repo.gestores_usuario_ids():
            notificar(self.repo.db, gestor_uid, f"Nueva incidencia reportada por {quien}.")
        otra_parte = empresa.usuario_id if usuario.rol == Rol.ESTUDIANTE else estudiante.usuario_id
        notificar(self.repo.db, otra_parte, f"{quien} reportó una incidencia en la práctica.")

        self.repo.commit()
        self.repo.refresh(incidencia)
        return incidencia

    def listar(self, usuario: Usuario, estado: EstadoIncidencia | None = None) -> list[Incidencia]:
        if usuario.rol in (Rol.GESTOR, Rol.COORDINADOR):
            return self.repo.list(estado)
        perfil = self.usuarios.get_perfil(usuario)
        if usuario.rol == Rol.ESTUDIANTE:
            return self.repo.list_by_estudiante(perfil.id, estado)
        return self.repo.list_by_empresa(perfil.id, estado)

    def obtener(self, incidencia_id: int, usuario: Usuario) -> Incidencia:
        incidencia = self._cargar(incidencia_id)
        _, _, _, estudiante, empresa = self._contexto(incidencia.practica_id)
        self._verificar_acceso(usuario, estudiante, empresa)
        return incidencia

    # Evidencias --------------------------------------------------------
    def subir_evidencia(self, incidencia_id: int, usuario: Usuario, archivo: UploadFile) -> Evidencia:
        incidencia = self._cargar(incidencia_id)
        _, _, _, estudiante, empresa = self._contexto(incidencia.practica_id)
        self._verificar_acceso(usuario, estudiante, empresa)

        if incidencia.estado == EstadoIncidencia.CERRADA:
            raise HTTPException(status.HTTP_400_BAD_REQUEST, "La incidencia ya está cerrada")

        nombre = Path(archivo.filename or "archivo").name
        extension = Path(nombre).suffix.lower()
        if extension not in EXTENSIONES:
            raise HTTPException(status.HTTP_400_BAD_REQUEST,
                                f"Formato no permitido. Usa: {', '.join(sorted(EXTENSIONES))}")

        contenido = archivo.file.read(MAX_BYTES + 1)
        if len(contenido) > MAX_BYTES:
            raise HTTPException(status.HTTP_400_BAD_REQUEST, "El archivo supera los 5 MB")

        UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
        ruta = UPLOAD_DIR / f"{uuid.uuid4().hex}{extension}"  # nombre propio: evita choques y rutas raras
        ruta.write_bytes(contenido)

        evidencia = Evidencia(incidencia_id=incidencia_id, nombre_archivo=nombre[:200],
                              ruta_archivo=str(ruta))
        self.repo.add(evidencia)
        self.repo.commit()
        self.repo.refresh(evidencia)
        return evidencia

    def descargar(self, incidencia_id: int, evidencia_id: int, usuario: Usuario) -> tuple[Path, str]:
        self.obtener(incidencia_id, usuario)  # valida existencia y permisos
        evidencia = self.repo.get_evidencia(evidencia_id)
        if not evidencia or evidencia.incidencia_id != incidencia_id:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Evidencia no encontrada")
        ruta = Path(evidencia.ruta_archivo)
        if not ruta.exists():
            raise HTTPException(status.HTTP_404_NOT_FOUND, "El archivo ya no está disponible")
        return ruta, evidencia.nombre_archivo

    # RF14: el gestor gestiona -----------------------------------------
    def clasificar(self, incidencia_id: int, usuario: Usuario, data: ClasificarIn) -> Incidencia:
        incidencia = self._cargar(incidencia_id)
        self._validar_transicion(incidencia, EstadoIncidencia.EN_REVISION)

        gestor = self.usuarios.get_perfil(usuario)
        incidencia.gestor_id = gestor.id
        incidencia.tipo = data.tipo
        incidencia.gravedad = data.gravedad
        incidencia.estado = EstadoIncidencia.EN_REVISION

        notificar(self.repo.db, incidencia.reportada_por_id,
                  f"Tu incidencia #{incidencia.id} fue clasificada como '{data.tipo}' "
                  f"(gravedad {data.gravedad.value}) y está en revisión.")
        self.repo.commit()
        self.repo.refresh(incidencia)
        return incidencia

    def escalar(self, incidencia_id: int, motivo: str) -> Incidencia:
        incidencia = self._cargar(incidencia_id)
        self._validar_transicion(incidencia, EstadoIncidencia.ESCALADA)

        incidencia.estado = EstadoIncidencia.ESCALADA
        incidencia.motivo_escalamiento = motivo

        for coord_uid in self.repo.coordinadores_usuario_ids():
            notificar(self.repo.db, coord_uid,
                      f"La incidencia #{incidencia.id} fue escalada. Motivo: {motivo}")
        notificar(self.repo.db, incidencia.reportada_por_id,
                  f"Tu incidencia #{incidencia.id} fue escalada al coordinador.")
        self.repo.commit()
        self.repo.refresh(incidencia)
        return incidencia

    def cerrar(self, incidencia_id: int, resolucion: str) -> Incidencia:
        incidencia = self._cargar(incidencia_id)
        self._validar_transicion(incidencia, EstadoIncidencia.CERRADA)

        incidencia.estado = EstadoIncidencia.CERRADA
        incidencia.resolucion = resolucion

        _, _, _, estudiante, empresa = self._contexto(incidencia.practica_id)
        for uid in (estudiante.usuario_id, empresa.usuario_id):
            notificar(self.repo.db, uid,
                      f"La incidencia #{incidencia.id} fue cerrada. Resolución: {resolucion}")
        self.repo.commit()
        self.repo.refresh(incidencia)
        return incidencia

    # Auxiliares --------------------------------------------------------
    def _cargar(self, incidencia_id: int) -> Incidencia:
        incidencia = self.repo.get(incidencia_id)
        if not incidencia:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Incidencia no encontrada")
        return incidencia

    def _contexto(self, practica_id: int):
        fila = self.practicas.get_contexto(practica_id)
        if not fila:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Práctica no encontrada")
        return fila

    def _verificar_acceso(self, usuario: Usuario, estudiante, empresa) -> None:
        """Estudiante y empresa solo acceden a SU práctica; gestor y coordinador, a todas."""
        if usuario.rol in (Rol.GESTOR, Rol.COORDINADOR):
            return
        perfil = self.usuarios.get_perfil(usuario)
        if usuario.rol == Rol.ESTUDIANTE and perfil.id != estudiante.id:
            raise HTTPException(status.HTTP_403_FORBIDDEN, "Esta práctica no es tuya")
        if usuario.rol == Rol.EMPRESA and perfil.id != empresa.id:
            raise HTTPException(status.HTTP_403_FORBIDDEN, "Esta práctica pertenece a otra empresa")

    def _validar_transicion(self, incidencia: Incidencia, nuevo: EstadoIncidencia) -> None:
        if nuevo not in TRANSICIONES[incidencia.estado]:
            raise HTTPException(
                status.HTTP_400_BAD_REQUEST,
                f"No se puede pasar de '{incidencia.estado.value}' a '{nuevo.value}'",
            )