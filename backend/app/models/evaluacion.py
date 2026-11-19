from datetime import date

from sqlalchemy import Enum, Float, ForeignKey, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base
from app.models.enums import TipoEvaluacion


class Evaluacion(Base):
    __tablename__ = "evaluacion"
    __table_args__ = (
        UniqueConstraint("practica_id", "tipo", name="uq_evaluacion_practica_tipo"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    practica_id: Mapped[int] = mapped_column(ForeignKey("practica.id"), index=True)
    tipo: Mapped[TipoEvaluacion] = mapped_column(Enum(TipoEvaluacion))
    calificacion: Mapped[float] = mapped_column(Float)
    comentarios: Mapped[str] = mapped_column(Text, default="")


class Certificado(Base):
    __tablename__ = "certificado"

    id: Mapped[int] = mapped_column(primary_key=True)
    practica_id: Mapped[int] = mapped_column(ForeignKey("practica.id"), unique=True)
    coordinador_id: Mapped[int] = mapped_column(ForeignKey("coordinador.id"))
    fecha_emision: Mapped[date] = mapped_column()