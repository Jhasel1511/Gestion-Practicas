from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import Coordinador, Empresa, Estudiante, GestorIncidencias, Usuario
from app.models.enums import Rol


class UsuarioRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, user_id: int) -> Usuario | None:
        return self.db.get(Usuario, user_id)

    def get_by_email(self, email: str) -> Usuario | None:
        return self.db.scalar(select(Usuario).where(Usuario.email == email))

    def save(self, usuario: Usuario) -> Usuario:
        self.db.add(usuario)
        self.db.commit()
        self.db.refresh(usuario)
        return usuario

    def get_perfil(self, usuario: Usuario):
        """Devuelve la fila de Empresa, Estudiante, etc. según el rol."""
        modelo = {
            Rol.EMPRESA: Empresa,
            Rol.ESTUDIANTE: Estudiante,
            Rol.COORDINADOR: Coordinador,
            Rol.GESTOR: GestorIncidencias,
        }[usuario.rol]
        return self.db.scalar(select(modelo).where(modelo.usuario_id == usuario.id))
    
    def list_bloqueados(self) -> list[Usuario]:
        return list(self.db.scalars(select(Usuario).where(Usuario.bloqueado.is_(True))))

    def list_by_rol(self, rol: Rol) -> list[Usuario]:
        return list(self.db.scalars(select(Usuario).where(Usuario.rol == rol)))

    def crear_estudiante(self, email: str, password_hash: str, nombre: str,
                         creditos_cursados: int, promedio: float, semestre: int) -> tuple[Usuario, Estudiante]:
        usuario = Usuario(email=email, password_hash=password_hash, rol=Rol.ESTUDIANTE)
        self.db.add(usuario)
        self.db.flush()
        estudiante = Estudiante(
            usuario_id=usuario.id,
            nombre=nombre,
            creditos_cursados=creditos_cursados,
            promedio=promedio,
            semestre=semestre,
        )
        self.db.add(estudiante)
        self.db.commit()
        self.db.refresh(usuario)
        self.db.refresh(estudiante)
        return usuario, estudiante

    def crear_empresa(self, email: str, password_hash: str, nombre: str,
                      sector: str, email_contacto: str, telefono: str | None) -> tuple[Usuario, Empresa]:
        usuario = Usuario(email=email, password_hash=password_hash, rol=Rol.EMPRESA)
        self.db.add(usuario)
        self.db.flush()
        empresa = Empresa(
            usuario_id=usuario.id,
            nombre=nombre,
            sector=sector,
            email_contacto=email_contacto,
            telefono=telefono,
        )
        self.db.add(empresa)
        self.db.commit()
        self.db.refresh(usuario)
        self.db.refresh(empresa)
        return usuario, empresa
