from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import Estudiante, Postulacion, Practica


class PostulacionRepository:
    def __init__(self, db: Session):
        self.db = db

    def get(self, postulacion_id: int) -> Postulacion | None:
        return self.db.get(Postulacion, postulacion_id)

    def get_by_vacante_estudiante(self, vacante_id: int, estudiante_id: int) -> Postulacion | None:
        return self.db.scalar(
            select(Postulacion).where(
                Postulacion.vacante_id == vacante_id,
                Postulacion.estudiante_id == estudiante_id,
            )
        )

    def list_by_estudiante(self, estudiante_id: int) -> list[Postulacion]:
        q = select(Postulacion).where(Postulacion.estudiante_id == estudiante_id)
        return list(self.db.scalars(q.order_by(Postulacion.fecha_postulacion.desc())))

    def list_postulantes(self, vacante_id: int) -> list[tuple[Postulacion, Estudiante]]:
        q = (
            select(Postulacion, Estudiante)
            .join(Estudiante, Estudiante.id == Postulacion.estudiante_id)
            .where(Postulacion.vacante_id == vacante_id)
            .order_by(Postulacion.fecha_postulacion)
        )
        return list(self.db.execute(q).all())

    def list_otras(self, vacante_id: int, excluir_id: int) -> list[Postulacion]:
        q = select(Postulacion).where(
            Postulacion.vacante_id == vacante_id, Postulacion.id != excluir_id
        )
        return list(self.db.scalars(q))

    def add(self, obj) -> None:
        self.db.add(obj)

    def commit(self) -> None:
        self.db.commit()

    def refresh(self, obj) -> None:
        self.db.refresh(obj)