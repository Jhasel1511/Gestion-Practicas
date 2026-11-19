from datetime import date, datetime

from sqlalchemy import DateTime, Enum, ForeignKey, Integer, Text, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base
from app.models.enums import EstadoPostulacion, EstadoPractica


class Postulacion(Base):
    __tablename__ = "postulacion"
    __table_args__ = (
        UniqueConstraint("vacante_id", "estudiante_id", name="uq_postulacion_vacante_estudiante"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    vacante_id: Mapped[int] = mapped_column(ForeignKey("vacante.id"))
    estudiante_id: Mapped[int] = mapped_column(ForeignKey("estudiante.id"))
    fecha_postulacion: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    estado: Mapped[EstadoPostulacion] = mapped_column(
        Enum(EstadoPostulacion), default=EstadoPostulacion.POSTULADA
    )


class Practica(Base):
    __tablename__ = "practica"

    id: Mapped[int] = mapped_column(primary_key=True)
    postulacion_id: Mapped[int] = mapped_column(ForeignKey("postulacion.id"), unique=True)
    coordinador_id: Mapped[int | None] = mapped_column(ForeignKey("coordinador.id"), nullable=True)
    fecha_inicio: Mapped[date | None] = mapped_column(nullable=True)
    horas_requeridas: Mapped[int] = mapped_column(Integer)
    estado: Mapped[EstadoPractica] = mapped_column(Enum(EstadoPractica), default=EstadoPractica.POSTULADA)
    observaciones: Mapped[str] = mapped_column(Text, default="")