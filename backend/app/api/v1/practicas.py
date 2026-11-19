from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_db, require_role
from app.models import Usuario
from app.models.enums import EstadoPractica, Rol
from app.repositories.practica_repository import PracticaRepository
from app.repositories.usuario_repository import UsuarioRepository
from app.schemas.postulacion import PracticaOut
from app.schemas.practica import AprobacionIn, RechazoIn
from app.services.practica_service import PracticaService

router = APIRouter(prefix="/practicas", tags=["Prácticas"])


def get_service(db: Session = Depends(get_db)) -> PracticaService:
    return PracticaService(PracticaRepository(db), UsuarioRepository(db))


@router.get("", response_model=list[PracticaOut])
def listar(estado: EstadoPractica | None = None,
           _: Usuario = Depends(require_role(Rol.COORDINADOR)),
           svc: PracticaService = Depends(get_service)):
    return svc.listar(estado)


@router.patch("/{practica_id}/aprobar", response_model=PracticaOut)
def aprobar(practica_id: int, data: AprobacionIn,
            user: Usuario = Depends(require_role(Rol.COORDINADOR)),
            svc: PracticaService = Depends(get_service)):
    return svc.aprobar(practica_id, user, data.observaciones, data.fecha_inicio)


@router.patch("/{practica_id}/rechazar", response_model=PracticaOut)
def rechazar(practica_id: int, data: RechazoIn,
             user: Usuario = Depends(require_role(Rol.COORDINADOR)),
             svc: PracticaService = Depends(get_service)):
    return svc.rechazar(practica_id, user, data.observaciones)

@router.get("/mias", response_model=list[PracticaOut])
def mias(user: Usuario = Depends(require_role(Rol.ESTUDIANTE, Rol.EMPRESA)),
         svc: PracticaService = Depends(get_service)):
    return svc.mias(user)