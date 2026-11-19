import enum


class Rol(str, enum.Enum):
    ESTUDIANTE = "estudiante"
    EMPRESA = "empresa"
    COORDINADOR = "coordinador"
    GESTOR = "gestor"


class EstadoVacante(str, enum.Enum):
    PENDIENTE = "pendiente"   # la empresa la publicó, falta que el coordinador la valide
    ACTIVA = "activa"
    RECHAZADA = "rechazada"
    CERRADA = "cerrada"
    
class EstadoPostulacion(str, enum.Enum):
    POSTULADA = "postulada"
    SELECCIONADA = "seleccionada"
    DESCARTADA = "descartada"


class EstadoPractica(str, enum.Enum):
    POSTULADA = "postulada"   # la empresa eligió al estudiante, falta el coordinador
    APROBADA = "aprobada"
    EN_CURSO = "en_curso"
    RECHAZADA = "rechazada"
    CERRADA = "cerrada"
    
class EstadoHoras(str, enum.Enum):
    PENDIENTE = "pendiente"
    CONFIRMADA = "confirmada"
    RECHAZADA = "rechazada"
    
class EstadoIncidencia(str, enum.Enum):
    ABIERTA = "abierta"
    EN_REVISION = "en_revision"
    ESCALADA = "escalada"
    CERRADA = "cerrada"


class GravedadIncidencia(str, enum.Enum):
    BAJA = "baja"
    MEDIA = "media"
    ALTA = "alta"
    
    
class TipoEvaluacion(str, enum.Enum):
    EMPRESA_A_ESTUDIANTE = "empresa_a_estudiante"
    ESTUDIANTE_A_EMPRESA = "estudiante_a_empresa"