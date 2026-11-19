from datetime import date

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models import RegistroHoras
from app.models.enums import EstadoHoras


class HorasRepository:
    def __init__(self, db: Session):
        self.db = db

    def get(self, registro_id: int) -> RegistroHoras | None:
        return self.db.get(RegistroHoras, registro_id)

    def list_by_practica(self, practica_id: int) -> list[RegistroHoras]:
        q = select(RegistroHoras).where(RegistroHoras.practica_id == practica_id)
        return list(self.db.scalars(q.order_by(RegistroHoras.fecha, RegistroHoras.id)))

    def suma(self, practica_id: int, estados: list[EstadoHoras], fecha: date | None = None) -> float:
        q = select(func.coalesce(func.sum(RegistroHoras.horas), 0.0)).where(
            RegistroHoras.practica_id == practica_id,
            RegistroHoras.estado_confirmacion.in_(estados),
        )
        if fecha:
            q = q.where(RegistroHoras.fecha == fecha)
        return float(self.db.scalar(q))

    def add(self, obj) -> None:
        self.db.add(obj)

    def commit(self) -> None:
        self.db.commit()

    def refresh(self, obj) -> None:
        self.db.refresh(obj)