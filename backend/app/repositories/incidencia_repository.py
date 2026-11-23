from __future__ import annotations
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import (
    Coordinador, Evidencia, GestorIncidencias, Incidencia, Postulacion, Practica, Vacante,
)
from app.models.enums import EstadoIncidencia


class IncidenciaRepository:
    def __init__(self, db: Session):
        self.db = db

    def get(self, incidencia_id: int) -> Incidencia | None:
        return self.db.get(Incidencia, incidencia_id)

    def get_evidencia(self, evidencia_id: int) -> Evidencia | None:
        return self.db.get(Evidencia, evidencia_id)

    def list(self, estado: EstadoIncidencia | None = None) -> list[Incidencia]:
        q = select(Incidencia)
        if estado:
            q = q.where(Incidencia.estado == estado)
        return list(self.db.scalars(q.order_by(Incidencia.creada_en.desc())))

    def list_by_estudiante(self, estudiante_id: int,
                           estado: EstadoIncidencia | None = None) -> list[Incidencia]:
        q = (select(Incidencia)
             .join(Practica, Practica.id == Incidencia.practica_id)
             .join(Postulacion, Postulacion.id == Practica.postulacion_id)
             .where(Postulacion.estudiante_id == estudiante_id))
        if estado:
            q = q.where(Incidencia.estado == estado)
        return list(self.db.scalars(q.order_by(Incidencia.creada_en.desc())))

    def list_by_empresa(self, empresa_id: int,
                        estado: EstadoIncidencia | None = None) -> list[Incidencia]:
        q = (select(Incidencia)
             .join(Practica, Practica.id == Incidencia.practica_id)
             .join(Postulacion, Postulacion.id == Practica.postulacion_id)
             .join(Vacante, Vacante.id == Postulacion.vacante_id)
             .where(Vacante.empresa_id == empresa_id))
        if estado:
            q = q.where(Incidencia.estado == estado)
        return list(self.db.scalars(q.order_by(Incidencia.creada_en.desc())))

    def gestores_usuario_ids(self) -> list[int]:
        return list(self.db.scalars(select(GestorIncidencias.usuario_id)))

    def coordinadores_usuario_ids(self) -> list[int]:
        return list(self.db.scalars(select(Coordinador.usuario_id)))

    def add(self, obj) -> None:
        self.db.add(obj)

    def commit(self) -> None:
        self.db.commit()

    def refresh(self, obj) -> None:
        self.db.refresh(obj)