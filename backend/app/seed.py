"""Datos de prueba. Ejecutar con:  python -m app.seed"""
import app.models  # noqa: F401
from app.core.database import Base, SessionLocal, engine
from app.core.security import hash_password
from app.models import Coordinador, Empresa, Estudiante, GestorIncidencias, Usuario
from app.models.enums import Rol


def run():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    if db.query(Usuario).count():
        print("Ya hay usuarios; no se hace nada.")
        return

    def crear_usuario(email, rol):
        u = Usuario(email=email, password_hash=hash_password("Clave123!"), rol=rol)
        db.add(u)
        db.flush()  # para obtener u.id
        return u

    u = crear_usuario("estudiante@uninorte.edu.co", Rol.ESTUDIANTE)
    db.add(Estudiante(usuario_id=u.id, nombre="Ana Pérez", creditos_cursados=120, promedio=4.1, semestre=8))

    u = crear_usuario("empresa@acme.com", Rol.EMPRESA)
    db.add(Empresa(usuario_id=u.id, nombre="ACME S.A.S.", sector="Tecnología", email_contacto="rh@acme.com"))

    u = crear_usuario("coordinador@uninorte.edu.co", Rol.COORDINADOR)
    db.add(Coordinador(usuario_id=u.id, nombre="Carlos Gómez"))

    u = crear_usuario("gestor@uninorte.edu.co", Rol.GESTOR)
    db.add(GestorIncidencias(usuario_id=u.id, nombre="Laura Ríos"))

    db.commit()
    print("Listo. Todos los usuarios usan la contraseña: Clave123!")


if __name__ == "__main__":
    run()