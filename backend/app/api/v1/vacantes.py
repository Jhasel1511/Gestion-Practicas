from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db, require_role
from app.models import Usuario
from app.models.enums import EstadoVacante, Rol
from app.repositories.usuario_repository import UsuarioRepository
from app.repositories.vacante_repository import VacanteRepository
from app.schemas.vacante import ElegibilidadOut, VacanteCreate, VacanteOut, VacanteUpdate
from app.services.vacante_service import VacanteService

router = APIRouter(prefix="/vacantes", tags=["Vacantes"])


def get_service(db: Session = Depends(get_db)) -> VacanteService:
    return VacanteService(VacanteRepository(db), UsuarioRepository(db))


@router.get("", response_model=list[VacanteOut])
def listar(area: str | None = None, estado: EstadoVacante | None = None,
           skip: int = 0, limit: int = 50,
           user: Usuario = Depends(get_current_user),
           svc: VacanteService = Depends(get_service)):
    return svc.listar(user, area, estado, skip, limit)


@router.post("", response_model=VacanteOut, status_code=201)
def crear(data: VacanteCreate, user: Usuario = Depends(require_role(Rol.EMPRESA)),
          svc: VacanteService = Depends(get_service)):
    return svc.crear(data, user)


@router.get("/{vacante_id}", response_model=VacanteOut)
def detalle(vacante_id: int, _: Usuario = Depends(get_current_user),
            svc: VacanteService = Depends(get_service)):
    return svc.obtener(vacante_id)


@router.put("/{vacante_id}", response_model=VacanteOut)
def editar(vacante_id: int, data: VacanteUpdate,
           user: Usuario = Depends(require_role(Rol.EMPRESA)),
           svc: VacanteService = Depends(get_service)):
    return svc.editar(vacante_id, data, user)


@router.patch("/{vacante_id}/aprobar", response_model=VacanteOut)
def aprobar(vacante_id: int, _: Usuario = Depends(require_role(Rol.COORDINADOR)),
            svc: VacanteService = Depends(get_service)):
    return svc.revisar(vacante_id, aprobar=True)


@router.patch("/{vacante_id}/rechazar", response_model=VacanteOut)
def rechazar(vacante_id: int, _: Usuario = Depends(require_role(Rol.COORDINADOR)),
             svc: VacanteService = Depends(get_service)):
    return svc.revisar(vacante_id, aprobar=False)


@router.get("/{vacante_id}/elegibilidad", response_model=ElegibilidadOut)
def elegibilidad(vacante_id: int, user: Usuario = Depends(require_role(Rol.ESTUDIANTE)),
                 svc: VacanteService = Depends(get_service)):
    return svc.elegibilidad(vacante_id, user)