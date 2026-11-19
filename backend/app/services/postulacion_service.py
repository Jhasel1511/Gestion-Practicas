from fastapi import HTTPException, status

from app.models import Postulacion, Practica, Usuario
from app.models.enums import EstadoPostulacion, EstadoPractica, EstadoVacante
from app.repositories.postulacion_repository import PostulacionRepository
from app.repositories.usuario_repository import UsuarioRepository
from app.repositories.vacante_repository import VacanteRepository
from app.schemas.postulacion import PostulanteOut
from app.services.vacante_service import VacanteService


class PostulacionService:
    def __init__(self, repo: PostulacionRepository, vacantes: VacanteRepository,
                 usuarios: UsuarioRepository):
        self.repo = repo
        self.vacantes = vacantes
        self.usuarios = usuarios

    # RF04: el estudiante se postula ---------------------------------
    def postular(self, vacante_id: int, usuario: Usuario) -> Postulacion:
        vacante = self.vacantes.get(vacante_id)
        if not vacante:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Vacante no encontrada")
        if vacante.estado != EstadoVacante.ACTIVA:
            raise HTTPException(status.HTTP_400_BAD_REQUEST, "La vacante no está disponible")

        # Se revalida en el backend aunque el frontend ya lo haya hecho
        elegibilidad = VacanteService(self.vacantes, self.usuarios).elegibilidad(vacante_id, usuario)
        if not elegibilidad.elegible:
            raise HTTPException(status.HTTP_400_BAD_REQUEST, " ".join(elegibilidad.motivos))

        estudiante = self.usuarios.get_perfil(usuario)
        if self.repo.get_by_vacante_estudiante(vacante_id, estudiante.id):
            raise HTTPException(status.HTTP_409_CONFLICT, "Ya te postulaste a esta vacante")

        postulacion = Postulacion(vacante_id=vacante_id, estudiante_id=estudiante.id)
        self.repo.add(postulacion)
        self.repo.commit()
        self.repo.refresh(postulacion)
        return postulacion

    def mis_postulaciones(self, usuario: Usuario) -> list[Postulacion]:
        estudiante = self.usuarios.get_perfil(usuario)
        return self.repo.list_by_estudiante(estudiante.id)

    # RF05: la empresa ve los postulantes ----------------------------
    def listar_postulantes(self, vacante_id: int, usuario: Usuario) -> list[PostulanteOut]:
        self._vacante_de_la_empresa(vacante_id, usuario)
        return [
            PostulanteOut(
                postulacion_id=p.id, estado=p.estado, fecha_postulacion=p.fecha_postulacion,
                estudiante_id=e.id, estudiante_nombre=e.nombre,
                creditos_cursados=e.creditos_cursados, promedio=e.promedio, semestre=e.semestre,
            )
            for p, e in self.repo.list_postulantes(vacante_id)
        ]

    # RF06 y RF07: la empresa selecciona y nace la práctica ----------
    def seleccionar(self, postulacion_id: int, usuario: Usuario) -> Practica:
        postulacion = self.repo.get(postulacion_id)
        if not postulacion:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Postulación no encontrada")

        vacante = self._vacante_de_la_empresa(postulacion.vacante_id, usuario)
        if vacante.estado != EstadoVacante.ACTIVA:
            raise HTTPException(status.HTTP_400_BAD_REQUEST, "Esta vacante ya tiene un estudiante seleccionado")
        if postulacion.estado != EstadoPostulacion.POSTULADA:
            raise HTTPException(status.HTTP_400_BAD_REQUEST, "La postulación no está disponible para selección")

        postulacion.estado = EstadoPostulacion.SELECCIONADA
        for otra in self.repo.list_otras(vacante.id, postulacion.id):
            otra.estado = EstadoPostulacion.DESCARTADA
        vacante.estado = EstadoVacante.CERRADA

        practica = Practica(
            postulacion_id=postulacion.id,
            horas_requeridas=vacante.horas_exigidas,
            estado=EstadoPractica.POSTULADA,  # espera la aprobación del coordinador
        )
        self.repo.add(practica)
        self.repo.commit()  # todo se guarda junto, o nada
        self.repo.refresh(practica)
        return practica

    # Verifica que la vacante exista y sea de la empresa que hace la petición
    def _vacante_de_la_empresa(self, vacante_id: int, usuario: Usuario):
        vacante = self.vacantes.get(vacante_id)
        if not vacante:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Vacante no encontrada")
        empresa = self.usuarios.get_perfil(usuario)
        if vacante.empresa_id != empresa.id:
            raise HTTPException(status.HTTP_403_FORBIDDEN, "Esta vacante pertenece a otra empresa")
        return vacante