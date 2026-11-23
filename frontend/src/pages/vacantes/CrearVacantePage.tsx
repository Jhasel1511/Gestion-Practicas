import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, PlusCircle } from 'lucide-react';
import { vacanteService } from '../../services/vacante.service';
import { VacanteCreateInput } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Alert } from '../../components/common/Alert';
import { getApiErrorMessage } from '../../services/api';

export const CrearVacantePage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<VacanteCreateInput>({
    titulo: '',
    area: '',
    descripcion: '',
    duracion_semanas: 16,
    horas_exigidas: 320,
    creditos_minimos: 80,
    promedio_minimo: 3.5,
    perfil_requerido: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await vacanteService.createVacante(formData);
      setSuccess(true);
      setTimeout(() => {
        navigate('/vacantes');
      }, 1500);
    } catch (err) {
      setError(getApiErrorMessage(err, 'No fue posible registrar la vacante.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <button
        onClick={() => navigate('/vacantes')}
        className="inline-flex items-center gap-1.5 text-xs text-[#777777] hover:text-[#292929] font-medium transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Regresar a Vacantes
      </button>

      <div>
        <h1 className="text-xl font-semibold text-[#292929]">
          Publicar Nueva Oferta de Práctica
        </h1>
        <p className="text-xs text-[#777777] mt-1">
          La vacante será enviada a Coordinación Académica para su revisión y activación.
        </p>
      </div>

      <Card goldAccent>
        {success && (
          <Alert
            type="success"
            message="¡Vacante enviada con éxito! Queda en estado pendiente de aprobación."
            className="mb-5"
          />
        )}
        {error && <Alert type="error" message={error} className="mb-5" />}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-semibold text-[#777777] uppercase tracking-widest mb-1.5">
                Título del Cargo o Puesto *
              </label>
              <input
                type="text"
                required
                minLength={3}
                maxLength={150}
                value={formData.titulo}
                onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                placeholder="Ej. Practicante de Desarrollo de Software"
                className="w-full px-3.5 py-2 text-xs rounded-lg border border-[#EAE8E2] focus:outline-none focus:ring-2 focus:ring-[#C5A04B]/30 focus:border-[#C5A04B] bg-white text-[#292929]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#777777] uppercase tracking-widest mb-1.5">
                Área Profesional / Carrera *
              </label>
              <input
                type="text"
                required
                value={formData.area}
                onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                placeholder="Ej. Ingeniería de Sistemas"
                className="w-full px-3.5 py-2 text-xs rounded-lg border border-[#EAE8E2] focus:outline-none focus:ring-2 focus:ring-[#C5A04B]/30 focus:border-[#C5A04B] bg-white text-[#292929]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#777777] uppercase tracking-widest mb-1.5">
                Duración (Semanas) *
              </label>
              <input
                type="number"
                required
                min={1}
                value={formData.duracion_semanas}
                onChange={(e) =>
                  setFormData({ ...formData, duracion_semanas: Number(e.target.value) })
                }
                className="w-full px-3.5 py-2 text-xs rounded-lg border border-[#EAE8E2] focus:outline-none focus:ring-2 focus:ring-[#C5A04B]/30 focus:border-[#C5A04B] bg-white text-[#292929]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#777777] uppercase tracking-widest mb-1.5">
                Total Horas Exigidas *
              </label>
              <input
                type="number"
                required
                min={1}
                value={formData.horas_exigidas}
                onChange={(e) =>
                  setFormData({ ...formData, horas_exigidas: Number(e.target.value) })
                }
                className="w-full px-3.5 py-2 text-xs rounded-lg border border-[#EAE8E2] focus:outline-none focus:ring-2 focus:ring-[#C5A04B]/30 focus:border-[#C5A04B] bg-white text-[#292929]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#777777] uppercase tracking-widest mb-1.5">
                Créditos Académicos Mínimos
              </label>
              <input
                type="number"
                min={0}
                value={formData.creditos_minimos}
                onChange={(e) =>
                  setFormData({ ...formData, creditos_minimos: Number(e.target.value) })
                }
                className="w-full px-3.5 py-2 text-xs rounded-lg border border-[#EAE8E2] focus:outline-none focus:ring-2 focus:ring-[#C5A04B]/30 focus:border-[#C5A04B] bg-white text-[#292929]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[11px] font-semibold text-[#777777] uppercase tracking-widest mb-1.5">
                Promedio Mínimo Acumulado (0 - 5.0)
              </label>
              <input
                type="number"
                step="0.1"
                min={0}
                max={5}
                value={formData.promedio_minimo}
                onChange={(e) =>
                  setFormData({ ...formData, promedio_minimo: Number(e.target.value) })
                }
                className="w-full px-3.5 py-2 text-xs rounded-lg border border-[#EAE8E2] focus:outline-none focus:ring-2 focus:ring-[#C5A04B]/30 focus:border-[#C5A04B] bg-white text-[#292929]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[11px] font-semibold text-[#777777] uppercase tracking-widest mb-1.5">
                Descripción de Funciones y Proyecto
              </label>
              <textarea
                rows={3}
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                placeholder="Describe las principales actividades que el practicante desarrollará..."
                className="w-full px-3.5 py-2 text-xs rounded-lg border border-[#EAE8E2] focus:outline-none focus:ring-2 focus:ring-[#C5A04B]/30 focus:border-[#C5A04B] bg-white text-[#292929]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[11px] font-semibold text-[#777777] uppercase tracking-widest mb-1.5">
                Perfil y Competencias Requeridas
              </label>
              <textarea
                rows={2}
                value={formData.perfil_requerido}
                onChange={(e) => setFormData({ ...formData, perfil_requerido: e.target.value })}
                placeholder="Conocimientos técnicos, habilidades blandas, herramientas..."
                className="w-full px-3.5 py-2 text-xs rounded-lg border border-[#EAE8E2] focus:outline-none focus:ring-2 focus:ring-[#C5A04B]/30 focus:border-[#C5A04B] bg-white text-[#292929]"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[#EAE8E2]">
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate('/vacantes')}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
              leftIcon={<PlusCircle className="w-4 h-4" />}
            >
              Publicar Vacante
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
