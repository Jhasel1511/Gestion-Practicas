import React, { useEffect, useState } from 'react';
import {
  CalendarCheck,
  Clock,
  PlusCircle,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Filter,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { horasService } from '../../services/horas.service';
import { practicaService } from '../../services/practica.service';
import { Practica, ProgresoHoras, RegistroHoras } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { StatusBadge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Alert } from '../../components/common/Alert';
import { StatCard } from '../../components/common/StatCard';
import { getApiErrorMessage } from '../../services/api';

export const ControlHorasPage: React.FC = () => {
  const { role } = useAuth();
  const [practicas, setPracticas] = useState<Practica[]>([]);
  const [selectedPracticaId, setSelectedPracticaId] = useState<number | null>(null);
  const [progreso, setProgreso] = useState<ProgresoHoras | null>(null);
  const [registros, setRegistros] = useState<RegistroHoras[]>([]);
  const [statusFilter, setStatusFilter] = useState('todas');
  const [loading, setLoading] = useState(true);

  // Modal para registrar horas (Estudiante)
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [horas, setHoras] = useState(4);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchPracticas = async () => {
    try {
      setLoading(true);
      const data =
        role === 'coordinador'
          ? await practicaService.getPracticas()
          : await practicaService.getMisPracticas();
      setPracticas(data);

      if (data.length > 0) {
        const initialId = data[0].id;
        setSelectedPracticaId(initialId);
        await loadHorasData(initialId);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadHorasData = async (practicaId: number) => {
    try {
      const [progRes, regsRes] = await Promise.all([
        horasService.getProgreso(practicaId).catch(() => null),
        horasService.getHoras(practicaId).catch(() => []),
      ]);
      setProgreso(progRes);
      setRegistros(regsRes);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPracticas();
  }, [role]);

  const handleSelectPractica = (id: number) => {
    setSelectedPracticaId(id);
    loadHorasData(id);
  };

  const handleRegistrarHoras = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPracticaId) return;
    setIsSubmitting(true);
    setMessage(null);
    try {
      await horasService.registrarHoras(selectedPracticaId, { fecha, horas });
      setMessage({ type: 'success', text: '¡Registro de horas enviado a la empresa para su confirmación!' });
      setShowRegisterModal(false);
      loadHorasData(selectedPracticaId);
    } catch (err) {
      setMessage({ type: 'error', text: getApiErrorMessage(err, 'No fue posible registrar las horas.') });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmar = async (registroId: number) => {
    try {
      await horasService.confirmarHoras(registroId);
      if (selectedPracticaId) loadHorasData(selectedPracticaId);
    } catch (err) {
      setMessage({ type: 'error', text: getApiErrorMessage(err, 'Error al confirmar horas.') });
    }
  };

  const handleRechazar = async (registroId: number) => {
    try {
      await horasService.rechazarHoras(registroId);
      if (selectedPracticaId) loadHorasData(selectedPracticaId);
    } catch (err) {
      setMessage({ type: 'error', text: getApiErrorMessage(err, 'Error al rechazar horas.') });
    }
  };

  const filteredRegistros = registros.filter((r) => {
    if (statusFilter === 'todas') return true;
    return r.estado_confirmacion === statusFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-[#292929]">
            Control y Registro de Horas
          </h1>
          <p className="text-xs text-[#777777] mt-1">
            {role === 'estudiante'
              ? 'Registra tus jornadas diarias para validación empresarial y seguimiento académico.'
              : 'Supervisa y autoriza las horas reportadas por los practicantes asignados.'}
          </p>
        </div>

        {role === 'estudiante' && selectedPracticaId && (
          <Button
            variant="primary"
            onClick={() => setShowRegisterModal(true)}
            leftIcon={<PlusCircle className="w-4 h-4" />}
          >
            Registrar Horas
          </Button>
        )}
      </div>

      {message && <Alert type={message.type} message={message.text} />}

      {/* Practica selector if multiple */}
      {practicas.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-xs font-semibold text-[#777777] shrink-0">Práctica:</span>
          {practicas.map((pr) => (
            <button
              key={pr.id}
              onClick={() => handleSelectPractica(pr.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 ${
                selectedPracticaId === pr.id
                  ? 'bg-[#C5A04B] text-white'
                  : 'bg-white border border-[#EAE8E2] text-[#777777] hover:bg-[#F5F5F3]'
              }`}
            >
              Práctica #{pr.id} ({pr.estado})
            </button>
          ))}
        </div>
      )}

      {/* Progress & Stat Cards */}
      {progreso && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Confirmadas"
              value={`${progreso.horas_confirmadas}h`}
              subtitle={`De ${progreso.horas_requeridas}h requeridas`}
              icon={<CheckCircle2 className="w-4.5 h-4.5" />}
              accent="emerald"
            />
            <StatCard
              title="Pendientes"
              value={`${progreso.horas_pendientes}h`}
              subtitle="Esperando confirmación"
              icon={<Clock className="w-4.5 h-4.5" />}
              accent="amber"
            />
            <StatCard
              title="Cumplimiento"
              value={`${progreso.porcentaje}%`}
              subtitle={progreso.completada ? 'Meta alcanzada' : 'En progreso'}
              icon={<TrendingUp className="w-4.5 h-4.5" />}
              accent={progreso.completada ? 'emerald' : 'gold'}
            />
            <StatCard
              title="Estado"
              value={progreso.completada ? 'COMPLETADA' : 'EN CURSO'}
              subtitle={progreso.completada ? 'Lista para certificar' : 'Acumulando horas'}
              icon={<CalendarCheck className="w-4.5 h-4.5" />}
            />
          </div>

          {/* Progress bar */}
          <Card padding="md">
            <div className="flex justify-between items-center text-xs font-medium mb-1.5">
              <span className="text-[#777777]">Progreso Total de Práctica #{selectedPracticaId}</span>
              <span className="text-[#C5A04B] font-semibold">{progreso.porcentaje}%</span>
            </div>
            <div className="w-full bg-[#F5F5F3] rounded-full h-2 border border-[#EAE8E2]">
              <div
                className="bg-[#C5A04B] h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(progreso.porcentaje, 100)}%` }}
              />
            </div>
          </Card>
        </>
      )}

      {/* Table of records */}
      <Card
        header={
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full">
            <div className="flex items-center gap-2">
              <CalendarCheck className="w-4 h-4 text-[#777777]" />
              <span className="font-semibold text-xs text-[#292929]">
                Bitácora de Horas Registradas ({registros.length})
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-[#A0A0A0]" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs py-1 px-2.5 rounded-lg border border-[#EAE8E2] bg-white text-[#292929]"
              >
                <option value="todas">Todos los Estados</option>
                <option value="pendiente">Pendientes</option>
                <option value="confirmada">Confirmadas</option>
                <option value="rechazada">Rechazadas</option>
              </select>
            </div>
          </div>
        }
      >
        {loading ? (
          <div className="py-12 text-center text-xs text-[#777777]">Cargando registros...</div>
        ) : filteredRegistros.length === 0 ? (
          <div className="py-12 text-center text-xs text-[#777777]">
            No hay registros de horas reportados para esta práctica.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#FAFAF8] text-[#777777] uppercase tracking-wider font-semibold border-b border-[#EAE8E2]">
                <tr>
                  <th className="px-4 py-2.5">ID</th>
                  <th className="px-4 py-2.5">Fecha</th>
                  <th className="px-4 py-2.5">Horas</th>
                  <th className="px-4 py-2.5">Estado</th>
                  {(role === 'empresa' || role === 'coordinador') && (
                    <th className="px-4 py-2.5 text-right">Acción</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAE8E2]">
                {filteredRegistros.map((reg) => (
                  <tr key={reg.id} className="hover:bg-[#FAFAF8] transition-colors">
                    <td className="px-4 py-3 font-semibold text-[#292929]">#{reg.id}</td>
                    <td className="px-4 py-3 text-[#292929]">{reg.fecha}</td>
                    <td className="px-4 py-3 font-semibold text-[#292929]">{reg.horas} hrs</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={reg.estado_confirmacion} />
                    </td>
                    {(role === 'empresa' || role === 'coordinador') && (
                      <td className="px-4 py-3 text-right">
                        {reg.estado_confirmacion === 'pendiente' && (
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handleConfirmar(reg.id)}
                              leftIcon={<CheckCircle2 className="w-3 h-3" />}
                            >
                              Confirmar
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRechazar(reg.id)}
                              className="text-rose-600 border-rose-200 hover:bg-rose-50"
                              leftIcon={<XCircle className="w-3 h-3" />}
                            >
                              Rechazar
                            </Button>
                          </div>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Modal Registrar Horas */}
      <Modal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        title="Reportar Jornada de Práctica"
        description="Ingresa la fecha y el número de horas trabajadas"
      >
        <form onSubmit={handleRegistrarHoras} className="space-y-4">
          <div>
            <label className="block text-[11px] font-semibold text-[#777777] uppercase tracking-widest mb-1.5">
              Fecha de la Actividad *
            </label>
            <input
              type="date"
              required
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-lg border border-[#EAE8E2] focus:outline-none focus:ring-2 focus:ring-[#C5A04B]/30 bg-white text-[#292929]"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-[#777777] uppercase tracking-widest mb-1.5">
              Cantidad de Horas (máximo 12h) *
            </label>
            <input
              type="number"
              step="0.5"
              min={0.5}
              max={12}
              required
              value={horas}
              onChange={(e) => setHoras(Number(e.target.value))}
              className="w-full px-3.5 py-2 text-xs rounded-lg border border-[#EAE8E2] focus:outline-none focus:ring-2 focus:ring-[#C5A04B]/30 bg-white text-[#292929]"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowRegisterModal(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSubmitting}
            >
              Enviar Registro
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
