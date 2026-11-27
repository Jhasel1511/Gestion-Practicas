import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  CheckCheck,
  ChevronDown,
  KeyRound,
  LogOut,
  Menu,
  ShieldCheck,
  User,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { notificacionService } from '../services/notificacion.service';
import { Notificacion } from '../types';
import { Modal } from '../components/common/Modal';
import { Button } from '../components/common/Button';
import { Alert } from '../components/common/Alert';
import { authService } from '../services/auth.service';
import { getApiErrorMessage } from '../services/api';

interface NavbarProps {
  onToggleSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const navigate = useNavigate();
  const { user, role, logout } = useAuth();
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Modal para cambiar contraseña
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordActual, setPasswordActual] = useState('');
  const [passwordNueva, setPasswordNueva] = useState('');
  const [isChangingPass, setIsChangingPass] = useState(false);
  const [passMessage, setPassMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const fetchNotificaciones = async () => {
    try {
      const [conteoRes, listaRes] = await Promise.all([
        notificacionService.getConteo(),
        notificacionService.getMisNotificaciones(),
      ]);
      setUnreadCount(conteoRes.no_leidas);
      setNotificaciones(listaRes.slice(0, 5));
    } catch {
      // Ignorar si aún no hay conexión
    }
  };

  useEffect(() => {
    fetchNotificaciones();
    const interval = setInterval(fetchNotificaciones, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarcarUna = async (id: number) => {
    try {
      await notificacionService.marcarLeida(id);
      setUnreadCount((prev) => Math.max(0, prev - 1));
      setNotificaciones((prev) =>
        prev.map((n) => (n.id === id ? { ...n, leida: true } : n))
      );
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarcarTodasLeidas = async () => {
    try {
      await notificacionService.marcarTodasLeidas();
      setUnreadCount(0);
      setNotificaciones((prev) => prev.map((n) => ({ ...n, leida: true })));
    } catch (e) {
      console.error(e);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordActual || passwordNueva.length < 8) {
      setPassMessage({ type: 'error', text: 'La contraseña nueva debe tener al menos 8 caracteres.' });
      return;
    }
    setIsChangingPass(true);
    setPassMessage(null);
    try {
      await authService.cambiarPassword(passwordActual, passwordNueva);
      setPassMessage({ type: 'success', text: 'Contraseña actualizada con éxito.' });
      setPasswordActual('');
      setPasswordNueva('');
      setTimeout(() => {
        setShowPasswordModal(false);
        setPassMessage(null);
      }, 1500);
    } catch (err) {
      setPassMessage({ type: 'error', text: getApiErrorMessage(err, 'Error al cambiar la contraseña.') });
    } finally {
      setIsChangingPass(false);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-sm border-b border-[#EAE8E2] px-4 sm:px-6 flex items-center justify-between">
        {/* Left items */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-lg text-[#777777] hover:text-[#292929] hover:bg-[#F5F5F3] transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-sm font-semibold text-[#292929] tracking-tight">
              Sistema de Gestión de Prácticas
            </h2>
            <p className="text-[11px] text-[#777777] hidden sm:block">
              Universidad del Norte
            </p>
          </div>
        </div>

        {/* Right items */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Notifications Dropdown */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-lg text-[#777777] hover:text-[#292929] hover:bg-[#F5F5F3] transition-colors"
            >
              <Bell className="w-4.5 h-4.5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 min-w-[16px] h-[16px] px-1 bg-rose-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-card border border-[#EAE8E2] py-2 z-50">
                <div className="px-4 py-2.5 border-b border-[#EAE8E2] flex items-center justify-between bg-[#FAFAF8]">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-[#292929]">Notificaciones</span>
                    {unreadCount > 0 && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F7EDD8] text-[#8E712B]">
                        {unreadCount} nuevas
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarcarTodasLeidas}
                      className="text-[11px] text-[#C5A04B] hover:text-[#8E712B] flex items-center gap-1 font-medium"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      Marcar leídas
                    </button>
                  )}
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-[#EAE8E2]">
                  {notificaciones.length === 0 ? (
                    <div className="py-8 text-center text-xs text-[#777777]">
                      No tienes notificaciones pendientes
                    </div>
                  ) : (
                    notificaciones.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => {
                          if (!notif.leida) handleMarcarUna(notif.id);
                        }}
                        className={`p-3 text-xs transition-colors hover:bg-[#FAFAF8] cursor-pointer ${
                          !notif.leida ? 'bg-[#FDFBF4] font-medium' : 'text-[#777777]'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          {!notif.leida && (
                            <span className="w-1.5 h-1.5 rounded-full bg-[#C5A04B] mt-1 shrink-0" />
                          )}
                          <div className="flex-1">
                            <p className="leading-relaxed text-[#292929]">{notif.mensaje}</p>
                            {notif.creada_en && (
                              <span className="text-[10px] text-[#A0A0A0] block mt-1">
                                {new Date(notif.creada_en).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="px-4 py-2 border-t border-[#EAE8E2] bg-[#FAFAF8] text-center">
                  <button
                    onClick={() => {
                      setShowNotifications(false);
                      navigate('/notificaciones');
                    }}
                    className="text-[11px] font-semibold text-[#C5A04B] hover:text-[#8E712B] inline-flex items-center gap-1.5 transition-colors"
                  >
                    Ver todas las notificaciones <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="h-5 w-px bg-[#EAE8E2] hidden sm:block" />

          {/* User Profile dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2.5 p-1 sm:px-2.5 sm:py-1.5 rounded-lg hover:bg-[#F5F5F3] transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-[#F7EDD8] text-[#8E712B] border border-[#E9DDBD] flex items-center justify-center font-bold text-xs uppercase">
                {user?.nombre ? user.nombre.slice(0, 2) : <User className="w-3.5 h-3.5" />}
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-xs font-semibold text-[#292929] leading-tight max-w-[120px] truncate">
                  {user?.nombre || user?.email}
                </p>
                <p className="text-[10px] text-[#777777] capitalize leading-tight">
                  {role}
                </p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-[#A0A0A0] hidden sm:block" />
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-card border border-[#EAE8E2] py-1.5 z-50">
                <div className="px-4 py-2.5 border-b border-[#EAE8E2] bg-[#FAFAF8]">
                  <p className="text-xs font-semibold text-[#292929] truncate">
                    {user?.nombre || 'Usuario SGP'}
                  </p>
                  <p className="text-[11px] text-[#777777] truncate">{user?.email}</p>
                  <span className="inline-block mt-1 text-[9px] font-semibold uppercase px-2 py-0.5 rounded bg-[#F5F5F3] text-[#777777] border border-[#EAE8E2]">
                    {role}
                  </span>
                </div>

                <div className="p-1 space-y-0.5">
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      setShowPasswordModal(true);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-[#292929] hover:bg-[#F5F5F3] rounded-lg transition-colors"
                  >
                    <KeyRound className="w-3.5 h-3.5 text-[#777777]" />
                    Cambiar Contraseña
                  </button>
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 rounded-lg transition-colors font-medium"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Cerrar Sesión
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Modal para cambio de contraseña */}
      <Modal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        title="Cambiar Contraseña"
        description="Ingresa tu clave actual y define la nueva contraseña"
      >
        <form onSubmit={handleChangePassword} className="space-y-4">
          {passMessage && (
            <Alert type={passMessage.type} message={passMessage.text} />
          )}
          <div>
            <label className="block text-[11px] font-semibold text-[#777777] uppercase tracking-widest mb-1">
              Contraseña Actual
            </label>
            <input
              type="password"
              value={passwordActual}
              onChange={(e) => setPasswordActual(e.target.value)}
              required
              className="w-full px-3 py-2 text-xs rounded-lg border border-[#EAE8E2] focus:outline-none focus:ring-2 focus:ring-[#C5A04B]/30 focus:border-[#C5A04B] bg-white text-[#292929]"
              placeholder="••••••••"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-[#777777] uppercase tracking-widest mb-1">
              Nueva Contraseña (mínimo 8 caracteres)
            </label>
            <input
              type="password"
              value={passwordNueva}
              onChange={(e) => setPasswordNueva(e.target.value)}
              required
              minLength={8}
              className="w-full px-3 py-2 text-xs rounded-lg border border-[#EAE8E2] focus:outline-none focus:ring-2 focus:ring-[#C5A04B]/30 focus:border-[#C5A04B] bg-white text-[#292929]"
              placeholder="••••••••"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowPasswordModal(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isChangingPass}
              leftIcon={<ShieldCheck className="w-3.5 h-3.5" />}
            >
              Guardar Contraseña
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
};
