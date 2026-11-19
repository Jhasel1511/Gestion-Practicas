from fastapi import APIRouter, Depends, File, UploadFile
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db, require_role
from app.models import Usuario
from app.models.enums import EstadoIncidencia, Rol
from app.repositories.incidencia_repository import IncidenciaRepository
from app.repositories.practica_repository import PracticaRepository
from app.repositories.usuario_repository import UsuarioRepository
from app.schemas.incidencia import (
    CerrarIn, ClasificarIn, EscalarIn, EvidenciaOut, IncidenciaCreate, IncidenciaOut,
)
from app.services.incidencia_service import IncidenciaService

router = APIRouter(prefix="/incidencias", tags=["Incidencias"])


def get_service(db: Session = Depends(get_db)) -> IncidenciaService:
    return IncidenciaService(IncidenciaRepository(db), PracticaRepository(db), UsuarioRepository(db))


@router.post("", response_model=IncidenciaOut, status_code=201)
def registrar(data: IncidenciaCreate,
              user: Usuario = Depends(require_role(Rol.ESTUDIANTE, Rol.EMPRESA)),
              svc: IncidenciaService = Depends(get_service)):
    return svc.registrar(data, user)


@router.get("", response_model=list[IncidenciaOut])
def listar(estado: EstadoIncidencia | None = None,
           user: Usuario = Depends(get_current_user),
           svc: IncidenciaService = Depends(get_service)):
    return svc.listar(user, estado)


@router.get("/{incidencia_id}", response_model=IncidenciaOut)
def detalle(incidencia_id: int, user: Usuario = Depends(get_current_user),
            svc: IncidenciaService = Depends(get_service)):
    return svc.obtener(incidencia_id, user)


@router.post("/{incidencia_id}/evidencias", response_model=EvidenciaOut, status_code=201)
def subir_evidencia(incidencia_id: int, archivo: UploadFile = File(...),
                    user: Usuario = Depends(require_role(Rol.ESTUDIANTE, Rol.EMPRESA)),
                    svc: IncidenciaService = Depends(get_service)):
    return svc.subir_evidencia(incidencia_id, user, archivo)


@router.get("/{incidencia_id}/evidencias/{evidencia_id}")
def descargar_evidencia(incidencia_id: int, evidencia_id: int,
                        user: Usuario = Depends(get_current_user),
                        svc: IncidenciaService = Depends(get_service)):
    ruta, nombre = svc.descargar(incidencia_id, evidencia_id, user)
    return FileResponse(ruta, filename=nombre)


@router.patch("/{incidencia_id}/clasificar", response_model=IncidenciaOut)
def clasificar(incidencia_id: int, data: ClasificarIn,
               user: Usuario = Depends(require_role(Rol.GESTOR)),
               svc: IncidenciaService = Depends(get_service)):
    return svc.clasificar(incidencia_id, user, data)


@router.patch("/{incidencia_id}/escalar", response_model=IncidenciaOut)
def escalar(incidencia_id: int, data: EscalarIn,
            _: Usuario = Depends(require_role(Rol.GESTOR)),
            svc: IncidenciaService = Depends(get_service)):
    return svc.escalar(incidencia_id, data.motivo)


@router.patch("/{incidencia_id}/cerrar", response_model=IncidenciaOut)
def cerrar(incidencia_id: int, data: CerrarIn,
           _: Usuario = Depends(require_role(Rol.GESTOR)),
           svc: IncidenciaService = Depends(get_service)):
    return svc.cerrar(incidencia_id, data.resolucion)