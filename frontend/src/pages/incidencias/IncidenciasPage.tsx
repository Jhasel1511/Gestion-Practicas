import React, { useEffect, useState } from 'react';
import {
  ShieldAlert,
  PlusCircle,
  Paperclip,
  CheckCircle,
  Eye,
  Filter,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { incidenciaService } from '../../services/incidencia.service';
import { practicaService } from '../../services/practica.service';
import { GravedadIncidencia, Incidencia, Practica } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge, StatusBadge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Alert } from '../../components/common/Alert';
import { getApiErrorMessage } from '../../services/api';

export const IncidenciasPage: React.FC = () => {
  const { role } = useAuth();
  const [incidencias, setIncidencias] = useState<Incidencia[]>([]);
  const [practicas, setPracticas] = useState<Practica[]>([]);
  const [statusFilter, setStatusFilter] = useState('todas');
  const [loading, setLoading] = useState(true);

  // Modal para reportar nueva incidencia
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedPracticaId, setSelectedPracticaId] = useState<number | ''>('');
  const [descripcion, setDescripcion] = useState('');
  const [archivoEvidencia, setArchivoEvidencia] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal clasificar (Gestor)
  const [incidenciaToClassify, setIncidenciaToClassify] = useState<Incidencia | null>(null);
  const [tipoClasificacion, setTipoClasificacion] = useState('Incumplimiento de funciones');
  const [gravedadClasificacion, setGravedadClasificacion] = useState<GravedadIncidencia>('media');
  const [isClassifying, setIsClassifying] = useState(false);

  // Modal escalar (Gestor)
  const [incidenciaToEscalate, setIncidenciaToEscalate] = useState<Incidencia | null>(null);
  const [motivoEscalar, setMotivoEscalar] = useState('');
  const [isEscalating, setIsEscalating] = useState(false);

  // Modal cerrar (Gestor)
  const [incidenciaToClose, setIncidenciaToClose] = useState<Incidencia | null>(null);
  const [resolucionCierre, setResolucionCierre] = useState('');
  const [isClosing, setIsClosing] = useState(false);

  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [incRes, pracRes] = await Promise.all([
        incidenciaService.getIncidencias(),
        practicaService.getMisPracticas().catch(() => practicaService.getPracticas().catch(() => [])),
      ]);
      setIncidencias(incRes);
      setPracticas(pracRes);
      if (pracRes.length > 0) setSelectedPracticaId(pracRes[0].id);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [role]);

  const handleCrearIncidencia = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPracticaId) return;
    if (descripcion.trim().length < 10) {
      setMessage({ type: 'error', text: 'La descripción debe tener al menos 10 caracteres.' });
      return;
    }
    setIsSubmitting(true);
    setMessage(null);
    try {
      const inc = await incidenciaService.crearIncidencia(Number(selectedPracticaId), descripcion);
      if (archivoEvidencia) {
        await incidenciaService.subirEvidencia(inc.id, archivoEvidencia);
      }
      setMessage({ type: 'success', text: '¡Incidencia reportada con éxito! El Gestor la revisará en breve.' });
      setShowCreateModal(false);
      setDescripcion('');
      setArchivoEvidencia(null);
      fetchData();
    } catch (err) {
      setMessage({ type: 'error', text: getApiErrorMessage(err, 'No fue posible reportar la incidencia.') });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClasificar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!incidenciaToClassify) return;
    setIsClassifying(true);
    try {
      await incidenciaService.clasificarIncidencia(
        incidenciaToClassify.id,
        tipoClasificacion,
        gravedadClasificacion
      );
      setMessage({ type: 'success', text: 'Incidencia clasificada y puesta en revisión.' });
      setIncidenciaToClassify(null);
      fetchData();
    } catch (err) {
      setMessage({ type: 'error', text: getApiErrorMessage(err, 'Error al clasificar.') });
    } finally {
      setIsClassifying(false);
    }
  };

  const handleEscalar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!incidenciaToEscalate) return;
    setIsEscalating(true);
    try {
      await incidenciaService.escalarIncidencia(incidenciaToEscalate.id, motivoEscalar);
      setMessage({ type: 'success', text: 'Incidencia escalada a coordinación académica.' });
      setIncidenciaToEscalate(null);
      fetchData();
    } catch (err) {
      setMessage({ type: 'error', text: getApiErrorMessage(err, 'Error al escalar.') });
    } finally {
      setIsEscalating(false);
    }
  };

  const handleCerrar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!incidenciaToClose) return;
    setIsClosing(true);
    try {
      await incidenciaService.cerrarIncidencia(incidenciaToClose.id, resolucionCierre);
      setMessage({ type: 'success', text: 'Incidencia cerrada formalmente con resolución.' });
      setIncidenciaToClose(null);
      fetchData();
    } catch (err) {
      setMessage({ type: 'error', text: getApiErrorMessage(err, 'Error al cerrar.') });
    } finally {
      setIsClosing(false);
    }
  };

  const filteredIncidencias = incidencias.filter((i) => {
    if (statusFilter === 'todas') return true;
    return i.estado === statusFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-[#292929]">
            Centro de Incidencias y Mediación
          </h1>
          <p className="text-xs text-[#777777] mt-1">
            Gestión formal de anomalías, soporte a las partes y adjunto de evidencias.
          </p>
        </div>

        {(role === 'estudiante' || role === 'empresa') && (
          <Button
            variant="primary"
            onClick={() => setShowCreateModal(true)}
            leftIcon={<PlusCircle className="w-4 h-4" />}
          >
            Reportar Nueva Incidencia
          </Button>
        )}
      </div>

      {message && <Alert type={message.type} message={message.text} />}

      {/* Filter bar */}
      <div className="flex items-center gap-2 bg-white p-3 rounded-xl border border-[#EAE8E2] shadow-card">
        <Filter className="w-4 h-4 text-[#A0A0A0]" />
        <span className="text-xs font-semibold text-[#777777]">Filtrar por Estado:</span>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="text-xs py-1.5 px-3 rounded-lg border border-[#EAE8E2] focus:outline-none focus:ring-2 focus:ring-[#C5A04B]/30 bg-[#FAFAF8] text-[#292929]"
        >
          <option value="todas">Todas las Incidencias</option>
          <option value="abierta">Abiertas</option>
          <option value="en_revision">En Revisión</option>
          <option value="escalada">Escaladas</option>
          <option value="cerrada">Cerradas</option>
        </select>
      </div>

      {/* List */}
      {loading ? (
        <div className="py-16 text-center text-xs text-[#777777]">
          <div className="w-6 h-6 border-2 border-[#EAE8E2] border-t-[#C5A04B] rounded-full animate-spin mx-auto mb-2" />
          Cargando incidencias...
        </div>
      ) : filteredIncidencias.length === 0 ? (
        <Card className="text-center py-12">
          <div className="w-11 h-11 rounded-full bg-[#F7EDD8] text-[#C5A04B] flex items-center justify-center mx-auto mb-3">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-semibold text-[#292929]">No hay incidencias registradas</h3>
          <p className="text-xs text-[#777777] max-w-sm mx-auto mt-1">
            Todo se encuentra en orden con las prácticas vigentes.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredIncidencias.map((inc) => (
            <Card key={inc.id} padding="md" className="hover:border-[#C5A04B]/50 transition-all">
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-[#EAE8E2]">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-[#292929] text-xs">Caso #{inc.id}</span>
                    <StatusBadge status={inc.estado} />
                    {inc.gravedad && <StatusBadge status={inc.gravedad} />}
                    {inc.tipo && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-[#F5F5F3] text-[#777777] font-medium border border-[#EAE8E2]">
                        {inc.tipo}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-[#A0A0A0]">
                    Práctica #{inc.practica_id} · Reportante #{inc.reportada_por_id}
                  </span>
                </div>

                <div>
                  <p className="text-xs text-[#292929] leading-relaxed whitespace-pre-line">
                    {inc.descripcion}
                  </p>
                </div>

                {/* Evidencias adjuntas */}
                {inc.evidencias && inc.evidencias.length > 0 && (
                  <div className="p-3 bg-[#FAFAF8] rounded-lg border border-[#EAE8E2]">
                    <span className="text-[11px] font-semibold text-[#777777] block mb-1.5">
                      Evidencias Adjuntas ({inc.evidencias.length}):
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {inc.evidencias.map((ev) => (
                        <a
                          key={ev.id}
                          href={incidenciaService.getEvidenciaUrl(inc.id, ev.id)}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-white border border-[#EAE8E2] text-xs text-[#8E712B] hover:border-[#C5A04B] font-medium shadow-card"
                        >
                          <Paperclip className="w-3 h-3 text-[#C5A04B]" />
                          <span className="max-w-[140px] truncate">{ev.nombre_archivo}</span>
                          <Eye className="w-3 h-3 text-[#A0A0A0]" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {inc.motivo_escalamiento && (
                  <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900">
                    <strong>Motivo de Escalamiento:</strong> {inc.motivo_escalamiento}
                  </div>
                )}

                {inc.resolucion && (
                  <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-900">
                    <strong>Resolución:</strong> {inc.resolucion}
                  </div>
                )}

                {/* Gestor Actions */}
                {role === 'gestor' && inc.estado !== 'cerrada' && (
                  <div className="pt-2 border-t border-[#EAE8E2] flex flex-wrap gap-2 justify-end">
                    {inc.estado === 'abierta' && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => setIncidenciaToClassify(inc)}
                      >
                        Clasificar Caso
                      </Button>
                    )}
                    {inc.estado !== 'escalada' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIncidenciaToEscalate(inc)}
                        className="text-amber-700 border-amber-300"
                      >
                        Escalar Caso
                      </Button>
                    )}
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setIncidenciaToClose(inc)}
                      leftIcon={<CheckCircle className="w-3.5 h-3.5 text-emerald-400" />}
                    >
                      Cerrar Caso
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal Crear Incidencia */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Reportar Incidencia"
        description="Describe el inconveniente ocurrido durante tu práctica"
      >
        <form onSubmit={handleCrearIncidencia} className="space-y-4">
          <div>
            <label className="block text-[11px] font-semibold text-[#777777] uppercase tracking-widest mb-1">
              Práctica Afectada *
            </label>
            <select
              required
              value={selectedPracticaId}
              onChange={(e) => setSelectedPracticaId(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs rounded-lg border border-[#EAE8E2] focus:outline-none focus:ring-2 focus:ring-[#C5A04B]/30 bg-white text-[#292929]"
            >
              {practicas.map((pr) => (
                <option key={pr.id} value={pr.id}>
                  Práctica #{pr.id} ({pr.estado})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#777777] uppercase tracking-widest mb-1">
              Descripción de los Hechos (mínimo 10 caracteres) *
            </label>
            <textarea
              rows={4}
              required
              minLength={10}
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Explica detalladamente la situación acontecida..."
              className="w-full px-3 py-2 text-xs rounded-lg border border-[#EAE8E2] focus:outline-none focus:ring-2 focus:ring-[#C5A04B]/30 bg-white text-[#292929]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#777777] uppercase tracking-widest mb-1">
              Adjuntar Archivo de Evidencia (opcional)
            </label>
            <input
              type="file"
              onChange={(e) => setArchivoEvidencia(e.target.files?.[0] || null)}
              className="w-full text-xs text-[#777777] file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#F7EDD8] file:text-[#8E712B]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowCreateModal(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSubmitting}
            >
              Enviar Reporte
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Clasificar */}
      <Modal
        isOpen={!!incidenciaToClassify}
        onClose={() => setIncidenciaToClassify(null)}
        title="Clasificar Incidencia"
        description={`Asignar tipología y nivel de gravedad al Caso #${incidenciaToClassify?.id}`}
      >
        <form onSubmit={handleClasificar} className="space-y-4">
          <div>
            <label className="block text-[11px] font-semibold text-[#777777] uppercase tracking-widest mb-1">
              Tipo de Incidencia *
            </label>
            <input
              type="text"
              required
              value={tipoClasificacion}
              onChange={(e) => setTipoClasificacion(e.target.value)}
              placeholder="Ej. Conflicto de horario, funciones..."
              className="w-full px-3 py-2 text-xs rounded-lg border border-[#EAE8E2] focus:outline-none focus:ring-2 focus:ring-[#C5A04B]/30 bg-white text-[#292929]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#777777] uppercase tracking-widest mb-1">
              Nivel de Gravedad *
            </label>
            <select
              value={gravedadClasificacion}
              onChange={(e) => setGravedadClasificacion(e.target.value as GravedadIncidencia)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-[#EAE8E2] focus:outline-none focus:ring-2 focus:ring-[#C5A04B]/30 bg-white text-[#292929]"
            >
              <option value="baja">Baja (Manejo ordinario)</option>
              <option value="media">Media (Requiere intervención)</option>
              <option value="alta">Alta (Crítica / Urgente)</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIncidenciaToClassify(null)}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={isClassifying}>
              Guardar Clasificación
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Escalar */}
      <Modal
        isOpen={!!incidenciaToEscalate}
        onClose={() => setIncidenciaToEscalate(null)}
        title="Escalar Caso"
        description={`Escalar Caso #${incidenciaToEscalate?.id} a instancias superiores`}
      >
        <form onSubmit={handleEscalar} className="space-y-4">
          <div>
            <label className="block text-[11px] font-semibold text-[#777777] uppercase tracking-widest mb-1">
              Motivo del Escalamiento *
            </label>
            <textarea
              rows={3}
              required
              minLength={5}
              value={motivoEscalar}
              onChange={(e) => setMotivoEscalar(e.target.value)}
              placeholder="Explica por qué este caso debe ser atendido a nivel superior..."
              className="w-full px-3 py-2 text-xs rounded-lg border border-[#EAE8E2] focus:outline-none focus:ring-2 focus:ring-[#C5A04B]/30 bg-white text-[#292929]"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIncidenciaToEscalate(null)}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={isEscalating}>
              Confirmar Escalamiento
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Cerrar */}
      <Modal
        isOpen={!!incidenciaToClose}
        onClose={() => setIncidenciaToClose(null)}
        title="Cerrar y Resolver Caso"
        description={`Registrar la resolución final para el Caso #${incidenciaToClose?.id}`}
      >
        <form onSubmit={handleCerrar} className="space-y-4">
          <div>
            <label className="block text-[11px] font-semibold text-[#777777] uppercase tracking-widest mb-1">
              Resolución y Acuerdos *
            </label>
            <textarea
              rows={3}
              required
              minLength={5}
              value={resolucionCierre}
              onChange={(e) => setResolucionCierre(e.target.value)}
              placeholder="Detalla los acuerdos de mediación o la solución definitiva..."
              className="w-full px-3 py-2 text-xs rounded-lg border border-[#EAE8E2] focus:outline-none focus:ring-2 focus:ring-[#C5A04B]/30 bg-white text-[#292929]"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIncidenciaToClose(null)}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="secondary" size="sm" isLoading={isClosing}>
              Cerrar Caso Formalmente
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
