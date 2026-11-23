import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  CheckCircle,
  XCircle,
  Clock,
  Filter,
  Check,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { practicaService } from '../../services/practica.service';
import { Practica } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { StatusBadge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Alert } from '../../components/common/Alert';
import { getApiErrorMessage } from '../../services/api';

export const PracticasListPage: React.FC = () => {
  const navigate = useNavigate();
  const { role } = useAuth();
  const [practicas, setPracticas] = useState<Practica[]>([]);
  const [statusFilter, setStatusFilter] = useState('todas');
  const [loading, setLoading] = useState(true);

  // Modal para aprobar práctica (Coordinador)
  const [practicaToApprove, setPracticaToApprove] = useState<Practica | null>(null);
  const [fechaInicio, setFechaInicio] = useState(new Date().toISOString().split('T')[0]);
  const [observacionesAprobar, setObservacionesAprobar] = useState('');
  const [isApproving, setIsApproving] = useState(false);

  // Modal para rechazar práctica (Coordinador)
  const [practicaToReject, setPracticaToReject] = useState<Practica | null>(null);
  const [observacionesRechazar, setObservacionesRechazar] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);

  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchPracticas = async () => {
    try {
      setLoading(true);
      const data =
        role === 'coordinador'
          ? await practicaService.getPracticas()
          : await practicaService.getMisPracticas();
      setPracticas(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPracticas();
  }, [role]);

  const handleAprobar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!practicaToApprove) return;
    setIsApproving(true);
    setMessage(null);
    try {
      await practicaService.aprobarPractica(practicaToApprove.id, {
        fecha_inicio: fechaInicio,
        observaciones: observacionesAprobar,
      });
      setMessage({ type: 'success', text: '¡Práctica aprobada con éxito! Estado actualizado a en_curso.' });
      setPracticaToApprove(null);
      fetchPracticas();
    } catch (err) {
      setMessage({ type: 'error', text: getApiErrorMessage(err, 'No fue posible aprobar la práctica.') });
    } finally {
      setIsApproving(false);
    }
  };

  const handleRechazar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!practicaToReject) return;
    if (observacionesRechazar.trim().length < 5) {
      setMessage({ type: 'error', text: 'El motivo de rechazo debe contener al menos 5 caracteres.' });
      return;
    }
    setIsRejecting(true);
    setMessage(null);
    try {
      await practicaService.rechazarPractica(practicaToReject.id, {
        observaciones: observacionesRechazar,
      });
      setMessage({ type: 'success', text: 'Práctica rechazada con éxito.' });
      setPracticaToReject(null);
      fetchPracticas();
    } catch (err) {
      setMessage({ type: 'error', text: getApiErrorMessage(err, 'No fue posible rechazar la práctica.') });
    } finally {
      setIsRejecting(false);
    }
  };

  const filteredPracticas = practicas.filter((p) => {
    if (statusFilter === 'todas') return true;
    return p.estado === statusFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-[#292929]">
            {role === 'coordinador' ? 'Gestión y Supervisión de Prácticas' : 'Prácticas Profesionales'}
          </h1>
          <p className="text-xs text-[#777777] mt-1">
            Validación de requisitos, autorizaciones formales de inicio y seguimiento de avances.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-[#A0A0A0] shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs py-2 px-3 rounded-lg border border-[#EAE8E2] focus:outline-none focus:ring-2 focus:ring-[#C5A04B]/30 bg-white text-[#292929]"
          >
            <option value="todas">Todos los Estados</option>
            <option value="postulada">Postuladas</option>
            <option value="aprobada">Aprobadas</option>
            <option value="en_curso">En Curso</option>
            <option value="cerrada">Cerradas</option>
            <option value="rechazada">Rechazadas</option>
          </select>
        </div>
      </div>

      {message && <Alert type={message.type} message={message.text} />}

      {loading ? (
        <div className="py-16 text-center">
          <div className="w-6 h-6 border-2 border-[#EAE8E2] border-t-[#C5A04B] rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs text-[#777777]">Cargando prácticas...</p>
        </div>
      ) : filteredPracticas.length === 0 ? (
        <Card className="text-center py-12">
          <div className="w-11 h-11 rounded-full bg-[#F7EDD8] text-[#C5A04B] flex items-center justify-center mx-auto mb-3">
            <GraduationCap className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-semibold text-[#292929]">No se encontraron prácticas</h3>
          <p className="text-xs text-[#777777] max-w-sm mx-auto mt-1">
            No existen registros que coincidan con el filtro seleccionado.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredPracticas.map((pr) => (
            <Card key={pr.id} padding="md" className="hover:border-[#C5A04B]/50 transition-all">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-[#292929]">Práctica #{pr.id}</span>
                    <StatusBadge status={pr.estado} />
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-[#777777]">
                    <span>Postulación #{pr.postulacion_id}</span>
                    <span>Horas Exigidas: <strong className="text-[#292929]">{pr.horas_requeridas}h</strong></span>
                    {pr.fecha_inicio && (
                      <span>Inicio: <strong className="text-[#292929]">{pr.fecha_inicio}</strong></span>
                    )}
                    {pr.coordinador_id && (
                      <span>Coordinador ID: #{pr.coordinador_id}</span>
                    )}
                  </div>
                  {pr.observaciones && (
                    <p className="text-xs text-[#777777] mt-2 bg-[#FAFAF8] p-2 rounded border border-[#EAE8E2]">
                      <strong>Observaciones:</strong> {pr.observaciones}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {role === 'coordinador' && (pr.estado === 'postulada' || pr.estado === 'aprobada') && (
                    <>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => setPracticaToApprove(pr)}
                        leftIcon={<CheckCircle className="w-3.5 h-3.5" />}
                      >
                        Aprobar Inicio
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPracticaToReject(pr)}
                        className="text-rose-600 border-rose-200 hover:bg-rose-50"
                        leftIcon={<XCircle className="w-3.5 h-3.5" />}
                      >
                        Rechazar
                      </Button>
                    </>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/control-horas')}
                    leftIcon={<Clock className="w-3.5 h-3.5 text-[#C5A04B]" />}
                  >
                    Ver Horas
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal Aprobar */}
      <Modal
        isOpen={!!practicaToApprove}
        onClose={() => setPracticaToApprove(null)}
        title="Aprobar Inicio de Práctica"
        description={`Autorización académica para la Práctica #${practicaToApprove?.id}`}
      >
        <form onSubmit={handleAprobar} className="space-y-4">
          <div>
            <label className="block text-[11px] font-semibold text-[#777777] uppercase tracking-widest mb-1.5">
              Fecha de Inicio Formal *
            </label>
            <input
              type="date"
              required
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-lg border border-[#EAE8E2] focus:outline-none focus:ring-2 focus:ring-[#C5A04B]/30 bg-white text-[#292929]"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-[#777777] uppercase tracking-widest mb-1.5">
              Observaciones / Lineamientos Académicos
            </label>
            <textarea
              rows={3}
              value={observacionesAprobar}
              onChange={(e) => setObservacionesAprobar(e.target.value)}
              placeholder="Indicaciones para el estudiante y la empresa..."
              className="w-full px-3.5 py-2 text-xs rounded-lg border border-[#EAE8E2] focus:outline-none focus:ring-2 focus:ring-[#C5A04B]/30 bg-white text-[#292929]"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setPracticaToApprove(null)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isApproving}
              leftIcon={<Check className="w-3.5 h-3.5" />}
            >
              Confirmar Aprobación
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Rechazar */}
      <Modal
        isOpen={!!practicaToReject}
        onClose={() => setPracticaToReject(null)}
        title="Rechazar Práctica"
        description={`Indica el motivo de rechazo para la Práctica #${practicaToReject?.id}`}
      >
        <form onSubmit={handleRechazar} className="space-y-4">
          <div>
            <label className="block text-[11px] font-semibold text-[#777777] uppercase tracking-widest mb-1.5">
              Motivo de Rechazo (mínimo 5 caracteres) *
            </label>
            <textarea
              rows={3}
              required
              minLength={5}
              value={observacionesRechazar}
              onChange={(e) => setObservacionesRechazar(e.target.value)}
              placeholder="Explica la razón por la cual no se autoriza esta práctica..."
              className="w-full px-3.5 py-2 text-xs rounded-lg border border-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-400 bg-white text-[#292929]"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setPracticaToReject(null)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="danger"
              size="sm"
              isLoading={isRejecting}
              leftIcon={<XCircle className="w-3.5 h-3.5" />}
            >
              Confirmar Rechazo
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
