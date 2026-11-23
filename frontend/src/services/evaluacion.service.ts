import { api } from './api';
import { Certificado, Evaluacion } from '../types';

export const evaluacionService = {
  async crearEvaluacion(practica_id: number, calificacion: number, comentarios: string): Promise<Evaluacion> {
    const response = await api.post<Evaluacion>(`/api/v1/practicas/${practica_id}/evaluaciones`, {
      calificacion,
      comentarios,
    });
    return response.data;
  },

  async getEvaluaciones(practica_id: number): Promise<Evaluacion[]> {
    const response = await api.get<Evaluacion[]>(`/api/v1/practicas/${practica_id}/evaluaciones`);
    return response.data;
  },

  async generarCertificado(practica_id: number): Promise<Certificado> {
    const response = await api.post<Certificado>(`/api/v1/practicas/${practica_id}/certificado`);
    return response.data;
  },

  async getCertificado(practica_id: number): Promise<Certificado> {
    const response = await api.get<Certificado>(`/api/v1/practicas/${practica_id}/certificado`);
    return response.data;
  },
};
