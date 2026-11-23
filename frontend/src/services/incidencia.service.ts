import { api } from './api';
import { Evidencia, GravedadIncidencia, Incidencia } from '../types';

export const incidenciaService = {
  async crearIncidencia(practica_id: number, descripcion: string): Promise<Incidencia> {
    const response = await api.post<Incidencia>('/api/v1/incidencias', { practica_id, descripcion });
    return response.data;
  },

  async getIncidencias(): Promise<Incidencia[]> {
    const response = await api.get<Incidencia[]>('/api/v1/incidencias');
    return response.data;
  },

  async getIncidencia(id: number): Promise<Incidencia> {
    const response = await api.get<Incidencia>(`/api/v1/incidencias/${id}`);
    return response.data;
  },

  async subirEvidencia(incidencia_id: number, archivo: File): Promise<Evidencia> {
    const formData = new FormData();
    formData.append('archivo', archivo);
    const response = await api.post<Evidencia>(`/api/v1/incidencias/${incidencia_id}/evidencias`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getEvidenciaUrl(incidencia_id: number, evidencia_id: number): string {
    const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    return `${baseURL}/api/v1/incidencias/${incidencia_id}/evidencias/${evidencia_id}`;
  },

  async clasificarIncidencia(id: number, tipo: string, gravedad: GravedadIncidencia): Promise<Incidencia> {
    const response = await api.patch<Incidencia>(`/api/v1/incidencias/${id}/clasificar`, { tipo, gravedad });
    return response.data;
  },

  async escalarIncidencia(id: number, motivo: string): Promise<Incidencia> {
    const response = await api.patch<Incidencia>(`/api/v1/incidencias/${id}/escalar`, { motivo });
    return response.data;
  },

  async cerrarIncidencia(id: number, resolucion: string): Promise<Incidencia> {
    const response = await api.patch<Incidencia>(`/api/v1/incidencias/${id}/cerrar`, { resolucion });
    return response.data;
  },
};
