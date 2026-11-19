from datetime import datetime

from pydantic import BaseModel, Field

from app.models.enums import EstadoVacante


class VacanteBase(BaseModel):
    titulo: str = Field(min_length=3, max_length=150)
    area: str
    descripcion: str = ""
    duracion_semanas: int = Field(gt=0)
    horas_exigidas: int = Field(gt=0)
    creditos_minimos: int = Field(ge=0, default=0)
    promedio_minimo: float = Field(ge=0, le=5, default=0)
    perfil_requerido: str = ""


class VacanteCreate(VacanteBase):
    pass


class VacanteUpdate(BaseModel):
    titulo: str | None = None
    area: str | None = None
    descripcion: str | None = None
    duracion_semanas: int | None = None
    horas_exigidas: int | None = None
    creditos_minimos: int | None = None
    promedio_minimo: float | None = None
    perfil_requerido: str | None = None


class VacanteOut(VacanteBase):
    id: int
    empresa_id: int
    estado: EstadoVacante
    creada_en: datetime | None = None

    model_config = {"from_attributes": True}


class ElegibilidadOut(BaseModel):
    elegible: bool
    motivos: list[str] = []