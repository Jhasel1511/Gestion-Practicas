from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db, require_role
from app.models import Usuario
from app.models.enums import Rol
from app.repositories.evaluacion_repository import EvaluacionRepository
from app.repositories.horas_repository import HorasRepository
from app.repositories.practica_repository import PracticaRepository
from app.repositories.usuario_repository import UsuarioRepository
from app.schemas.evaluacion import CertificadoOut, EvaluacionCreate, EvaluacionOut
from app.services.evaluacion_service import EvaluacionService

router = APIRouter(tags=["Evaluación y cierre"])


def get_service(db: Session = Depends(get_db)) -> EvaluacionService:
    return EvaluacionService(EvaluacionRepository(db), HorasRepository(db),
                             PracticaRepository(db), UsuarioRepository(db))


@router.post("/practicas/{practica_id}/evaluaciones", response_model=EvaluacionOut, status_code=201)
def evaluar(practica_id: int, data: EvaluacionCreate,
            user: Usuario = Depends(require_role(Rol.ESTUDIANTE, Rol.EMPRESA)),
            svc: EvaluacionService = Depends(get_service)):
    return svc.evaluar(practica_id, user, data)


@router.get("/practicas/{practica_id}/evaluaciones", response_model=list[EvaluacionOut])
def listar(practica_id: int, user: Usuario = Depends(get_current_user),
           svc: EvaluacionService = Depends(get_service)):
    return svc.listar(practica_id, user)


@router.post("/practicas/{practica_id}/certificado", response_model=CertificadoOut, status_code=201)
def emitir_certificado(practica_id: int, user: Usuario = Depends(require_role(Rol.COORDINADOR)),
                       svc: EvaluacionService = Depends(get_service)):
    return svc.emitir_certificado(practica_id, user)


@router.get("/practicas/{practica_id}/certificado", response_model=CertificadoOut)
def ver_certificado(practica_id: int, user: Usuario = Depends(get_current_user),
                    svc: EvaluacionService = Depends(get_service)):
    return svc.obtener_certificado(practica_id, user)