import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileCheck, GraduationCap, Users, CheckCircle, XCircle,
  Building2, TrendingUp, ClipboardCheck,
} from 'lucide-react';
import { StatCard } from '../../components/common/StatCard';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { StatusBadge } from '../../components/common/Badge';
import { vacanteService } from '../../services/vacante.service';
import { practicaService } from '../../services/practica.service';
import { useAuth } from '../../contexts/AuthContext';
import { Practica, Vacante } from '../../types';

export const CoordinadorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [vacantes, setVacantes] = useState<Vacante[]>([]);
  const [practicas, setPracticas] = useState<Practica[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [vacsRes, practicasRes] = await Promise.all([
        vacanteService.getVacantes(),
        practicaService.getPracticas(),
      ]);
      setVacantes(vacsRes);
      setPracticas(practicasRes);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const vacantesPendientes = vacantes.filter((v) => v.estado === 'pendiente');
  const practicasPorAprobar = practicas.filter((p) => p.estado === 'postulada');

  const handleAprobarVacante = async (id: number) => {
    try { await vacanteService.aprobarVacante(id); fetchData(); } catch (e) { console.error(e); }
  };
  const handleRechazarVacante = async (id: number) => {
    try { await vacanteService.rechazarVacante(id); fetchData(); } catch (e) { console.error(e); }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-[#EAE8E2] p-5 sm:p-6 shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ClipboardCheck className="w-4 h-4 text-[#C5A04B]" />
              <span className="text-xs font-semibold uppercase tracking-widest text-[#777777]">Coordinación Académica</span>
            </div>
            <h1 className="text-xl font-semibold text-[#292929]">
              Supervisión de Prácticas
            </h1>
            <p className="text-xs text-[#777777] mt-0.5">
              {vacantesPendientes.length > 0 && (
                <span className="text-amber-700 font-medium">{vacantesPendientes.length} vacantes pendientes · </span>
              )}
              {practicasPorAprobar.length > 0 && (
                <span className="text-amber-700 font-medium">{practicasPorAprobar.length} prácticas por autorizar · </span>
              )}
              {vacantesPendientes.length === 0 && practicasPorAprobar.length === 0 && 'Todo al día · '}
              {vacantes.length} vacantes registradas
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => navigate('/vacantes')}>
              <FileCheck className="w-3.5 h-3.5 mr-1.5" />
              Vacantes ({vacantesPendientes.length})
            </Button>
            <Button size="sm" variant="primary" onClick={() => navigate('/practicas')}>
              Prácticas ({practicasPorAprobar.length})
            </Button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Vacantes Pendientes"
          value={vacantesPendientes.length}
          subtitle="Por validar y aprobar"
          icon={<FileCheck className="w-4.5 h-4.5" />}
          accent={vacantesPendientes.length > 0 ? 'amber' : 'default'}
          onClick={() => navigate('/vacantes')}
        />
        <StatCard
          title="Prácticas por Autorizar"
          value={practicasPorAprobar.length}
          subtitle="Seleccionadas por empresa"
          icon={<GraduationCap className="w-4.5 h-4.5" />}
          accent={practicasPorAprobar.length > 0 ? 'amber' : 'default'}
          onClick={() => navigate('/practicas')}
        />
        <StatCard
          title="Total Prácticas"
          value={practicas.length}
          subtitle="Histórico institucional"
          icon={<TrendingUp className="w-4.5 h-4.5" />}
        />
        <StatCard
          title="Total Vacantes"
          value={vacantes.length}
          subtitle="Convocatorias creadas"
          icon={<Building2 className="w-4.5 h-4.5" />}
        />
      </div>

      {/* Action panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Vacantes pendientes */}
        <Card
          header={
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-[#777777]" />
                <span className="font-semibold text-sm text-[#292929]">Vacantes por Aprobar</span>
              </div>
              {vacantesPendientes.length > 0 && (
                <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  {vacantesPendientes.length} pendientes
                </span>
              )}
            </div>
          }
        >
          {vacantesPendientes.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#777777]">
              No hay vacantes pendientes de revisión.
            </div>
          ) : (
            <div className="space-y-3">
              {vacantesPendientes.slice(0, 4).map((vac) => (
                <div
                  key={vac.id}
                  className="p-3.5 rounded-lg border border-[#EAE8E2] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <p className="text-sm font-medium text-[#292929]">{vac.titulo}</p>
                    <p className="text-xs text-[#777777] mt-0.5">{vac.area} · {vac.horas_exigidas}h · mín {vac.creditos_minimos} créditos</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => handleAprobarVacante(vac.id)}
                      leftIcon={<CheckCircle className="w-3.5 h-3.5" />}
                    >
                      Aprobar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRechazarVacante(vac.id)}
                      className="text-rose-600 border-rose-200 hover:bg-rose-50"
                      leftIcon={<XCircle className="w-3.5 h-3.5" />}
                    >
                      Rechazar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Prácticas por autorizar */}
        <Card
          header={
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-[#777777]" />
                <span className="font-semibold text-sm text-[#292929]">Prácticas por Formalizar</span>
              </div>
              <Button size="sm" variant="outline" onClick={() => navigate('/practicas')}>
                Gestionar
              </Button>
            </div>
          }
        >
          {practicasPorAprobar.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#777777]">
              Sin prácticas en espera de validación.
            </div>
          ) : (
            <div className="space-y-2">
              {practicasPorAprobar.slice(0, 4).map((pr) => (
                <div
                  key={pr.id}
                  className="p-3 rounded-lg border border-[#EAE8E2] flex items-center justify-between"
                >
                  <div>
                    <p className="text-xs font-semibold text-[#292929]">Práctica #{pr.id}</p>
                    <p className="text-[11px] text-[#777777]">Postulación #{pr.postulacion_id} · {pr.horas_requeridas}h</p>
                  </div>
                  <Button size="sm" variant="primary" onClick={() => navigate('/practicas')}>
                    Revisar
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
