import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase, Users, PlusCircle, CalendarCheck, ArrowRight,
  TrendingUp, Building2,
} from 'lucide-react';
import { StatCard } from '../../components/common/StatCard';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { StatusBadge } from '../../components/common/Badge';
import { vacanteService } from '../../services/vacante.service';
import { practicaService } from '../../services/practica.service';
import { useAuth } from '../../contexts/AuthContext';
import { Practica, Vacante } from '../../types';

export const EmpresaDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [vacantes, setVacantes] = useState<Vacante[]>([]);
  const [practicantes, setPracticantes] = useState<Practica[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [vacsRes, practicasRes] = await Promise.all([
          vacanteService.getVacantes(),
          practicaService.getMisPracticas(),
        ]);
        setVacantes(vacsRes);
        setPracticantes(practicasRes);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const vacantesActivas = vacantes.filter((v) => v.estado === 'activa');
  const vacantesPendientes = vacantes.filter((v) => v.estado === 'pendiente');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-[#EAE8E2] p-5 sm:p-6 shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Building2 className="w-4 h-4 text-[#C5A04B]" />
              <span className="text-xs font-semibold uppercase tracking-widest text-[#777777]">Panel Empresarial</span>
            </div>
            <h1 className="text-xl font-semibold text-[#292929]">{user?.nombre || 'Empresa'}</h1>
            <p className="text-xs text-[#777777] mt-0.5">
              {vacantes.length} vacantes publicadas · {practicantes.length} practicantes activos
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/control-horas')}
              leftIcon={<CalendarCheck className="w-3.5 h-3.5" />}
            >
              Validar Horas
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/vacantes/crear')}
              leftIcon={<PlusCircle className="w-3.5 h-3.5" />}
            >
              Nueva Vacante
            </Button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Vacantes Activas"
          value={vacantesActivas.length}
          subtitle={`${vacantes.length} publicadas en total`}
          icon={<Briefcase className="w-4.5 h-4.5" />}
          accent="gold"
          onClick={() => navigate('/vacantes')}
        />
        <StatCard
          title="En Revisión"
          value={vacantesPendientes.length}
          subtitle="Pendientes de aprobación"
          icon={<TrendingUp className="w-4.5 h-4.5" />}
          accent="amber"
        />
        <StatCard
          title="Practicantes"
          value={practicantes.length}
          subtitle="Estudiantes asignados"
          icon={<Users className="w-4.5 h-4.5" />}
          onClick={() => navigate('/practicas')}
        />
      </div>

      {/* Content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Vacantes list */}
        <div className="lg:col-span-2">
          <Card
            header={
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-[#777777]" />
                  <span className="font-semibold text-sm text-[#292929]">Mis Vacantes</span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigate('/vacantes/crear')}
                  leftIcon={<PlusCircle className="w-3.5 h-3.5" />}
                >
                  Nueva
                </Button>
              </div>
            }
          >
            {vacantes.length === 0 ? (
              <div className="py-10 text-center">
                <div className="w-10 h-10 rounded-full bg-[#F7EDD8] flex items-center justify-center mx-auto mb-3">
                  <Briefcase className="w-5 h-5 text-[#C5A04B]" />
                </div>
                <p className="text-sm font-medium text-[#292929] mb-1">Sin vacantes publicadas</p>
                <p className="text-xs text-[#777777] mb-4">Publica tu primera oferta para recibir postulantes.</p>
                <Button size="sm" variant="primary" onClick={() => navigate('/vacantes/crear')}>
                  Publicar Vacante
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-[#EAE8E2]">
                {vacantes.slice(0, 6).map((vac) => (
                  <div
                    key={vac.id}
                    className="py-3 flex items-center justify-between cursor-pointer hover:bg-[#FAFAF8] px-1 rounded-lg transition-colors"
                    onClick={() => navigate(`/vacantes/${vac.id}`)}
                  >
                    <div>
                      <p className="text-sm font-medium text-[#292929]">{vac.titulo}</p>
                      <p className="text-xs text-[#777777] mt-0.5">
                        {vac.area} · {vac.duracion_semanas} sem · {vac.horas_exigidas}h
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <StatusBadge status={vac.estado} />
                      <ArrowRight className="w-3.5 h-3.5 text-[#A0A0A0]" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Practicantes */}
        <div>
          <Card
            header={
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#777777]" />
                  <span className="font-semibold text-sm text-[#292929]">Practicantes</span>
                </div>
                <button
                  onClick={() => navigate('/practicas')}
                  className="text-xs text-[#C5A04B] hover:text-[#8E712B] font-medium"
                >
                  Ver todos
                </button>
              </div>
            }
          >
            {practicantes.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#777777]">
                Sin practicantes asignados.
              </div>
            ) : (
              <div className="space-y-2">
                {practicantes.map((pr) => (
                  <div
                    key={pr.id}
                    className="p-3 rounded-lg border border-[#EAE8E2] flex items-center justify-between"
                  >
                    <div>
                      <p className="text-xs font-semibold text-[#292929]">Práctica #{pr.id}</p>
                      <p className="text-[11px] text-[#777777]">{pr.horas_requeridas} horas</p>
                    </div>
                    <StatusBadge status={pr.estado} />
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
