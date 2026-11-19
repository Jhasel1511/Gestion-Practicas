from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class Notificacion(Base):
    __tablename__ = "notificacion"

    id: Mapped[int] = mapped_column(primary_key=True)
    usuario_id: Mapped[int] = mapped_column(ForeignKey("usuario.id"), index=True)
    mensaje: Mapped[str] = mapped_column(String(300))
    leida: Mapped[bool] = mapped_column(default=False)
    creada_en: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())