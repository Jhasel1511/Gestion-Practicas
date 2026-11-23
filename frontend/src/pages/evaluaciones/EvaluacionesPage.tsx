import React, { useEffect, useState } from 'react';
import {
  Award,
  Star,
  Printer,
  GraduationCap,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { evaluacionService } from '../../services/evaluacion.service';
import { practicaService } from '../../services/practica.service';
import { horasService } from '../../services/horas.service';
import { Certificado, Evaluacion, Practica, ProgresoHoras } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Alert } from '../../components/common/Alert';
import { getApiErrorMessage } from '../../services/api';

export const EvaluacionesPage: React.FC = () => {
  const { role } = useAuth();
  const [practicas, setPracticas] = useState<Practica[]>([]);
  const [selectedPracticaId, setSelectedPracticaId] = useState<number | null>(null);
  const [evaluaciones, setEvaluaciones] = useState<Evaluacion[]>([]);
  const [progreso, setProgreso] = useState<ProgresoHoras | null>(null);
  const [certificado, setCertificado] = useState<Certificado | null>(null);
  const [loading, setLoading] = useState(true);

  // Modal para emitir evaluación
  const [showEvalModal, setShowEvalModal] = useState(false);
  const [calificacion, setCalificacion] = useState<number>(5.0);
  const [comentarios, setComentarios] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Certificado
  const [isGeneratingCert, setIsGeneratingCert] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const pracs =
        role === 'coordinador'
          ? await practicaService.getPracticas()
          : await practicaService.getMisPracticas();
      setPracticas(pracs);

      if (pracs.length > 0) {
        const pId = pracs[0].id;
        setSelectedPracticaId(pId);
        await loadPracticaDetails(pId);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadPracticaDetails = async (practicaId: number) => {
    try {
      const [evalsRes, progRes, certRes] = await Promise.all([
        evaluacionService.getEvaluaciones(practicaId).catch(() => []),
        horasService.getProgreso(practicaId).catch(() => null),
        evaluacionService.getCertificado(practicaId).catch(() => null),
      ]);
      setEvaluaciones(evalsRes);
      setProgreso(progRes);
      setCertificado(certRes);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, [role]);

  const handleSelectPractica = (id: number) => {
    setSelectedPracticaId(id);
    loadPracticaDetails(id);
  };

  const handleSubmitEvaluacion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPracticaId) return;
    setIsSubmitting(true);
    setMessage(null);
    try {
      await evaluacionService.crearEvaluacion(selectedPracticaId, calificacion, comentarios);
      setMessage({ type: 'success', text: '¡Evaluación registrada exitosamente!' });
      setShowEvalModal(false);
      setComentarios('');
      loadPracticaDetails(selectedPracticaId);
    } catch (err) {
      setMessage({ type: 'error', text: getApiErrorMessage(err, 'No fue posible registrar la evaluación.') });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGenerarCertificado = async () => {
    if (!selectedPracticaId) return;
    setIsGeneratingCert(true);
    setMessage(null);
    try {
      const cert = await evaluacionService.generarCertificado(selectedPracticaId);
      setCertificado(cert);
      setMessage({ type: 'success', text: '¡Certificado de Prácticas Profesionales generado con éxito!' });
    } catch (err) {
      setMessage({
        type: 'error',
        text: getApiErrorMessage(
          err,
          'No es posible generar el certificado aún. Verifica que las horas estén cumplidas y ambas partes hayan evaluado.'
        ),
      });
    } finally {
      setIsGeneratingCert(false);
    }
  };

  const handlePrintCertificate = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-[#292929]">
            Evaluaciones y Certificación de Práctica
          </h1>
          <p className="text-xs text-[#777777] mt-1">
            Calificación recíproca de desempeño y expedición del Certificado Oficial.
          </p>
        </div>

        {selectedPracticaId && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowEvalModal(true)}
              leftIcon={<Star className="w-3.5 h-3.5 text-[#C5A04B]" />}
            >
              Emitir Calificación
            </Button>
            {role === 'coordinador' && !certificado && (
              <Button
                variant="primary"
                size="sm"
                isLoading={isGeneratingCert}
                onClick={handleGenerarCertificado}
                leftIcon={<Award className="w-3.5 h-3.5" />}
              >
                Generar Certificado
              </Button>
            )}
          </div>
        )}
      </div>

      {message && <Alert type={message.type} message={message.text} />}

      {/* Select Practice */}
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
              Práctica #{pr.id}
            </button>
          ))}
        </div>
      )}

      {/* Evaluaciones Registradas Grid */}
      <Card
        header={
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-[#C5A04B]" />
              <span className="font-semibold text-xs text-[#292929]">
                Evaluaciones de Desempeño ({evaluaciones.length})
              </span>
            </div>
            <span className="text-xs text-[#777777]">
              {progreso ? `${progreso.horas_confirmadas} / ${progreso.horas_requeridas} horas` : ''}
            </span>
          </div>
        }
      >
        {evaluaciones.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#777777]">
            Aún no se han registrado evaluaciones para esta práctica.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {evaluaciones.map((ev) => (
              <div
                key={ev.id}
                className="p-4 rounded-xl border border-[#EAE8E2] bg-[#FAFAF8] space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[#8E712B] bg-[#F7EDD8] px-2 py-0.5 rounded border border-[#E9DDBD]">
                    {ev.tipo === 'empresa_a_estudiante'
                      ? 'Empresa ➔ Practicante'
                      : 'Practicante ➔ Empresa'}
                  </span>
                  <div className="flex items-center gap-1 font-bold text-xs text-[#8E712B]">
                    <Star className="w-3.5 h-3.5 fill-[#C5A04B] text-[#C5A04B]" />
                    <span>{ev.calificacion.toFixed(1)} / 5.0</span>
                  </div>
                </div>

                <p className="text-xs text-[#292929] leading-relaxed italic bg-white p-3 rounded-lg border border-[#EAE8E2]">
                  "{ev.comentarios || 'Sin comentarios adicionales.'}"
                </p>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Official Certificate Section */}
      {certificado ? (
        <Card goldAccent className="p-6 sm:p-10 bg-white shadow-card">
          <div className="flex justify-end mb-4 no-print">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrintCertificate}
              leftIcon={<Printer className="w-3.5 h-3.5 text-[#C5A04B]" />}
            >
              Imprimir o Guardar PDF
            </Button>
          </div>

          {/* Printable Diploma Style Canvas */}
          <div className="border-2 border-[#E9DDBD] p-8 sm:p-12 rounded-xl bg-[#FAFAF8] relative overflow-hidden text-center text-[#292929]">
            <div className="w-12 h-12 rounded-full bg-[#F7EDD8] border border-[#E9DDBD] flex items-center justify-center mx-auto mb-3 text-[#C5A04B]">
              <GraduationCap className="w-6 h-6" />
            </div>

            <p className="text-[10px] uppercase tracking-widest font-semibold text-[#8E712B] mb-1">
              Universidad del Norte · Dirección Académica
            </p>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#292929] tracking-tight mb-2">
              CERTIFICADO DE PRÁCTICA PROFESIONAL
            </h2>
            <div className="w-20 h-0.5 bg-[#C5A04B] mx-auto mb-5" />

            <p className="text-xs text-[#777777] max-w-lg mx-auto leading-relaxed mb-4">
              El Comité de Coordinación de Prácticas Profesionales certifica que el/la estudiante:
            </p>

            <h3 className="text-lg sm:text-xl font-semibold text-[#292929] mb-4">
              {certificado.estudiante_nombre}
            </h3>

            <p className="text-xs text-[#777777] max-w-xl mx-auto leading-relaxed mb-6">
              Ha culminado satisfactoriamente su periodo de práctica profesional desempeñando el cargo de{' '}
              <strong className="text-[#292929]">"{certificado.vacante_titulo}"</strong> en la organización{' '}
              <strong className="text-[#292929]">{certificado.empresa_nombre}</strong>, cumpliendo un total de{' '}
              <strong className="text-[#8E712B]">{certificado.horas_totales} horas</strong> reglamentarias con excelente desempeño ético y profesional.
            </p>

            <div className="grid grid-cols-2 gap-6 max-w-xs mx-auto pt-6 border-t border-[#EAE8E2] text-xs">
              <div>
                <p className="font-semibold text-[#292929]">Coordinación</p>
                <p className="text-[10px] text-[#777777]">ID: #{certificado.coordinador_id}</p>
              </div>
              <div>
                <p className="font-semibold text-[#292929]">Expedición</p>
                <p className="text-[10px] text-[#777777]">{certificado.fecha_emision}</p>
              </div>
            </div>

            <div className="mt-6 text-[10px] text-[#A0A0A0]">
              Certificado Digital SGP #{certificado.id} · Validación institucional
            </div>
          </div>
        </Card>
      ) : (
        <Card className="text-center py-10">
          <div className="w-10 h-10 rounded-full bg-[#F7EDD8] text-[#C5A04B] flex items-center justify-center mx-auto mb-3 border border-[#E9DDBD]">
            <Award className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-semibold text-[#292929]">Certificado Aún No Emitido</h3>
          <p className="text-xs text-[#777777] max-w-sm mx-auto mt-1 mb-4">
            El certificado oficial estará disponible una vez se alcancen las horas requeridas y la Coordinación apruebe el cierre.
          </p>
          {role === 'coordinador' && (
            <Button
              variant="primary"
              size="sm"
              isLoading={isGeneratingCert}
              onClick={handleGenerarCertificado}
            >
              Generar Certificado Ahora
            </Button>
          )}
        </Card>
      )}

      {/* Modal Emitir Evaluación */}
      <Modal
        isOpen={showEvalModal}
        onClose={() => setShowEvalModal(false)}
        title="Registrar Evaluación"
        description="Evalúa el desempeño integral del proceso de práctica"
      >
        <form onSubmit={handleSubmitEvaluacion} className="space-y-4">
          <div>
            <label className="block text-[11px] font-semibold text-[#777777] uppercase tracking-widest mb-1.5">
              Calificación (0 a 5.0) *
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                step="0.1"
                min={0}
                max={5}
                required
                value={calificacion}
                onChange={(e) => setCalificacion(Number(e.target.value))}
                className="w-20 px-3 py-2 text-xs font-bold text-center rounded-lg border border-[#EAE8E2] focus:outline-none focus:ring-2 focus:ring-[#C5A04B]/30 bg-white text-[#292929]"
              />
              <div className="flex items-center gap-1 text-[#C5A04B]">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 cursor-pointer ${
                      star <= Math.round(calificacion) ? 'fill-[#C5A04B]' : 'text-[#EAE8E2]'
                    }`}
                    onClick={() => setCalificacion(star)}
                  />
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#777777] uppercase tracking-widest mb-1.5">
              Comentarios y Observaciones
            </label>
            <textarea
              rows={4}
              value={comentarios}
              onChange={(e) => setComentarios(e.target.value)}
              placeholder="Aspectos positivos, competencias desarrolladas o recomendaciones..."
              className="w-full px-3 py-2 text-xs rounded-lg border border-[#EAE8E2] focus:outline-none focus:ring-2 focus:ring-[#C5A04B]/30 bg-white text-[#292929]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowEvalModal(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting}>
              Guardar Calificación
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
