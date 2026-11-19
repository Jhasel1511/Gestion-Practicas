from datetime import datetime

from sqlalchemy import DateTime, Enum, Float, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.enums import EstadoVacante
from app.models.usuarios import Empresa


class Vacante(Base):
    __tablename__ = "vacante"

    id: Mapped[int] = mapped_column(primary_key=True)
    empresa_id: Mapped[int] = mapped_column(ForeignKey("empresa.id"))
    titulo: Mapped[str] = mapped_column(String(150))
    area: Mapped[str] = mapped_column(String(100), index=True)
    descripcion: Mapped[str] = mapped_column(Text, default="")
    duracion_semanas: Mapped[int] = mapped_column(Integer)
    horas_exigidas: Mapped[int] = mapped_column(Integer)
    creditos_minimos: Mapped[int] = mapped_column(Integer, default=0)
    promedio_minimo: Mapped[float] = mapped_column(Float, default=0.0)
    perfil_requerido: Mapped[str] = mapped_column(Text, default="")
    estado: Mapped[EstadoVacante] = mapped_column(Enum(EstadoVacante), default=EstadoVacante.PENDIENTE)
    creada_en: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    empresa: Mapped[Empresa] = relationship()