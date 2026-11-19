import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app import models  # noqa: F401  (registra las tablas)
from app.api.deps import get_db
from app.core.database import Base
from app.core.security import hash_password
from app.main import app as fastapi_app
from app.models import Coordinador, Empresa, Estudiante, GestorIncidencias, Usuario
from app.models.enums import Rol
from tests.helpers import COORDINADOR, EMPRESA, ESTUDIANTE, GESTOR, OTRA_EMPRESA, PASSWORD

# Se calcula una sola vez: bcrypt es lento a propósito
PASSWORD_HASH = hash_password(PASSWORD)


def _crear(db, email, rol, perfil, **campos):
    usuario = Usuario(email=email, password_hash=PASSWORD_HASH, rol=rol)
    db.add(usuario)
    db.flush()
    db.add(perfil(usuario_id=usuario.id, **campos))


@pytest.fixture()
def session_factory():
    engine = create_engine("sqlite://", connect_args={"check_same_thread": False},
                           poolclass=StaticPool)
    Base.metadata.create_all(bind=engine)
    yield sessionmaker(bind=engine, autoflush=False, autocommit=False)
    Base.metadata.drop_all(bind=engine)
    engine.dispose()


@pytest.fixture()
def client(session_factory):
    # Datos base: Ana (120 créditos, promedio 4.1) y un usuario de cada rol
    db = session_factory()
    _crear(db, ESTUDIANTE, Rol.ESTUDIANTE, Estudiante,
           nombre="Ana Pérez", creditos_cursados=120, promedio=4.1, semestre=8)
    _crear(db, EMPRESA, Rol.EMPRESA, Empresa,
           nombre="ACME", sector="Tecnología", email_contacto="rh@acme.com")
    _crear(db, OTRA_EMPRESA, Rol.EMPRESA, Empresa,
           nombre="Otra S.A.", sector="Salud", email_contacto="rh@otra.com")
    _crear(db, COORDINADOR, Rol.COORDINADOR, Coordinador, nombre="Carlos Gómez")
    _crear(db, GESTOR, Rol.GESTOR, GestorIncidencias, nombre="Laura Ríos")
    db.commit()
    db.close()

    # La app usa la base en memoria en vez de PostgreSQL
    def override_get_db():
        db = session_factory()
        try:
            yield db
        finally:
            db.close()

    fastapi_app.dependency_overrides[get_db] = override_get_db
    yield TestClient(fastapi_app)
    fastapi_app.dependency_overrides.clear()