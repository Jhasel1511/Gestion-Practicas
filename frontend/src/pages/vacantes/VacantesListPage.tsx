import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase,
  Search,
  Filter,
  PlusCircle,
  Clock,
  GraduationCap,
  CheckCircle,
  XCircle,
  AlertCircle,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { vacanteService } from '../../services/vacante.service';
import { postulacionService } from '../../services/postulacion.service';
import { Vacante, Elegibilidad } from '../../types';
import { Button } from '../../components/common/Button';
import { StatusBadge } from '../../components/common/Badge';
import { Card } from '../../components/common/Card';
import { Modal } from '../../components/common/Modal';
import { Alert } from '../../components/common/Alert';
import { getApiErrorMessage } from '../../services/api';

export const VacantesListPage: React.FC = () => {
  const navigate = useNavigate();
  const { role } = useAuth();
  const [vacantes, setVacantes] = useState<Vacante[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todas');
  const [loading, setLoading] = useState(true);

  // Modal para postulación
  const [selectedVacante, setSelectedVacante] = useState<Vacante | null>(null);
  const [elegibilidad, setElegibilidad] = useState<Elegibilidad | null>(null);
  const [checkingElegibilidad, setCheckingElegibilidad] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [applyResult, setApplyResult] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchVacantes = async () => {
    try {
      setLoading(true);
      const data = await vacanteService.getVacantes();
      setVacantes(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVacantes();
  }, []);

  const handleOpenApplyModal = async (vacante: Vacante) => {
    setSelectedVacante(vacante);
    setApplyResult(null);
    setCheckingElegibilidad(true);
    try {
      const res = await vacanteService.getElegibilidad(vacante.id);
      setElegibilidad(res);
    } catch {
      setElegibilidad({ elegible: true, motivos: [] });
    } finally {
      setCheckingElegibilidad(false);
    }
  };

  const handleConfirmPostulacion = async () => {
    if (!selectedVacante) return;
    setIsApplying(true);
    setApplyResult(null);
    try {
      await postulacionService.postularse(selectedVacante.id);
      setApplyResult({
        type: 'success',
        text: '¡Te has postulado exitosamente! La empresa evaluará tu perfil.',
      });
      setTimeout(() => {
        setSelectedVacante(null);
        setApplyResult(null);
      }, 2000);
    } catch (err) {
      setApplyResult({
        type: 'error',
        text: getApiErrorMessage(err, 'No fue posible registrar la postulación.'),
      });
    } finally {
      setIsApplying(false);
    }
  };

  const handleAprobarVacante = async (id: number) => {
    try {
      await vacanteService.aprobarVacante(id);
      fetchVacantes();
    } catch (e) {
      console.error(e);
    }
  };

  const handleRechazarVacante = async (id: number) => {
    try {
      await vacanteService.rechazarVacante(id);
      fetchVacantes();
    } catch (e) {
      console.error(e);
    }
  };

  // Filtrado
  const filteredVacantes = vacantes.filter((v) => {
    const matchesSearch =
      v.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.area.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.descripcion.toLowerCase().includes(searchTerm.toLowerCase());

    if (statusFilter === 'todas') return matchesSearch;
    return matchesSearch && v.estado === statusFilter;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-[#292929]">
            {role === 'coordinador'
              ? 'Validación y Aprobación de Vacantes'
              : role === 'empresa'
              ? 'Convocatorias y Vacantes'
              : 'Ofertas de Prácticas Profesionales'}
          </h1>
          <p className="text-xs text-[#777777] mt-1">
            {role === 'estudiante'
              ? 'Encuentra vacantes homologadas para tu carrera y postula en línea.'
              : role === 'empresa'
              ? 'Administra las ofertas que tu empresa tiene abiertas o en revisión.'
              : 'Supervisa y aprueba ofertas para garantizar los lineamientos académicos.'}
          </p>
        </div>

        {role === 'empresa' && (
          <Button
            variant="primary"
            onClick={() => navigate('/vacantes/crear')}
            leftIcon={<PlusCircle className="w-4 h-4" />}
          >
            Nueva Vacante
          </Button>
        )}
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-3 rounded-xl border border-[#EAE8E2] shadow-card">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-[#A0A0A0] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por cargo, área académica o palabras clave..."
            className="w-full pl-9 pr-3.5 py-2 text-xs rounded-lg border border-[#EAE8E2] focus:outline-none focus:ring-2 focus:ring-[#C5A04B]/30 focus:border-[#C5A04B] bg-[#FAFAF8] text-[#292929]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-[#A0A0A0] shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs py-2 px-3 rounded-lg border border-[#EAE8E2] focus:outline-none focus:ring-2 focus:ring-[#C5A04B]/30 bg-[#FAFAF8] text-[#292929] w-full sm:w-auto"
          >
            <option value="todas">Todos los Estados</option>
            <option value="activa">Activas</option>
            <option value="pendiente">Pendientes</option>
            <option value="cerrada">Cerradas</option>
            <option value="rechazada">Rechazadas</option>
          </select>
        </div>
      </div>

      {/* Vacantes Grid */}
      {loading ? (
        <div className="py-16 text-center">
          <div className="w-6 h-6 border-2 border-[#EAE8E2] border-t-[#C5A04B] rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs text-[#777777]">Cargando vacantes...</p>
        </div>
      ) : filteredVacantes.length === 0 ? (
        <Card className="text-center py-12">
          <div className="w-11 h-11 rounded-full bg-[#F7EDD8] text-[#C5A04B] flex items-center justify-center mx-auto mb-3">
            <Briefcase className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-semibold text-[#292929]">No se encontraron vacantes</h3>
          <p className="text-xs text-[#777777] max-w-sm mx-auto mt-1">
            Prueba ajustando los filtros de búsqueda o regresa más tarde.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVacantes.map((vac) => (
            <Card
              key={vac.id}
              className="flex flex-col justify-between hover:border-[#C5A04B]/50 transition-all duration-200"
              padding="md"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-[11px] font-semibold text-[#8E712B] bg-[#F7EDD8] px-2 py-0.5 rounded border border-[#E9DDBD]">
                    {vac.area}
                  </span>
                  <StatusBadge status={vac.estado} />
                </div>

                <h3 className="text-sm font-semibold text-[#292929] leading-snug line-clamp-1 mb-1">
                  {vac.titulo}
                </h3>

                <p className="text-xs text-[#777777] line-clamp-3 mb-4 leading-relaxed">
                  {vac.descripcion || 'Sin descripción detallada disponible.'}
                </p>

                {/* Requirements Chips */}
                <div className="grid grid-cols-2 gap-2 p-2.5 rounded-lg bg-[#F5F5F3] border border-[#EAE8E2] text-[11px] text-[#777777] mb-4">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#A0A0A0]" />
                    <span>{vac.horas_exigidas}h ({vac.duracion_semanas} sem)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-[#A0A0A0]" />
                    <span>Mín: {vac.creditos_minimos} cr</span>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-3 border-t border-[#EAE8E2] flex items-center justify-between gap-2">
                <button
                  onClick={() => navigate(`/vacantes/${vac.id}`)}
                  className="text-xs font-semibold text-[#777777] hover:text-[#292929] flex items-center gap-1"
                >
                  Ver Detalle
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>

                {role === 'estudiante' && vac.estado === 'activa' && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleOpenApplyModal(vac)}
                  >
                    Postularme
                  </Button>
                )}

                {role === 'coordinador' && vac.estado === 'pendiente' && (
                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleAprobarVacante(vac.id)}
                      leftIcon={<CheckCircle className="w-3.5 h-3.5" />}
                    >
                      Aprobar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRechazarVacante(vac.id)}
                      className="text-rose-600 border-rose-200 hover:bg-rose-50"
                      leftIcon={<XCircle className="w-3.5 h-3.5" />}
                    >
                      Rechazar
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal de Postulación con Elegibilidad */}
      <Modal
        isOpen={!!selectedVacante}
        onClose={() => setSelectedVacante(null)}
        title="Confirmar Postulación"
        description="Verificación de requisitos académicos institucionales"
      >
        {selectedVacante && (
          <div className="space-y-4">
            {applyResult && (
              <Alert type={applyResult.type} message={applyResult.text} />
            )}

            <div className="p-3.5 rounded-lg bg-[#FAFAF8] border border-[#EAE8E2]">
              <h4 className="text-xs font-semibold text-[#292929]">{selectedVacante.titulo}</h4>
              <p className="text-[11px] text-[#777777] mt-0.5">Área: {selectedVacante.area}</p>
            </div>

            {/* Elegibilidad */}
            {checkingElegibilidad ? (
              <div className="py-4 text-center text-xs text-[#777777]">
                Verificando promedio y créditos del estudiante...
              </div>
            ) : elegibilidad && (
              <div
                className={`p-3.5 rounded-lg border text-xs ${
                  elegibilidad.elegible
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-amber-50 border-amber-200 text-amber-800'
                }`}
              >
                <div className="flex items-center gap-2 font-semibold mb-1">
                  {elegibilidad.elegible ? (
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                  )}
                  <span>
                    {elegibilidad.elegible
                      ? 'Cumples los requisitos académicos'
                      : 'Atención: No cumples con todos los requisitos'}
                  </span>
                </div>
                {elegibilidad.motivos.length > 0 && (
                  <ul className="list-disc pl-5 space-y-0.5 mt-1 opacity-90 text-[11px]">
                    {elegibilidad.motivos.map((m, i) => (
                      <li key={i}>{m}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            <p className="text-xs text-[#777777] leading-relaxed">
              Al enviar tu postulación, tu hoja de vida y registro académico serán visibles para el equipo de Recursos Humanos de la empresa.
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedVacante(null)}
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                size="sm"
                isLoading={isApplying}
                onClick={handleConfirmPostulacion}
              >
                Confirmar Postulación
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
