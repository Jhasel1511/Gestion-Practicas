import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase, CalendarCheck, CheckCircle2, Clock, Layers,
  ShieldAlert, Award, ArrowRight, TrendingUp, GraduationCap,
} from 'lucide-react';
import { StatCard } from '../../components/common/StatCard';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { StatusBadge } from '../../components/common/Badge';
import { practicaService } from '../../services/practica.service';
import { postulacionService } from '../../services/postulacion.service';
import { horasService } from '../../services/horas.service';
import { useAuth } from '../../contexts/AuthContext';
import { Postulacion, Practica, ProgresoHoras } from '../../types';

export const EstudianteDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [postulaciones, setPostulaciones] = useState<Postulacion[]>([]);
  const [practica, setPractica] = useState<Practica | null>(null);
  const [progreso, setProgreso] = useState<ProgresoHoras | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [postsRes, practicasRes] = await Promise.all([
          postulacionService.getMisPostulaciones(),
          practicaService.getMisPracticas(),
        ]);
        setPostulaciones(postsRes);
        if (practicasRes.length > 0) {
          const act = practicasRes[0];
          setPractica(act);
          try {
            const prog = await horasService.getProgreso(act.id);
            setProgreso(prog);
          } catch { /* sin progreso aun */ }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const firstName = user?.nombre?.split(' ')[0] || 'Estudiante';

  return (
    <div className="space-y-6">
      {/* Greeting Header */}
      <div className="bg-white rounded-xl border border-[#EAE8E2] p-5 sm:p-6 shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <GraduationCap className="w-4 h-4 text-[#C5A04B]" />
              <span className="text-xs font-semibold uppercase tracking-widest text-[#777777]">Portal del Estudiante</span>
            </div>
            <h1 className="text-xl font-semibold text-[#292929]">
              Bienvenido, {firstName}
            </h1>
            <p className="text-xs text-[#777777] mt-0.5">
              {practica
                ? `Práctica ${practica.estado === 'en_curso' ? 'en curso' : practica.estado} · ${progreso ? `${progreso.horas_confirmadas}/${progreso.horas_requeridas} horas` : 'Iniciando'}`
                : 'Sin práctica activa · Explora las vacantes disponibles'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/vacantes')}
            >
              Ver Vacantes
            </Button>
            {practica && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate('/control-horas')}
                leftIcon={<Clock className="w-3.5 h-3.5" />}
              >
                Registrar Horas
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Estado Práctica"
          value={practica ? practica.estado.replace('_', ' ') : 'Sin práctica'}
          subtitle={practica ? `ID #${practica.id}` : 'Postúlate'}
          icon={<CheckCircle2 className="w-4.5 h-4.5" />}
          accent={practica?.estado === 'en_curso' ? 'gold' : 'default'}
        />
        <StatCard
          title="Horas Cumplidas"
          value={progreso ? `${progreso.horas_confirmadas}h` : '0h'}
          subtitle={progreso ? `Meta: ${progreso.horas_requeridas}h` : 'Sin horas'}
          icon={<CalendarCheck className="w-4.5 h-4.5" />}
          accent="emerald"
        />
        <StatCard
          title="Postulaciones"
          value={postulaciones.length}
          subtitle="Vacantes aplicadas"
          icon={<Layers className="w-4.5 h-4.5" />}
          onClick={() => navigate('/mis-postulaciones')}
        />
        <StatCard
          title="Progreso"
          value={progreso ? `${progreso.porcentaje}%` : '0%'}
          subtitle={progreso?.completada ? '¡Completada!' : 'En desarrollo'}
          icon={<TrendingUp className="w-4.5 h-4.5" />}
          accent={progreso?.completada ? 'emerald' : 'default'}
        />
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Practice card */}
        <div className="lg:col-span-2">
          <Card
            header={
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-[#777777]" />
                  <span className="font-semibold text-sm text-[#292929]">Mi Práctica Activa</span>
                </div>
                {practica && <StatusBadge status={practica.estado} />}
              </div>
            }
          >
            {practica ? (
              <div className="space-y-5">
                <div className="grid grid-cols-3 gap-4 text-xs">
                  <div>
                    <p className="text-[#777777] mb-0.5">Fecha de Inicio</p>
                    <p className="font-semibold text-[#292929]">{practica.fecha_inicio || 'Por definir'}</p>
                  </div>
                  <div>
                    <p className="text-[#777777] mb-0.5">Horas Exigidas</p>
                    <p className="font-semibold text-[#292929]">{practica.horas_requeridas} h</p>
                  </div>
                  <div>
                    <p className="text-[#777777] mb-0.5">Pendientes</p>
                    <p className="font-semibold text-[#292929]">{progreso?.horas_pendientes ?? 0} h</p>
                  </div>
                </div>

                {/* Progress */}
                <div>
                  <div className="flex justify-between text-xs font-medium mb-1.5">
                    <span className="text-[#777777]">Progreso de horas</span>
                    <span className="text-[#C5A04B] font-semibold">{progreso?.porcentaje ?? 0}%</span>
                  </div>
                  <div className="w-full bg-[#F5F5F3] rounded-full h-2 border border-[#EAE8E2]">
                    <div
                      className="bg-[#C5A04B] h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(progreso?.porcentaje ?? 0, 100)}%` }}
                    />
                  </div>
                </div>

                {practica.observaciones && (
                  <div className="p-3 bg-[#FDFBF4] border border-[#E9DDBD] rounded-lg text-xs text-[#292929]">
                    <span className="font-semibold text-[#8E712B]">Observaciones: </span>
                    {practica.observaciones}
                  </div>
                )}

                <div className="flex flex-wrap gap-2 pt-1">
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => navigate('/control-horas')}
                    leftIcon={<Clock className="w-3.5 h-3.5" />}
                  >
                    Gestionar Horas
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate('/incidencias')}
                    leftIcon={<ShieldAlert className="w-3.5 h-3.5" />}
                  >
                    Reportar Incidencia
                  </Button>
                  {progreso?.completada && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate('/evaluaciones')}
                      leftIcon={<Award className="w-3.5 h-3.5" />}
                    >
                      Certificado
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="py-10 text-center">
                <div className="w-11 h-11 rounded-full bg-[#F7EDD8] flex items-center justify-center mx-auto mb-3">
                  <Briefcase className="w-5 h-5 text-[#C5A04B]" />
                </div>
                <h4 className="text-sm font-semibold text-[#292929] mb-1">Sin práctica asignada</h4>
                <p className="text-xs text-[#777777] max-w-xs mx-auto mb-4">
                  Revisa las vacantes disponibles y postúlate a las que se ajusten a tu carrera.
                </p>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => navigate('/vacantes')}
                  rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                >
                  Ver Vacantes
                </Button>
              </div>
            )}
          </Card>
        </div>

        {/* Postulaciones recientes */}
        <div>
          <Card
            header={
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#777777]" />
                  <span className="font-semibold text-sm text-[#292929]">Mis Postulaciones</span>
                </div>
                <button
                  onClick={() => navigate('/mis-postulaciones')}
                  className="text-xs text-[#C5A04B] hover:text-[#8E712B] font-medium"
                >
                  Ver todas
                </button>
              </div>
            }
          >
            {postulaciones.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#777777]">
                Sin postulaciones activas.
              </div>
            ) : (
              <div className="space-y-2">
                {postulaciones.slice(0, 4).map((post) => (
                  <div
                    key={post.id}
                    className="p-3 rounded-lg border border-[#EAE8E2] flex items-center justify-between hover:bg-[#FAFAF8] transition-colors"
                  >
                    <div>
                      <p className="text-xs font-semibold text-[#292929]">Vacante #{post.vacante_id}</p>
                      <p className="text-[11px] text-[#777777] mt-0.5">
                        {post.fecha_postulacion
                          ? new Date(post.fecha_postulacion).toLocaleDateString()
                          : 'Reciente'}
                      </p>
                    </div>
                    <StatusBadge status={post.estado} />
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
