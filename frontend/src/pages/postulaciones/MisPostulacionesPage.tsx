import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layers, Calendar, ExternalLink, ArrowRight } from 'lucide-react';
import { postulacionService } from '../../services/postulacion.service';
import { Postulacion } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { StatusBadge } from '../../components/common/Badge';

export const MisPostulacionesPage: React.FC = () => {
  const navigate = useNavigate();
  const [postulaciones, setPostulaciones] = useState<Postulacion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPostulaciones = async () => {
      try {
        setLoading(true);
        const data = await postulacionService.getMisPostulaciones();
        setPostulaciones(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPostulaciones();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-[#292929]">Mis Postulaciones</h1>
        <p className="text-xs text-[#777777] mt-1">
          Seguimiento en tiempo real a las convocatorias en las que estás participando.
        </p>
      </div>

      {loading ? (
        <div className="py-16 text-center">
          <div className="w-6 h-6 border-2 border-[#EAE8E2] border-t-[#C5A04B] rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs text-[#777777]">Cargando tus postulaciones...</p>
        </div>
      ) : postulaciones.length === 0 ? (
        <Card className="text-center py-12">
          <div className="w-11 h-11 rounded-full bg-[#F7EDD8] text-[#C5A04B] flex items-center justify-center mx-auto mb-3">
            <Layers className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-semibold text-[#292929]">No tienes postulaciones activas</h3>
          <p className="text-xs text-[#777777] max-w-sm mx-auto mt-1 mb-4">
            Explora las ofertas disponibles actualmente y aplica para iniciar tu práctica.
          </p>
          <Button variant="primary" size="sm" onClick={() => navigate('/vacantes')}>
            Ver Vacantes Disponibles
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {postulaciones.map((post) => (
            <Card key={post.id} padding="md" className="hover:border-[#C5A04B]/50 transition-all">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-[#F7EDD8] text-[#8E712B] border border-[#E9DDBD] shrink-0">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-xs font-semibold text-[#292929]">
                        Postulación a Vacante #{post.vacante_id}
                      </h4>
                      <StatusBadge status={post.estado} />
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-[#777777]">
                      <span>Postulación #{post.id}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {post.fecha_postulacion
                          ? new Date(post.fecha_postulacion).toLocaleDateString()
                          : 'Reciente'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/vacantes/${post.vacante_id}`)}
                    rightIcon={<ExternalLink className="w-3.5 h-3.5" />}
                  >
                    Ver Vacante
                  </Button>
                  {post.estado === 'seleccionada' && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => navigate('/control-horas')}
                      rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                    >
                      Ir a mi Práctica
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
