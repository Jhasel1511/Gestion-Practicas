from pydantic import BaseModel, EmailStr, Field


class LoginIn(BaseModel):
    email: EmailStr
    password: str


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    rol: str
    nombre: str | None = None


class UsuarioOut(BaseModel):
    id: int
    email: str
    rol: str


class CambiarPasswordIn(BaseModel):
    password_actual: str
    password_nueva: str = Field(min_length=8)


class RegistroEstudianteIn(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)
    nombre: str = Field(min_length=2, max_length=150)
    creditos_cursados: int = Field(default=0, ge=0)
    promedio: float = Field(default=0.0, ge=0.0, le=5.0)
    semestre: int = Field(default=1, ge=1, le=12)


class RegistroEmpresaIn(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)
    nombre: str = Field(min_length=2, max_length=150)
    sector: str = Field(min_length=2, max_length=100)
    email_contacto: EmailStr
    telefono: str | None = None
