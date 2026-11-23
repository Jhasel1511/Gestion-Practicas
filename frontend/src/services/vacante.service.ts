import { api } from './api';
import { Elegibilidad, Vacante, VacanteCreateInput } from '../types';

export const vacanteService = {
  async getVacantes(): Promise<Vacante[]> {
    const response = await api.get<Vacante[]>('/api/v1/vacantes');
    return response.data;
  },

  async getVacante(id: number): Promise<Vacante> {
    const response = await api.get<Vacante>(`/api/v1/vacantes/${id}`);
    return response.data;
  },

  async createVacante(data: VacanteCreateInput): Promise<Vacante> {
    const response = await api.post<Vacante>('/api/v1/vacantes', data);
    return response.data;
  },

  async updateVacante(id: number, data: Partial<VacanteCreateInput>): Promise<Vacante> {
    const response = await api.put<Vacante>(`/api/v1/vacantes/${id}`, data);
    return response.data;
  },

  async aprobarVacante(id: number): Promise<Vacante> {
    const response = await api.patch<Vacante>(`/api/v1/vacantes/${id}/aprobar`);
    return response.data;
  },

  async rechazarVacante(id: number): Promise<Vacante> {
    const response = await api.patch<Vacante>(`/api/v1/vacantes/${id}/rechazar`);
    return response.data;
  },

  async getElegibilidad(vacante_id: number): Promise<Elegibilidad> {
    const response = await api.get<Elegibilidad>(`/api/v1/vacantes/${vacante_id}/elegibilidad`);
    return response.data;
  },
};
