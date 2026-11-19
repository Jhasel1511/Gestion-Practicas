from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_db, require_role
from app.models import Usuario
from app.models.enums import Rol
from app.repositories.postulacion_repository import PostulacionRepository
from app.repositories.usuario_repository import UsuarioRepository
from app.repositories.vacante_repository import VacanteRepository
from app.schemas.postulacion import PostulacionCreate, PostulacionOut, PostulanteOut, PracticaOut
from app.services.postulacion_service import PostulacionService

router = APIRouter(prefix="/postulaciones", tags=["Postulaciones"])
vacantes_router = APIRouter(prefix="/vacantes", tags=["Postulaciones"])


def get_service(db: Session = Depends(get_db)) -> PostulacionService:
    return PostulacionService(
        PostulacionRepository(db), VacanteRepository(db), UsuarioRepository(db)
    )


@router.post("", response_model=PostulacionOut, status_code=201)
def postular(data: PostulacionCreate, user: Usuario = Depends(require_role(Rol.ESTUDIANTE)),
             svc: PostulacionService = Depends(get_service)):
    return svc.postular(data.vacante_id, user)


@router.get("/mias", response_model=list[PostulacionOut])
def mis_postulaciones(user: Usuario = Depends(require_role(Rol.ESTUDIANTE)),
                      svc: PostulacionService = Depends(get_service)):
    return svc.mis_postulaciones(user)


@router.patch("/{postulacion_id}/seleccionar", response_model=PracticaOut)
def seleccionar(postulacion_id: int, user: Usuario = Depends(require_role(Rol.EMPRESA)),
                svc: PostulacionService = Depends(get_service)):
    return svc.seleccionar(postulacion_id, user)


@vacantes_router.get("/{vacante_id}/postulaciones", response_model=list[PostulanteOut])
def postulantes(vacante_id: int, user: Usuario = Depends(require_role(Rol.EMPRESA)),
                svc: PostulacionService = Depends(get_service)):
    return svc.listar_postulantes(vacante_id, user)