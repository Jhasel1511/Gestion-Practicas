from fastapi import HTTPException, status

from app.models import Notificacion, Usuario
from app.repositories.notificacion_repository import NotificacionRepository


class NotificacionService:
    def __init__(self, repo: NotificacionRepository):
        self.repo = repo

    def listar(self, usuario: Usuario, solo_no_leidas: bool = False) -> list[Notificacion]:
        return self.repo.list_by_usuario(usuario.id, solo_no_leidas)

    def conteo(self, usuario: Usuario) -> int:
        return self.repo.contar_no_leidas(usuario.id)

    def marcar_leida(self, notificacion_id: int, usuario: Usuario) -> Notificacion:
        notificacion = self.repo.get(notificacion_id)
        # Si es de otro usuario respondemos 404, para no revelar que existe
        if not notificacion or notificacion.usuario_id != usuario.id:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Notificación no encontrada")
        notificacion.leida = True
        self.repo.commit()
        self.repo.refresh(notificacion)
        return notificacion

    def marcar_todas(self, usuario: Usuario) -> int:
        return self.repo.marcar_todas(usuario.id)