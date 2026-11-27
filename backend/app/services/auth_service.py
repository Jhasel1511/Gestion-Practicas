from fastapi import HTTPException, status

from app.core.config import settings
from app.core.security import create_access_token, hash_password, verify_password
from app.models.enums import Rol
from app.notifications.service import notificar
from app.repositories.usuario_repository import UsuarioRepository
from app.schemas.auth import RegistroEmpresaIn, RegistroEstudianteIn


class AuthService:
    def __init__(self, repo: UsuarioRepository):
        self.repo = repo

    def login(self, email: str, password: str) -> dict:
        usuario = self.repo.get_by_email(email)
        if not usuario:
            raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Credenciales inválidas")

        if usuario.bloqueado:
            raise HTTPException(status.HTTP_423_LOCKED, "Cuenta bloqueada por intentos fallidos")

        if not verify_password(password, usuario.password_hash):
            usuario.intentos_fallidos += 1
            if usuario.intentos_fallidos >= settings.MAX_LOGIN_ATTEMPTS:
                usuario.bloqueado = True
            self.repo.save(usuario)
            raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Credenciales inválidas")

        usuario.intentos_fallidos = 0
        self.repo.save(usuario)

        perfil = self.repo.get_perfil(usuario)
        return {
            "access_token": create_access_token(usuario.id, usuario.rol.value),
            "rol": usuario.rol.value,
            "nombre": getattr(perfil, "nombre", None),
        }

    def registro_estudiante(self, data: RegistroEstudianteIn) -> dict:
        existente = self.repo.get_by_email(data.email)
        if existente:
            raise HTTPException(status.HTTP_409_CONFLICT, "El correo electrónico ya se encuentra registrado.")

        usuario, estudiante = self.repo.crear_estudiante(
            email=data.email,
            password_hash=hash_password(data.password),
            nombre=data.nombre,
            creditos_cursados=data.creditos_cursados,
            promedio=data.promedio,
            semestre=data.semestre,
        )

        # Enviar notificación de bienvenida al estudiante
        notificar(
            self.repo.db,
            usuario.id,
            f"¡Bienvenido/a al SGP, {estudiante.nombre}! Tu cuenta de estudiante está activa. Explora las vacantes y postúlate a las que cumplan con tu perfil.",
        )
        self.repo.db.commit()

        return {
            "access_token": create_access_token(usuario.id, usuario.rol.value),
            "token_type": "bearer",
            "rol": usuario.rol.value,
            "nombre": estudiante.nombre,
        }

    def registro_empresa(self, data: RegistroEmpresaIn) -> dict:
        existente = self.repo.get_by_email(data.email)
        if existente:
            raise HTTPException(status.HTTP_409_CONFLICT, "El correo electrónico ya se encuentra registrado.")

        usuario, empresa = self.repo.crear_empresa(
            email=data.email,
            password_hash=hash_password(data.password),
            nombre=data.nombre,
            sector=data.sector,
            email_contacto=data.email_contacto,
            telefono=data.telefono,
        )

        # Enviar notificación de bienvenida a la empresa
        notificar(
            self.repo.db,
            usuario.id,
            f"¡Bienvenido/a al SGP, {empresa.nombre}! Tu cuenta empresarial está activa. Ya puedes publicar convocatorias y gestionar postulaciones.",
        )

        # Notificar a los coordinadores académicos sobre la nueva empresa vinculada
        coordinadores = self.repo.list_by_rol(Rol.COORDINADOR)
        for coord in coordinadores:
            notificar(
                self.repo.db,
                coord.id,
                f"Nueva empresa registrada en la plataforma: '{empresa.nombre}' (Sector: {empresa.sector}).",
            )

        self.repo.db.commit()

        return {
            "access_token": create_access_token(usuario.id, usuario.rol.value),
            "token_type": "bearer",
            "rol": usuario.rol.value,
            "nombre": empresa.nombre,
        }
        
    def desbloquear(self, usuario_id: int) -> None:
        usuario = self.repo.get_by_id(usuario_id)
        if not usuario:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Usuario no encontrado")
        usuario.bloqueado = False
        usuario.intentos_fallidos = 0
        self.repo.save(usuario)

    def cambiar_password(self, usuario, actual: str, nueva: str) -> None:
        if not verify_password(actual, usuario.password_hash):
            raise HTTPException(status.HTTP_400_BAD_REQUEST, "La contraseña actual no es correcta")
        if actual == nueva:
            raise HTTPException(status.HTTP_400_BAD_REQUEST, "La nueva contraseña debe ser distinta")
        usuario.password_hash = hash_password(nueva)
        self.repo.save(usuario)
