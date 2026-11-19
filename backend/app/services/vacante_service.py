from fastapi import HTTPException, status

from app.models import Usuario, Vacante
from app.models.enums import EstadoVacante, Rol
from app.repositories.usuario_repository import UsuarioRepository
from app.repositories.vacante_repository import VacanteRepository
from app.schemas.vacante import ElegibilidadOut, VacanteCreate, VacanteUpdate


class VacanteService:
    def __init__(self, repo: VacanteRepository, usuarios: UsuarioRepository):
        self.repo = repo
        self.usuarios = usuarios

    def crear(self, data: VacanteCreate, usuario: Usuario) -> Vacante:
        empresa = self.usuarios.get_perfil(usuario)
        vacante = Vacante(**data.model_dump(), empresa_id=empresa.id,
                          estado=EstadoVacante.PENDIENTE)
        return self.repo.save(vacante)

    def editar(self, vacante_id: int, data: VacanteUpdate, usuario: Usuario) -> Vacante:
        vacante = self._get_or_404(vacante_id)
        empresa = self.usuarios.get_perfil(usuario)
        if vacante.empresa_id != empresa.id:
            raise HTTPException(status.HTTP_403_FORBIDDEN, "No puedes editar vacantes de otra empresa")
        for campo, valor in data.model_dump(exclude_unset=True).items():
            setattr(vacante, campo, valor)
        vacante.estado = EstadoVacante.PENDIENTE  # al editarla, vuelve a revisión
        return self.repo.save(vacante)

    def listar(self, usuario: Usuario, area: str | None = None,
               estado: EstadoVacante | None = None, skip: int = 0, limit: int = 50) -> list[Vacante]:
        if usuario.rol == Rol.ESTUDIANTE:
            return self.repo.list(estado=EstadoVacante.ACTIVA, area=area, skip=skip, limit=limit)
        if usuario.rol == Rol.EMPRESA:
            empresa = self.usuarios.get_perfil(usuario)
            return self.repo.list(estado=estado, area=area, empresa_id=empresa.id, skip=skip, limit=limit)
        return self.repo.list(estado=estado, area=area, skip=skip, limit=limit)

    def obtener(self, vacante_id: int) -> Vacante:
        return self._get_or_404(vacante_id)

    def revisar(self, vacante_id: int, aprobar: bool) -> Vacante:
        vacante = self._get_or_404(vacante_id)
        vacante.estado = EstadoVacante.ACTIVA if aprobar else EstadoVacante.RECHAZADA
        return self.repo.save(vacante)

    def elegibilidad(self, vacante_id: int, usuario: Usuario) -> ElegibilidadOut:
        vacante = self._get_or_404(vacante_id)
        estudiante = self.usuarios.get_perfil(usuario)
        motivos = []
        if estudiante.creditos_cursados < vacante.creditos_minimos:
            motivos.append(f"Necesitas {vacante.creditos_minimos} créditos cursados "
                           f"(tienes {estudiante.creditos_cursados}).")
        if estudiante.promedio < vacante.promedio_minimo:
            motivos.append(f"Necesitas promedio mínimo de {vacante.promedio_minimo} "
                           f"(tienes {estudiante.promedio}).")
        return ElegibilidadOut(elegible=not motivos, motivos=motivos)

    def _get_or_404(self, vacante_id: int) -> Vacante:
        vacante = self.repo.get(vacante_id)
        if not vacante:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Vacante no encontrada")
        return vacante