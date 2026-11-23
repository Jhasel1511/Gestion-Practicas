import { api } from './api';
import { Postulacion, Postulante, Practica } from '../types';

export const postulacionService = {
  async postularse(vacante_id: number): Promise<Postulacion> {
    const response = await api.post<Postulacion>('/api/v1/postulaciones', { vacante_id });
    return response.data;
  },

  async getMisPostulaciones(): Promise<Postulacion[]> {
    const response = await api.get<Postulacion[]>('/api/v1/postulaciones/mias');
    return response.data;
  },

  async seleccionarPostulante(postulacion_id: number): Promise<Practica> {
    const response = await api.patch<Practica>(`/api/v1/postulaciones/${postulacion_id}/seleccionar`);
    return response.data;
  },

  async getPostulantesPorVacante(vacante_id: number): Promise<Postulante[]> {
    const response = await api.get<Postulante[]>(`/api/v1/vacantes/${vacante_id}/postulaciones`);
    return response.data;
  },
};
