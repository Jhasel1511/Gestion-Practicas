from datetime import datetime

from sqlalchemy import DateTime, Enum, ForeignKey, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.enums import EstadoIncidencia, GravedadIncidencia


class Incidencia(Base):
    __tablename__ = "incidencia"

    id: Mapped[int] = mapped_column(primary_key=True)
    practica_id: Mapped[int] = mapped_column(ForeignKey("practica.id"), index=True)
    reportada_por_id: Mapped[int] = mapped_column(ForeignKey("usuario.id"))
    gestor_id: Mapped[int | None] = mapped_column(ForeignKey("gestor_incidencias.id"), nullable=True)
    descripcion: Mapped[str] = mapped_column(Text)
    tipo: Mapped[str | None] = mapped_column(String(80), nullable=True)
    gravedad: Mapped[GravedadIncidencia | None] = mapped_column(Enum(GravedadIncidencia), nullable=True)
    estado: Mapped[EstadoIncidencia] = mapped_column(Enum(EstadoIncidencia), default=EstadoIncidencia.ABIERTA)
    motivo_escalamiento: Mapped[str] = mapped_column(Text, default="")
    resolucion: Mapped[str] = mapped_column(Text, default="")
    creada_en: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    evidencias: Mapped[list["Evidencia"]] = relationship(
        back_populates="incidencia", order_by="Evidencia.id"
    )


class Evidencia(Base):
    __tablename__ = "evidencia"

    id: Mapped[int] = mapped_column(primary_key=True)
    incidencia_id: Mapped[int] = mapped_column(ForeignKey("incidencia.id"), index=True)
    nombre_archivo: Mapped[str] = mapped_column(String(200))
    ruta_archivo: Mapped[str] = mapped_column(String(300))

    incidencia: Mapped[Incidencia] = relationship(back_populates="evidencias")