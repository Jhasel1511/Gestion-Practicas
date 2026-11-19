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