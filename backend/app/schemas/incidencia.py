from datetime import datetime

from pydantic import BaseModel, Field

from app.models.enums import EstadoIncidencia, GravedadIncidencia


class IncidenciaCreate(BaseModel):
    practica_id: int
    descripcion: str = Field(min_length=10)


class ClasificarIn(BaseModel):
    tipo: str = Field(min_length=3, max_length=80)
    gravedad: GravedadIncidencia


class EscalarIn(BaseModel):
    motivo: str = Field(min_length=5)


class CerrarIn(BaseModel):
    resolucion: str = Field(min_length=5)


class EvidenciaOut(BaseModel):
    id: int
    nombre_archivo: str

    model_config = {"from_attributes": True}


class IncidenciaOut(BaseModel):
    id: int
    practica_id: int
    reportada_por_id: int
    gestor_id: int | None = None
    descripcion: str
    tipo: str | None = None
    gravedad: GravedadIncidencia | None = None
    estado: EstadoIncidencia
    motivo_escalamiento: str = ""
    resolucion: str = ""
    creada_en: datetime | None = None
    evidencias: list[EvidenciaOut] = []

    model_config = {"from_attributes": True}