from sqlalchemy import Boolean, Enum, Float, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.enums import Rol


class Usuario(Base):
    __tablename__ = "usuario"

    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(150), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    rol: Mapped[Rol] = mapped_column(Enum(Rol))
    intentos_fallidos: Mapped[int] = mapped_column(Integer, default=0)
    bloqueado: Mapped[bool] = mapped_column(Boolean, default=False)


class Empresa(Base):
    __tablename__ = "empresa"

    id: Mapped[int] = mapped_column(primary_key=True)
    usuario_id: Mapped[int] = mapped_column(ForeignKey("usuario.id"), unique=True)
    nombre: Mapped[str] = mapped_column(String(150))
    sector: Mapped[str] = mapped_column(String(100))
    email_contacto: Mapped[str] = mapped_column(String(150))
    telefono: Mapped[str | None] = mapped_column(String(30), nullable=True)

    usuario: Mapped[Usuario] = relationship()


class Estudiante(Base):
    __tablename__ = "estudiante"

    id: Mapped[int] = mapped_column(primary_key=True)
    usuario_id: Mapped[int] = mapped_column(ForeignKey("usuario.id"), unique=True)
    nombre: Mapped[str] = mapped_column(String(150))
    creditos_cursados: Mapped[int] = mapped_column(Integer, default=0)
    promedio: Mapped[float] = mapped_column(Float, default=0.0)
    semestre: Mapped[int] = mapped_column(Integer, default=1)

    usuario: Mapped[Usuario] = relationship()


class Coordinador(Base):
    __tablename__ = "coordinador"

    id: Mapped[int] = mapped_column(primary_key=True)
    usuario_id: Mapped[int] = mapped_column(ForeignKey("usuario.id"), unique=True)
    nombre: Mapped[str] = mapped_column(String(150))

    usuario: Mapped[Usuario] = relationship()


class GestorIncidencias(Base):
    __tablename__ = "gestor_incidencias"

    id: Mapped[int] = mapped_column(primary_key=True)
    usuario_id: Mapped[int] = mapped_column(ForeignKey("usuario.id"), unique=True)
    nombre: Mapped[str] = mapped_column(String(150))

    usuario: Mapped[Usuario] = relationship()