from datetime import datetime

from pydantic import BaseModel


class NotificacionOut(BaseModel):
    id: int
    mensaje: str
    leida: bool
    creada_en: datetime | None = None

    model_config = {"from_attributes": True}