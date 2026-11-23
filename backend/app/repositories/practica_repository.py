from __future__ import annotations
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import Empresa, Estudiante, Postulacion, Practica, Vacante
from app.models.enums import EstadoPractica


class PracticaRepository:
    def __init__(self, db: Session):
        self.db = db

    def list(self, estado: EstadoPractica | None = None) -> list[Practica]:
        q = select(Practica)
        if estado:
            q = q.where(Practica.estado == estado)
        return list(self.db.scalars(q.order_by(Practica.id)))

    def get_contexto(self, practica_id: int):
        """Devuelve (practica, postulacion, vacante, estudiante, empresa) o None."""
        q = (
            select(Practica, Postulacion, Vacante, Estudiante, Empresa)
            .join(Postulacion, Postulacion.id == Practica.postulacion_id)
            .join(Vacante, Vacante.id == Postulacion.vacante_id)
            .join(Estudiante, Estudiante.id == Postulacion.estudiante_id)
            .join(Empresa, Empresa.id == Vacante.empresa_id)
            .where(Practica.id == practica_id)
        )
        return self.db.execute(q).first()

    def otras_postulaciones(self, vacante_id: int, excluir_id: int) -> list[Postulacion]:
        q = select(Postulacion).where(
            Postulacion.vacante_id == vacante_id, Postulacion.id != excluir_id
        )
        return list(self.db.scalars(q))

    def commit(self) -> None:
        self.db.commit()

    def refresh(self, obj) -> None:
        self.db.refresh(obj)
        
    def list_by_estudiante(self, estudiante_id: int) -> list[Practica]:
        q = (select(Practica)
             .join(Postulacion, Postulacion.id == Practica.postulacion_id)
             .where(Postulacion.estudiante_id == estudiante_id)
             .order_by(Practica.id))
        return list(self.db.scalars(q))

    def list_by_empresa(self, empresa_id: int) -> list[Practica]:
        q = (select(Practica)
             .join(Postulacion, Postulacion.id == Practica.postulacion_id)
             .join(Vacante, Vacante.id == Postulacion.vacante_id)
             .where(Vacante.empresa_id == empresa_id)
             .order_by(Practica.id))
        return list(self.db.scalars(q))