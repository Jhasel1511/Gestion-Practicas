from datetime import date

from pydantic import BaseModel, Field

from app.models.enums import EstadoHoras


class HorasCreate(BaseModel):
    fecha: date
    horas: float = Field(gt=0, le=12)


class HorasOut(BaseModel):
    id: int
    practica_id: int
    fecha: date
    horas: float
    estado_confirmacion: EstadoHoras

    model_config = {"from_attributes": True}


class ProgresoOut(BaseModel):
    practica_id: int
    horas_requeridas: int
    horas_confirmadas: float
    horas_pendientes: float
    porcentaje: float
    completada: bool