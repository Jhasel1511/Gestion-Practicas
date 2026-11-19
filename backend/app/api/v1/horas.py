from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db, require_role
from app.models import Usuario
from app.models.enums import Rol
from app.repositories.horas_repository import HorasRepository
from app.repositories.practica_repository import PracticaRepository
from app.repositories.usuario_repository import UsuarioRepository
from app.schemas.horas import HorasCreate, HorasOut, ProgresoOut
from app.services.horas_service import HorasService

router = APIRouter(tags=["Horas"])


def get_service(db: Session = Depends(get_db)) -> HorasService:
    return HorasService(HorasRepository(db), PracticaRepository(db), UsuarioRepository(db))


@router.post("/practicas/{practica_id}/horas", response_model=HorasOut, status_code=201)
def registrar(practica_id: int, data: HorasCreate,
              user: Usuario = Depends(require_role(Rol.ESTUDIANTE)),
              svc: HorasService = Depends(get_service)):
    return svc.registrar(practica_id, user, data)


@router.get("/practicas/{practica_id}/horas", response_model=list[HorasOut])
def listar(practica_id: int, user: Usuario = Depends(get_current_user),
           svc: HorasService = Depends(get_service)):
    return svc.listar(practica_id, user)


@router.get("/practicas/{practica_id}/progreso", response_model=ProgresoOut)
def progreso(practica_id: int, user: Usuario = Depends(get_current_user),
             svc: HorasService = Depends(get_service)):
    return svc.progreso(practica_id, user)


@router.patch("/horas/{registro_id}/confirmar", response_model=HorasOut)
def confirmar(registro_id: int, user: Usuario = Depends(require_role(Rol.EMPRESA)),
              svc: HorasService = Depends(get_service)):
    return svc.decidir(registro_id, user, confirmar=True)


@router.patch("/horas/{registro_id}/rechazar", response_model=HorasOut)
def rechazar(registro_id: int, user: Usuario = Depends(require_role(Rol.EMPRESA)),
             svc: HorasService = Depends(get_service)):
    return svc.decidir(registro_id, user, confirmar=False)