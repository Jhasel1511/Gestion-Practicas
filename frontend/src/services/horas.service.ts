import { api } from './api';
import { ProgresoHoras, RegistroHoras } from '../types';

export const horasService = {
  async registrarHoras(practica_id: number, datos: { fecha: string; horas: number }): Promise<RegistroHoras> {
    const response = await api.post<RegistroHoras>(`/api/v1/practicas/${practica_id}/horas`, datos);
    return response.data;
  },

  async getHoras(practica_id: number): Promise<RegistroHoras[]> {
    const response = await api.get<RegistroHoras[]>(`/api/v1/practicas/${practica_id}/horas`);
    return response.data;
  },

  async getProgreso(practica_id: number): Promise<ProgresoHoras> {
    const response = await api.get<ProgresoHoras>(`/api/v1/practicas/${practica_id}/progreso`);
    return response.data;
  },

  async confirmarHoras(registro_id: number): Promise<RegistroHoras> {
    const response = await api.patch<RegistroHoras>(`/api/v1/horas/${registro_id}/confirmar`);
    return response.data;
  },

  async rechazarHoras(registro_id: number): Promise<RegistroHoras> {
    const response = await api.patch<RegistroHoras>(`/api/v1/horas/${registro_id}/rechazar`);
    return response.data;
  },
};
