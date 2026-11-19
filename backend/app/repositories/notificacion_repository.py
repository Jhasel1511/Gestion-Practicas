from sqlalchemy import func, select, update
from sqlalchemy.orm import Session

from app.models import Notificacion


class NotificacionRepository:
    def __init__(self, db: Session):
        self.db = db

    def get(self, notificacion_id: int) -> Notificacion | None:
        return self.db.get(Notificacion, notificacion_id)

    def list_by_usuario(self, usuario_id: int, solo_no_leidas: bool = False) -> list[Notificacion]:
        q = select(Notificacion).where(Notificacion.usuario_id == usuario_id)
        if solo_no_leidas:
            q = q.where(Notificacion.leida.is_(False))
        return list(self.db.scalars(q.order_by(Notificacion.creada_en.desc())))

    def contar_no_leidas(self, usuario_id: int) -> int:
        q = select(func.count()).select_from(Notificacion).where(
            Notificacion.usuario_id == usuario_id, Notificacion.leida.is_(False)
        )
        return int(self.db.scalar(q))

    def marcar_todas(self, usuario_id: int) -> int:
        resultado = self.db.execute(
            update(Notificacion)
            .where(Notificacion.usuario_id == usuario_id, Notificacion.leida.is_(False))
            .values(leida=True)
        )
        self.db.commit()
        return resultado.rowcount

    def commit(self) -> None:
        self.db.commit()

    def refresh(self, obj) -> None:
        self.db.refresh(obj)