from datetime import date

from fastapi import HTTPException, status

from app.models import Practica, Usuario
from app.models.enums import EstadoPostulacion, EstadoPractica, EstadoVacante
from app.notifications.service import notificar
from app.repositories.practica_repository import PracticaRepository
from app.repositories.usuario_repository import UsuarioRepository
from app.models.enums import EstadoPostulacion, EstadoPractica, EstadoVacante, Rol

# Máquina de estados: desde cada estado, a cuáles se puede pasar
TRANSICIONES = {
    EstadoPractica.POSTULADA: {EstadoPractica.APROBADA, EstadoPractica.RECHAZADA},
    EstadoPractica.APROBADA: {EstadoPractica.EN_CURSO},
    EstadoPractica.EN_CURSO: {EstadoPractica.CERRADA},
    EstadoPractica.RECHAZADA: set(),
    EstadoPractica.CERRADA: set(),
}


class PracticaService:
    def __init__(self, repo: PracticaRepository, usuarios: UsuarioRepository):
        self.repo = repo
        self.usuarios = usuarios

    def listar(self, estado: EstadoPractica | None = None) -> list[Practica]:
        return self.repo.list(estado)

    # RF08 y RF09 ------------------------------------------------------
    def aprobar(self, practica_id: int, usuario: Usuario, observaciones: str,
                fecha_inicio: date | None) -> Practica:
        practica, _, vacante, estudiante, empresa = self._contexto(practica_id)
        self._validar_transicion(practica, EstadoPractica.APROBADA)

        coordinador = self.usuarios.get_perfil(usuario)
        practica.estado = EstadoPractica.APROBADA
        practica.coordinador_id = coordinador.id
        practica.fecha_inicio = fecha_inicio or date.today()
        practica.observaciones = observaciones

        notificar(self.repo.db, estudiante.usuario_id,
                  f"Tu práctica en {empresa.nombre} ({vacante.titulo}) fue aprobada.")
        notificar(self.repo.db, empresa.usuario_id,
                  f"La práctica de {estudiante.nombre} fue aprobada por el coordinador.")
        self.repo.commit()
        self.repo.refresh(practica)
        return practica

    def rechazar(self, practica_id: int, usuario: Usuario, observaciones: str) -> Practica:
        practica, postulacion, vacante, estudiante, empresa = self._contexto(practica_id)
        self._validar_transicion(practica, EstadoPractica.RECHAZADA)

        coordinador = self.usuarios.get_perfil(usuario)
        practica.estado = EstadoPractica.RECHAZADA
        practica.coordinador_id = coordinador.id
        practica.observaciones = observaciones

        # La vacante se reabre y las demás postulaciones vuelven a competir
        postulacion.estado = EstadoPostulacion.DESCARTADA
        vacante.estado = EstadoVacante.ACTIVA
        for otra in self.repo.otras_postulaciones(vacante.id, postulacion.id):
            otra.estado = EstadoPostulacion.POSTULADA

        notificar(self.repo.db, estudiante.usuario_id,
                  f"Tu práctica en {empresa.nombre} fue rechazada. Observaciones: {observaciones}")
        notificar(self.repo.db, empresa.usuario_id,
                  f"La práctica de {estudiante.nombre} fue rechazada. La vacante '{vacante.titulo}' "
                  f"volvió a estar activa.")
        self.repo.commit()
        self.repo.refresh(practica)
        return practica
    
    def mias(self, usuario: Usuario) -> list[Practica]:
        perfil = self.usuarios.get_perfil(usuario)
        if usuario.rol == Rol.ESTUDIANTE:
            return self.repo.list_by_estudiante(perfil.id)
        return self.repo.list_by_empresa(perfil.id)

    # Auxiliares 
    def _contexto(self, practica_id: int):
        fila = self.repo.get_contexto(practica_id)
        if not fila:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Práctica no encontrada")
        return fila

    def _validar_transicion(self, practica: Practica, nuevo: EstadoPractica) -> None:
        if nuevo not in TRANSICIONES[practica.estado]:
            raise HTTPException(
                status.HTTP_400_BAD_REQUEST,
                f"No se puede pasar de '{practica.estado.value}' a '{nuevo.value}'",
            )