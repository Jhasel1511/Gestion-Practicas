from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import Certificado, Coordinador, Evaluacion
from app.models.enums import TipoEvaluacion


class EvaluacionRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_practica_tipo(self, practica_id: int, tipo: TipoEvaluacion) -> Evaluacion | None:
        return self.db.scalar(
            select(Evaluacion).where(Evaluacion.practica_id == practica_id, Evaluacion.tipo == tipo)
        )

    def list_by_practica(self, practica_id: int) -> list[Evaluacion]:
        q = select(Evaluacion).where(Evaluacion.practica_id == practica_id).order_by(Evaluacion.id)
        return list(self.db.scalars(q))

    def get_certificado(self, practica_id: int) -> Certificado | None:
        return self.db.scalar(select(Certificado).where(Certificado.practica_id == practica_id))

    def coordinadores_usuario_ids(self) -> list[int]:
        return list(self.db.scalars(select(Coordinador.usuario_id)))

    def add(self, obj) -> None:
        self.db.add(obj)

    def commit(self) -> None:
        self.db.commit()

    def refresh(self, obj) -> None:
        self.db.refresh(obj)