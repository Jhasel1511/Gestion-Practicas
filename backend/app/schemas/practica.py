from datetime import date

from pydantic import BaseModel, Field


class AprobacionIn(BaseModel):
    observaciones: str = ""
    fecha_inicio: date | None = None


class RechazoIn(BaseModel):
    observaciones: str = Field(min_length=5)  # obligatorias al rechazar