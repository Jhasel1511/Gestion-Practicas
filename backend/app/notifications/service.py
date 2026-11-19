from sqlalchemy.orm import Session

from app.models import Notificacion


def notificar(db: Session, usuario_id: int, mensaje: str) -> None:
    """Crea una alerta interna. No hace commit: se guarda junto con el cambio que la origina."""
    db.add(Notificacion(usuario_id=usuario_id, mensaje=mensaje))
    # TODO: enviar también por correo (smtplib / SendGrid)