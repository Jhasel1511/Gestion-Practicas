import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Briefcase,
  Clock,
  GraduationCap,
  Users,
  CheckCircle,
  XCircle,
  AlertCircle,
  Check,
  UserCheck,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { vacanteService } from '../../services/vacante.service';
import { postulacionService } from '../../services/postulacion.service';
import { Elegibilidad, Postulante, Vacante } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { StatusBadge } from '../../components/common/Badge';
import { Alert } from '../../components/common/Alert';
import { getApiErrorMessage } from '../../services/api';

export const VacanteDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { role } = useAuth();

  const [vacante, setVacante] = useState<Vacante | null>(null);
  const [postulantes, setPostulantes] = useState<Postulante[]>([]);
  const [elegibilidad, setElegibilidad] = useState<Elegibilidad | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const vacanteId = Number(id);

  const fetchData = async () => {
    try {
      setLoading(true);
      const vacData = await vacanteService.getVacante(vacanteId);
      setVacante(vacData);

      if (role === 'empresa' || role === 'coordinador') {
        try {
          const posts = await postulacionService.getPostulantesPorVacante(vacanteId);
          setPostulantes(posts);
        } catch {
          // Endpoint solo autorizado para la empresa dueña
        }
      }

      if (role === 'estudiante') {
        try {
          const eleg = await vacanteService.getElegibilidad(vacanteId);
          setElegibilidad(eleg);
        } catch {
          // Ignorar
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (vacanteId) fetchData();
  }, [vacanteId]);

  const handlePostularme = async () => {
    setActionLoading(true);
    setMessage(null);
    try {
      await postulacionService.postularse(vacanteId);
      setMessage({ type: 'success', text: '¡Te has postulado exitosamente a esta vacante!' });
    } catch (err) {
      setMessage({ type: 'error', text: getApiErrorMessage(err, 'No fue posible postularte.') });
    } finally {
      setActionLoading(false);
    }
  };

  const handleSeleccionarEstudiante = async (postulacion_id: number) => {
    setActionLoading(true);
    setMessage(null);
    try {
      await postulacionService.seleccionarPostulante(postulacion_id);
      setMessage({
        type: 'success',
        text: '¡Estudiante seleccionado con éxito! La práctica ha sido creada y pasa a aprobación del Coordinador.',
      });
      fetchData();
    } catch (err) {
      setMessage({ type: 'error', text: getApiErrorMessage(err, 'Error al seleccionar estudiante.') });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-16 text-center">
        <div className="w-6 h-6 border-2 border-[#EAE8E2] border-t-[#C5A04B] rounded-full animate-spin mx-auto mb-2" />
        <p className="text-xs text-[#777777]">Cargando detalle de la vacante...</p>
      </div>
    );
  }

  if (!vacante) {
    return (
      <Card className="text-center py-12">
        <AlertCircle className="w-8 h-8 text-rose-500 mx-auto mb-2" />
        <h3 className="text-sm font-semibold text-[#292929]">Vacante no encontrada</h3>
        <Button variant="outline" size="sm" className="mt-4" onClick={() => navigate('/vacantes')}>
          Volver a Vacantes
        </Button>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <button
        onClick={() => navigate('/vacantes')}
        className="inline-flex items-center gap-1.5 text-xs text-[#777777] hover:text-[#292929] font-medium transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Regresar a Vacantes
      </button>

      {message && <Alert type={message.type} message={message.text} />}

      {/* Main Info Card */}
      <Card goldAccent>
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-[#EAE8E2]">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[11px] font-semibold text-[#8E712B] bg-[#F7EDD8] px-2 py-0.5 rounded border border-[#E9DDBD]">
                  {vacante.area}
                </span>
                <StatusBadge status={vacante.estado} />
              </div>
              <h1 className="text-xl font-semibold text-[#292929]">{vacante.titulo}</h1>
              <p className="text-xs text-[#777777] mt-1">Vacante ID #{vacante.id}</p>
            </div>

            {role === 'estudiante' && vacante.estado === 'activa' && (
              <Button
                variant="primary"
                onClick={handlePostularme}
                isLoading={actionLoading}
                leftIcon={<Check className="w-4 h-4" />}
              >
                Postularme Ahora
              </Button>
            )}
          </div>

          {/* Details grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-[#F5F5F3] border border-[#EAE8E2] text-xs">
            <div>
              <p className="text-[#777777] flex items-center gap-1 mb-1">
                <Clock className="w-3.5 h-3.5 text-[#A0A0A0]" />
                Duración
              </p>
              <p className="font-semibold text-[#292929]">{vacante.duracion_semanas} semanas</p>
            </div>
            <div>
              <p className="text-[#777777] flex items-center gap-1 mb-1">
                <Clock className="w-3.5 h-3.5 text-[#A0A0A0]" />
                Horas Exigidas
              </p>
              <p className="font-semibold text-[#292929]">{vacante.horas_exigidas} horas</p>
            </div>
            <div>
              <p className="text-[#777777] flex items-center gap-1 mb-1">
                <GraduationCap className="w-3.5 h-3.5 text-[#A0A0A0]" />
                Créditos Mínimos
              </p>
              <p className="font-semibold text-[#292929]">{vacante.creditos_minimos} créditos</p>
            </div>
            <div>
              <p className="text-[#777777] flex items-center gap-1 mb-1">
                <CheckCircle className="w-3.5 h-3.5 text-[#A0A0A0]" />
                Promedio Mínimo
              </p>
              <p className="font-semibold text-[#292929]">{vacante.promedio_minimo.toFixed(1)} / 5.0</p>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-[#777777] mb-2">
              Descripción del Cargo y Responsabilidades
            </h4>
            <p className="text-xs text-[#292929] leading-relaxed whitespace-pre-line bg-[#FAFAF8] p-4 rounded-xl border border-[#EAE8E2]">
              {vacante.descripcion || 'Sin descripción detallada provista.'}
            </p>
          </div>

          {vacante.perfil_requerido && (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-widest text-[#777777] mb-2">
                Perfil y Competencias Requeridas
              </h4>
              <p className="text-xs text-[#292929] leading-relaxed whitespace-pre-line bg-[#FAFAF8] p-4 rounded-xl border border-[#EAE8E2]">
                {vacante.perfil_requerido}
              </p>
            </div>
          )}

          {/* Student Elegibility */}
          {role === 'estudiante' && elegibilidad && (
            <div
              className={`p-4 rounded-xl border text-xs ${
                elegibilidad.elegible
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-amber-50 border-amber-200 text-amber-800'
              }`}
            >
              <div className="flex items-center gap-2 font-semibold mb-1">
                {elegibilidad.elegible ? (
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                )}
                <span>
                  {elegibilidad.elegible
                    ? 'Cumples con los requisitos académicos para esta vacante'
                    : 'Requisitos pendientes para postulación'}
                </span>
              </div>
              {elegibilidad.motivos.length > 0 && (
                <ul className="list-disc pl-5 space-y-0.5 mt-1 text-[11px] opacity-90">
                  {elegibilidad.motivos.map((m, i) => (
                    <li key={i}>{m}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Postulantes list (Empresa & Coordinador) */}
      {(role === 'empresa' || role === 'coordinador') && (
        <Card
          header={
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#C5A04B]" />
                <span className="font-semibold text-xs text-[#292929]">
                  Candidatos Postulados ({postulantes.length})
                </span>
              </div>
            </div>
          }
        >
          {postulantes.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#777777]">
              No hay estudiantes postulados a esta vacante aún.
            </div>
          ) : (
            <div className="divide-y divide-[#EAE8E2]">
              {postulantes.map((post) => (
                <div
                  key={post.postulacion_id}
                  className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold text-[#292929]">
                        {post.estudiante_nombre}
                      </span>
                      <StatusBadge status={post.estado} />
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-[#777777]">
                      <span>ID Estudiante: #{post.estudiante_id}</span>
                      <span>Créditos: <strong className="text-[#292929]">{post.creditos_cursados}</strong></span>
                      <span>Promedio: <strong className="text-[#292929]">{post.promedio.toFixed(2)}</strong></span>
                      <span>Semestre: <strong className="text-[#292929]">{post.semestre}</strong></span>
                    </div>
                  </div>

                  {role === 'empresa' && post.estado === 'postulada' && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleSeleccionarEstudiante(post.postulacion_id)}
                      isLoading={actionLoading}
                      leftIcon={<UserCheck className="w-3.5 h-3.5" />}
                    >
                      Seleccionar para Práctica
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
};
