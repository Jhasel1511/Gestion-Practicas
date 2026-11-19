from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models import Usuario
from app.repositories.notificacion_repository import NotificacionRepository
from app.schemas.notificacion import NotificacionOut
from app.services.notificacion_service import NotificacionService

router = APIRouter(prefix="/notificaciones", tags=["Notificaciones"])


def get_service(db: Session = Depends(get_db)) -> NotificacionService:
    return NotificacionService(NotificacionRepository(db))


@router.get("/mias", response_model=list[NotificacionOut])
def mias(solo_no_leidas: bool = False, user: Usuario = Depends(get_current_user),
         svc: NotificacionService = Depends(get_service)):
    return svc.listar(user, solo_no_leidas)


@router.get("/conteo")
def conteo(user: Usuario = Depends(get_current_user),
           svc: NotificacionService = Depends(get_service)):
    """Para el numerito de la campana en el frontend."""
    return {"no_leidas": svc.conteo(user)}


@router.patch("/leer-todas")
def leer_todas(user: Usuario = Depends(get_current_user),
               svc: NotificacionService = Depends(get_service)):
    return {"marcadas": svc.marcar_todas(user)}


@router.patch("/{notificacion_id}/leer", response_model=NotificacionOut)
def leer(notificacion_id: int, user: Usuario = Depends(get_current_user),
         svc: NotificacionService = Depends(get_service)):
    return svc.marcar_leida(notificacion_id, user)