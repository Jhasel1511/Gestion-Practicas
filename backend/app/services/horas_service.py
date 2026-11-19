from datetime import date

from fastapi import HTTPException, status

from app.models import RegistroHoras, Usuario
from app.models.enums import EstadoHoras, EstadoPractica, Rol
from app.notifications.service import notificar
from app.repositories.horas_repository import HorasRepository
from app.repositories.practica_repository import PracticaRepository
from app.repositories.usuario_repository import UsuarioRepository
from app.schemas.horas import HorasCreate, ProgresoOut

MAX_HORAS_DIA = 12
CUENTAN = [EstadoHoras.PENDIENTE, EstadoHoras.CONFIRMADA]  # las rechazadas no ocupan cupo


class HorasService:
    def __init__(self, repo: HorasRepository, practicas: PracticaRepository,
                 usuarios: UsuarioRepository):
        self.repo = repo
        self.practicas = practicas
        self.usuarios = usuarios

    # RF10: el estudiante registra horas ------------------------------
    def registrar(self, practica_id: int, usuario: Usuario, data: HorasCreate) -> RegistroHoras:
        practica, _, vacante, estudiante, empresa = self._contexto(practica_id)
        self._verificar_acceso(usuario, estudiante, empresa)

        if practica.estado not in (EstadoPractica.APROBADA, EstadoPractica.EN_CURSO):
            raise HTTPException(status.HTTP_400_BAD_REQUEST,
                                "Solo se registran horas en prácticas aprobadas o en curso")
        if data.fecha > date.today():
            raise HTTPException(status.HTTP_400_BAD_REQUEST, "No puedes registrar horas en una fecha futura")

        del_dia = self.repo.suma(practica_id, CUENTAN, data.fecha)
        if del_dia + data.horas > MAX_HORAS_DIA:
            raise HTTPException(status.HTTP_400_BAD_REQUEST,
                                f"No puedes superar {MAX_HORAS_DIA} horas por día (ya llevas {del_dia})")

        total = self.repo.suma(practica_id, CUENTAN)
        if total + data.horas > practica.horas_requeridas:
            raise HTTPException(status.HTTP_400_BAD_REQUEST,
                                f"Superarías las {practica.horas_requeridas} horas de la práctica "
                                f"(llevas {total})")

        registro = RegistroHoras(practica_id=practica_id, fecha=data.fecha, horas=data.horas)
        self.repo.add(registro)

        if practica.estado == EstadoPractica.APROBADA:
            practica.estado = EstadoPractica.EN_CURSO  # primera jornada: inicia la práctica

        notificar(self.repo.db, empresa.usuario_id,
                  f"{estudiante.nombre} registró {data.horas} horas del {data.fecha}. "
                  f"Pendientes de tu confirmación.")
        self.repo.commit()
        self.repo.refresh(registro)
        return registro

    # RF11: la empresa confirma o rechaza -----------------------------
    def decidir(self, registro_id: int, usuario: Usuario, confirmar: bool) -> RegistroHoras:
        registro = self.repo.get(registro_id)
        if not registro:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Registro de horas no encontrado")

        _, _, _, estudiante, empresa = self._contexto(registro.practica_id)
        self._verificar_acceso(usuario, estudiante, empresa)

        if registro.estado_confirmacion != EstadoHoras.PENDIENTE:
            raise HTTPException(status.HTTP_400_BAD_REQUEST, "Este registro ya fue revisado")

        registro.estado_confirmacion = EstadoHoras.CONFIRMADA if confirmar else EstadoHoras.RECHAZADA
        accion = "confirmó" if confirmar else "rechazó"
        notificar(self.repo.db, estudiante.usuario_id,
                  f"{empresa.nombre} {accion} tus {registro.horas} horas del {registro.fecha}.")
        self.repo.commit()
        self.repo.refresh(registro)
        return registro

    def listar(self, practica_id: int, usuario: Usuario) -> list[RegistroHoras]:
        _, _, _, estudiante, empresa = self._contexto(practica_id)
        self._verificar_acceso(usuario, estudiante, empresa)
        return self.repo.list_by_practica(practica_id)

    # RF12: porcentaje de avance --------------------------------------
    def progreso(self, practica_id: int, usuario: Usuario) -> ProgresoOut:
        practica, _, _, estudiante, empresa = self._contexto(practica_id)
        self._verificar_acceso(usuario, estudiante, empresa)

        confirmadas = self.repo.suma(practica_id, [EstadoHoras.CONFIRMADA])
        pendientes = self.repo.suma(practica_id, [EstadoHoras.PENDIENTE])
        porcentaje = min(100.0, round(confirmadas / practica.horas_requeridas * 100, 1))
        return ProgresoOut(
            practica_id=practica_id,
            horas_requeridas=practica.horas_requeridas,
            horas_confirmadas=confirmadas,
            horas_pendientes=pendientes,
            porcentaje=porcentaje,
            completada=confirmadas >= practica.horas_requeridas,
        )

    # Auxiliares --------------------------------------------------------
    def _contexto(self, practica_id: int):
        fila = self.practicas.get_contexto(practica_id)
        if not fila:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Práctica no encontrada")
        return fila

    def _verificar_acceso(self, usuario: Usuario, estudiante, empresa) -> None:
        """Estudiante y empresa solo acceden a SU práctica; coordinador y gestor, a todas."""
        perfil = self.usuarios.get_perfil(usuario)
        if usuario.rol == Rol.ESTUDIANTE and perfil.id != estudiante.id:
            raise HTTPException(status.HTTP_403_FORBIDDEN, "Esta práctica no es tuya")
        if usuario.rol == Rol.EMPRESA and perfil.id != empresa.id:
            raise HTTPException(status.HTTP_403_FORBIDDEN, "Esta práctica pertenece a otra empresa")