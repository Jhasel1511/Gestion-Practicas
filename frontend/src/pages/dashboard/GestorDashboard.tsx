import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldAlert, AlertTriangle, CheckCircle2, Clock, ArrowRight, Inbox,
} from 'lucide-react';
import { StatCard } from '../../components/common/StatCard';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge, StatusBadge } from '../../components/common/Badge';
import { incidenciaService } from '../../services/incidencia.service';
import { Incidencia } from '../../types';

export const GestorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [incidencias, setIncidencias] = useState<Incidencia[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await incidenciaService.getIncidencias();
        setIncidencias(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const abiertas = incidencias.filter((i) => i.estado === 'abierta');
  const escaladas = incidencias.filter((i) => i.estado === 'escalada');
  const enRevision = incidencias.filter((i) => i.estado === 'en_revision');
  const cerradas = incidencias.filter((i) => i.estado === 'cerrada');
  const gravedadAlta = incidencias.filter((i) => i.gravedad === 'alta' && i.estado !== 'cerrada');
  const activeCases = abiertas.length + enRevision.length + escaladas.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-[#EAE8E2] p-5 sm:p-6 shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ShieldAlert className="w-4 h-4 text-[#C5A04B]" />
              <span className="text-xs font-semibold uppercase tracking-widest text-[#777777]">Gestión de Incidencias</span>
            </div>
            <h1 className="text-xl font-semibold text-[#292929]">Mesa de Mediación</h1>
            <p className="text-xs text-[#777777] mt-0.5">
              {activeCases > 0 ? (
                <span className="text-rose-700 font-medium">{activeCases} casos activos · {escaladas.length} escalados</span>
              ) : (
                <span className="text-emerald-700 font-medium">Sin casos activos · {cerradas.length} resueltos</span>
              )}
            </p>
          </div>
          <Button
            size="sm"
            variant="primary"
            onClick={() => navigate('/incidencias')}
            leftIcon={<ShieldAlert className="w-3.5 h-3.5" />}
          >
            Atender Casos ({activeCases})
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Casos Abiertos"
          value={abiertas.length}
          subtitle="Esperando clasificación"
          icon={<AlertTriangle className="w-4.5 h-4.5" />}
          accent={abiertas.length > 0 ? 'amber' : 'default'}
          onClick={() => navigate('/incidencias')}
        />
        <StatCard
          title="Escalados"
          value={escaladas.length}
          subtitle="Atención prioritaria"
          icon={<ShieldAlert className="w-4.5 h-4.5" />}
          accent={escaladas.length > 0 ? 'rose' : 'default'}
          onClick={() => navigate('/incidencias')}
        />
        <StatCard
          title="Prioridad Alta"
          value={gravedadAlta.length}
          subtitle="Gravedad crítica"
          icon={<Clock className="w-4.5 h-4.5" />}
          accent={gravedadAlta.length > 0 ? 'rose' : 'default'}
        />
        <StatCard
          title="Resueltos"
          value={cerradas.length}
          subtitle={`${incidencias.length} totales`}
          icon={<CheckCircle2 className="w-4.5 h-4.5" />}
          accent="emerald"
        />
      </div>

      {/* Case list */}
      <Card
        header={
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <Inbox className="w-4 h-4 text-[#777777]" />
              <span className="font-semibold text-sm text-[#292929]">Bandeja de Casos</span>
            </div>
            <button
              onClick={() => navigate('/incidencias')}
              className="text-xs text-[#C5A04B] hover:text-[#8E712B] font-medium"
            >
              Ver bandeja completa
            </button>
          </div>
        }
      >
        {incidencias.length === 0 ? (
          <div className="py-10 text-center">
            <ShieldAlert className="w-8 h-8 text-[#EAE8E2] mx-auto mb-2" />
            <p className="text-sm text-[#777777]">Sin incidencias reportadas.</p>
          </div>
        ) : (
          <div className="divide-y divide-[#EAE8E2]">
            {incidencias.slice(0, 6).map((inc) => (
              <div
                key={inc.id}
                className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#FAFAF8] px-1 rounded-lg transition-colors cursor-pointer"
                onClick={() => navigate('/incidencias')}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-xs font-semibold text-[#292929]">Caso #{inc.id}</span>
                    <StatusBadge status={inc.estado} />
                    {inc.gravedad && <StatusBadge status={inc.gravedad} />}
                    {inc.evidencias?.length > 0 && (
                      <Badge variant="neutral" size="sm">{inc.evidencias.length} evidencias</Badge>
                    )}
                  </div>
                  <p className="text-xs text-[#777777] line-clamp-1">{inc.descripcion}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => { e.stopPropagation(); navigate('/incidencias'); }}
                  rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                >
                  Atender
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
