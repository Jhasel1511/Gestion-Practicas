from contextlib import asynccontextmanager
from fastapi import FastAPI
from app.api.v1 import auth
import app.models  # noqa: F401  (registra las tablas)
from app.core.database import Base, engine


@asynccontextmanager
async def lifespan(_: FastAPI):
    Base.metadata.create_all(bind=engine)  # crea las tablas que no existan
    yield


app = FastAPI(title="SGP - Sistema de Gestión de Prácticas", lifespan=lifespan)


@app.get("/health")
def health():
    return {"status": "ok"}

app.include_router(auth.router, prefix="/api/v1")