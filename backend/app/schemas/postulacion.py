from datetime import date, datetime

from pydantic import BaseModel

from app.models.enums import EstadoPostulacion, EstadoPractica


class PostulacionCreate(BaseModel):
    vacante_id: int


class PostulacionOut(BaseModel):
    id: int
    vacante_id: int
    estudiante_id: int
    fecha_postulacion: datetime | None = None
    estado: EstadoPostulacion

    model_config = {"from_attributes": True}


class PostulanteOut(BaseModel):
    """Lo que ve la empresa: la postulación + datos del estudiante."""
    postulacion_id: int
    estado: EstadoPostulacion
    fecha_postulacion: datetime | None = None
    estudiante_id: int
    estudiante_nombre: str
    creditos_cursados: int
    promedio: float
    semestre: int


class PracticaOut(BaseModel):
    id: int
    postulacion_id: int
    coordinador_id: int | None = None
    fecha_inicio: date | None = None
    horas_requeridas: int
    estado: EstadoPractica
    observaciones: str = ""

    model_config = {"from_attributes": True}
    