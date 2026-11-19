from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import app.models  # noqa: F401  (registra las tablas)
from app.api.v1 import horas, auth, notificaciones, practicas, vacantes, postulaciones, incidencias, evaluaciones
from app.core.database import Base, engine
from app.core.config import settings


@asynccontextmanager
async def lifespan(_: FastAPI):
    Base.metadata.create_all(bind=engine)  # crea las tablas que no existan
    yield


app = FastAPI(title="SGP - Sistema de Gestión de Prácticas")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in settings.CORS_ORIGINS.split(",")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/v1")
app.include_router(vacantes.router, prefix="/api/v1")
app.include_router(postulaciones.router, prefix="/api/v1")
app.include_router(practicas.router, prefix="/api/v1")
app.include_router(notificaciones.router, prefix="/api/v1")
app.include_router(horas.router, prefix="/api/v1")
app.include_router(postulaciones.vacantes_router, prefix="/api/v1")
app.include_router(incidencias.router, prefix="/api/v1")
app.include_router(evaluaciones.router, prefix="/api/v1")



@app.get("/health")
def health():
    return {"status": "ok"}