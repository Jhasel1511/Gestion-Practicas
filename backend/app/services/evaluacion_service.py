from datetime import date

from fastapi import HTTPException, status

from app.models import Certificado, Evaluacion, Usuario
from app.models.enums import EstadoHoras, EstadoPractica, Rol, TipoEvaluacion
from app.notifications.service import notificar
from app.repositories.evaluacion_repository import EvaluacionRepository
from app.repositories.horas_repository import HorasRepository
from app.repositories.practica_repository import PracticaRepository
from app.repositories.usuario_repository import UsuarioRepository
from app.schemas.evaluacion import CertificadoOut, EvaluacionCreate
from app.services.practica_service import TRANSICIONES


class EvaluacionService:
    def __init__(self, repo: EvaluacionRepository, horas: HorasRepository,
                 practicas: PracticaRepository, usuarios: UsuarioRepository):
        self.repo = repo
        self.horas = horas
        self.practicas = practicas
        self.usuarios = usuarios

    # RF15 y RF16: evaluar -----------------------------------------------
    def evaluar(self, practica_id: int, usuario: Usuario, data: EvaluacionCreate) -> Evaluacion:
        practica, _, _, estudiante, empresa = self._contexto(practica_id)
        self._verificar_acceso(usuario, estudiante, empresa)

        if practica.estado != EstadoPractica.EN_CURSO:
            raise HTTPException(status.HTTP_400_BAD_REQUEST, "Solo se evalúan prácticas en curso")
        if not self._horas_completas(practica):
            raise HTTPException(status.HTTP_400_BAD_REQUEST,
                                "Aún no se completa el 100 % de las horas confirmadas")

        es_estudiante = usuario.rol == Rol.ESTUDIANTE
        tipo = (TipoEvaluacion.ESTUDIANTE_A_EMPRESA if es_estudiante
                else TipoEvaluacion.EMPRESA_A_ESTUDIANTE)
        contrario = (TipoEvaluacion.EMPRESA_A_ESTUDIANTE if es_estudiante
                     else TipoEvaluacion.ESTUDIANTE_A_EMPRESA)

        if self.repo.get_by_practica_tipo(practica_id, tipo):
            raise HTTPException(status.HTTP_409_CONFLICT, "Ya enviaste tu evaluación de esta práctica")

        evaluacion = Evaluacion(practica_id=practica_id, tipo=tipo,
                                calificacion=data.calificacion, comentarios=data.comentarios)
        self.repo.add(evaluacion)

        quien = estudiante.nombre if es_estudiante else empresa.nombre
        otra_parte = empresa.usuario_id if es_estudiante else estudiante.usuario_id
        notificar(self.repo.db, otra_parte, f"{quien} completó su evaluación de la práctica.")

        # Si la otra parte ya evaluó, avisa a los coordinadores que se puede certificar
        if self.repo.get_by_practica_tipo(practica_id, contrario):
            for coord_uid in self.repo.coordinadores_usuario_ids():
                notificar(self.repo.db, coord_uid,
                          f"La práctica de {estudiante.nombre} en {empresa.nombre} tiene ambas "
                          f"evaluaciones y está lista para certificar.")

        self.repo.commit()
        self.repo.refresh(evaluacion)
        return evaluacion

    def listar(self, practica_id: int, usuario: Usuario) -> list[Evaluacion]:
        _, _, _, estudiante, empresa = self._contexto(practica_id)
        self._verificar_acceso(usuario, estudiante, empresa)
        return self.repo.list_by_practica(practica_id)

    # RF17: certificado de cierre ----------------------------------------
    def emitir_certificado(self, practica_id: int, usuario: Usuario) -> CertificadoOut:
        practica, _, vacante, estudiante, empresa = self._contexto(practica_id)

        if self.repo.get_certificado(practica_id):
            raise HTTPException(status.HTTP_409_CONFLICT, "Esta práctica ya tiene certificado")
        if not self._horas_completas(practica):
            raise HTTPException(status.HTTP_400_BAD_REQUEST,
                                "Aún no se completa el 100 % de las horas confirmadas")

        hechas = {e.tipo for e in self.repo.list_by_practica(practica_id)}
        faltan = [t.value for t in TipoEvaluacion if t not in hechas]
        if faltan:
            raise HTTPException(status.HTTP_400_BAD_REQUEST,
                                f"Faltan evaluaciones: {', '.join(faltan)}")

        if EstadoPractica.CERRADA not in TRANSICIONES[practica.estado]:
            raise HTTPException(status.HTTP_400_BAD_REQUEST,
                                f"No se puede pasar de '{practica.estado.value}' a 'cerrada'")

        coordinador = self.usuarios.get_perfil(usuario)
        certificado = Certificado(practica_id=practica_id, coordinador_id=coordinador.id,
                                  fecha_emision=date.today())
        self.repo.add(certificado)
        practica.estado = EstadoPractica.CERRADA

        for uid in (estudiante.usuario_id, empresa.usuario_id):
            notificar(self.repo.db, uid,
                      f"Se emitió el certificado de cierre de la práctica de {estudiante.nombre} "
                      f"en {empresa.nombre}.")
        self.repo.commit()
        self.repo.refresh(certificado)
        return self._armar_certificado(certificado, practica, vacante, estudiante, empresa)

    def obtener_certificado(self, practica_id: int, usuario: Usuario) -> CertificadoOut:
        practica, _, vacante, estudiante, empresa = self._contexto(practica_id)
        self._verificar_acceso(usuario, estudiante, empresa)
        certificado = self.repo.get_certificado(practica_id)
        if not certificado:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Esta práctica aún no tiene certificado")
        return self._armar_certificado(certificado, practica, vacante, estudiante, empresa)

    # Auxiliares ------------------------------------------------------------
    def _armar_certificado(self, certificado, practica, vacante, estudiante, empresa) -> CertificadoOut:
        return CertificadoOut(
            id=certificado.id,
            practica_id=certificado.practica_id,
            coordinador_id=certificado.coordinador_id,
            fecha_emision=certificado.fecha_emision,
            estudiante_nombre=estudiante.nombre,
            empresa_nombre=empresa.nombre,
            vacante_titulo=vacante.titulo,
            horas_totales=self.horas.suma(practica.id, [EstadoHoras.CONFIRMADA]),
        )

    def _horas_completas(self, practica) -> bool:
        confirmadas = self.horas.suma(practica.id, [EstadoHoras.CONFIRMADA])
        return practica.horas_requeridas > 0 and confirmadas >= practica.horas_requeridas

    def _contexto(self, practica_id: int):
        fila = self.practicas.get_contexto(practica_id)
        if not fila:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Práctica no encontrada")
        return fila

    def _verificar_acceso(self, usuario: Usuario, estudiante, empresa) -> None:
        """Estudiante y empresa solo acceden a SU práctica; coordinador y gestor, a todas."""
        if usuario.rol in (Rol.COORDINADOR, Rol.GESTOR):
            return
        perfil = self.usuarios.get_perfil(usuario)
        if usuario.rol == Rol.ESTUDIANTE and perfil.id != estudiante.id:
            raise HTTPException(status.HTTP_403_FORBIDDEN, "Esta práctica no es tuya")
        if usuario.rol == Rol.EMPRESA and perfil.id != empresa.id:
            raise HTTPException(status.HTTP_403_FORBIDDEN, "Esta práctica pertenece a otra empresa")