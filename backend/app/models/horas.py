from datetime import date

from sqlalchemy import Enum, Float, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base
from app.models.enums import EstadoHoras


class RegistroHoras(Base):
    __tablename__ = "registro_horas"

    id: Mapped[int] = mapped_column(primary_key=True)
    practica_id: Mapped[int] = mapped_column(ForeignKey("practica.id"), index=True)
    fecha: Mapped[date] = mapped_column()
    horas: Mapped[float] = mapped_column(Float)
    estado_confirmacion: Mapped[EstadoHoras] = mapped_column(
        Enum(EstadoHoras), default=EstadoHoras.PENDIENTE
    )