import { api } from './api';
import { Notificacion } from '../types';

export const notificacionService = {
  async getMisNotificaciones(): Promise<Notificacion[]> {
    const response = await api.get<Notificacion[]>('/api/v1/notificaciones/mias');
    return response.data;
  },

  async getConteo(): Promise<{ no_leidas: number }> {
    const response = await api.get<{ no_leidas: number }>('/api/v1/notificaciones/conteo');
    return response.data;
  },

  async marcarTodasLeidas(): Promise<void> {
    await api.patch('/api/v1/notificaciones/leer-todas');
  },

  async marcarLeida(id: number): Promise<Notificacion> {
    const response = await api.patch<Notificacion>(`/api/v1/notificaciones/${id}/leer`);
    return response.data;
  },
};
