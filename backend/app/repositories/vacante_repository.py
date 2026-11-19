from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import Vacante
from app.models.enums import EstadoVacante


class VacanteRepository:
    def __init__(self, db: Session):
        self.db = db

    def get(self, vacante_id: int) -> Vacante | None:
        return self.db.get(Vacante, vacante_id)

    def list(self, estado: EstadoVacante | None = None, area: str | None = None,
             empresa_id: int | None = None, skip: int = 0, limit: int = 50) -> list[Vacante]:
        q = select(Vacante)
        if estado:
            q = q.where(Vacante.estado == estado)
        if area:
            q = q.where(Vacante.area.ilike(f"%{area}%"))
        if empresa_id:
            q = q.where(Vacante.empresa_id == empresa_id)
        q = q.order_by(Vacante.creada_en.desc()).offset(skip).limit(limit)
        return list(self.db.scalars(q))

    def save(self, vacante: Vacante) -> Vacante:
        self.db.add(vacante)
        self.db.commit()
        self.db.refresh(vacante)
        return vacante