import { api } from './api';
import { Practica } from '../types';

export const practicaService = {
  async getPracticas(): Promise<Practica[]> {
    const response = await api.get<Practica[]>('/api/v1/practicas');
    return response.data;
  },

  async getMisPracticas(): Promise<Practica[]> {
    const response = await api.get<Practica[]>('/api/v1/practicas/mias');
    return response.data;
  },

  async aprobarPractica(id: number, datos: { observaciones?: string; fecha_inicio?: string }): Promise<Practica> {
    const response = await api.patch<Practica>(`/api/v1/practicas/${id}/aprobar`, datos);
    return response.data;
  },

  async rechazarPractica(id: number, datos: { observaciones: string }): Promise<Practica> {
    const response = await api.patch<Practica>(`/api/v1/practicas/${id}/rechazar`, datos);
    return response.data;
  },
};
