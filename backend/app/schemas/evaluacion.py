from datetime import date

from pydantic import BaseModel, Field

from app.models.enums import TipoEvaluacion


class EvaluacionCreate(BaseModel):
    calificacion: float = Field(ge=0, le=5)
    comentarios: str = ""


class EvaluacionOut(BaseModel):
    id: int
    practica_id: int
    tipo: TipoEvaluacion
    calificacion: float
    comentarios: str = ""

    model_config = {"from_attributes": True}


class CertificadoOut(BaseModel):
    id: int
    practica_id: int
    coordinador_id: int
    fecha_emision: date
    estudiante_nombre: str
    empresa_nombre: str
    vacante_titulo: str
    horas_totales: float