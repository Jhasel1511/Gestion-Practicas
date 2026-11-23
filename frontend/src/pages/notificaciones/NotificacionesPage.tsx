import React, { useEffect, useState } from 'react';
import { Bell, CheckCheck, Check, Clock } from 'lucide-react';
import { notificacionService } from '../../services/notificacion.service';
import { Notificacion } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';

export const NotificacionesPage: React.FC = () => {
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotificaciones = async () => {
    try {
      setLoading(true);
      const data = await notificacionService.getMisNotificaciones();
      setNotificaciones(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotificaciones();
  }, []);

  const handleMarcarTodas = async () => {
    try {
      await notificacionService.marcarTodasLeidas();
      setNotificaciones((prev) => prev.map((n) => ({ ...n, leida: true })));
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarcarUna = async (id: number) => {
    try {
      await notificacionService.marcarLeida(id);
      setNotificaciones((prev) =>
        prev.map((n) => (n.id === id ? { ...n, leida: true } : n))
      );
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[#292929]">Centro de Notificaciones</h1>
          <p className="text-xs text-[#777777] mt-0.5">
            Historial de avisos y novedades sobre tus prácticas y postulaciones.
          </p>
        </div>

        {notificaciones.some((n) => !n.leida) && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarcarTodas}
            leftIcon={<CheckCheck className="w-3.5 h-3.5 text-[#C5A04B]" />}
          >
            Marcar todas como leídas
          </Button>
        )}
      </div>

      <Card padding="none">
        {loading ? (
          <div className="py-16 text-center text-xs text-[#777777]">
            <div className="w-6 h-6 border-2 border-[#EAE8E2] border-t-[#C5A04B] rounded-full animate-spin mx-auto mb-2" />
            Cargando avisos...
          </div>
        ) : notificaciones.length === 0 ? (
          <div className="py-16 text-center text-xs text-[#777777]">
            <Bell className="w-8 h-8 text-[#EAE8E2] mx-auto mb-2" />
            No tienes notificaciones en tu bandeja.
          </div>
        ) : (
          <div className="divide-y divide-[#EAE8E2]">
            {notificaciones.map((notif) => (
              <div
                key={notif.id}
                className={`p-3.5 flex items-start justify-between gap-4 transition-colors ${
                  !notif.leida ? 'bg-[#FDFBF4]' : 'bg-white'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                      !notif.leida ? 'bg-[#C5A04B]' : 'bg-transparent'
                    }`}
                  />
                  <div>
                    <p className={`text-xs leading-relaxed ${!notif.leida ? 'font-semibold text-[#292929]' : 'text-[#777777]'}`}>
                      {notif.mensaje}
                    </p>
                    {notif.creada_en && (
                      <span className="text-[10px] text-[#A0A0A0] flex items-center gap-1 mt-1">
                        <Clock className="w-3 h-3" />
                        {new Date(notif.creada_en).toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>

                {!notif.leida && (
                  <button
                    onClick={() => handleMarcarUna(notif.id)}
                    className="text-xs text-[#A0A0A0] hover:text-[#C5A04B] shrink-0 p-1"
                    title="Marcar como leída"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
