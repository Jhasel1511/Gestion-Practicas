import { api } from './api';
import { AuthResponse, Usuario, RegistroEstudianteInput, RegistroEmpresaInput } from '../types';

export const authService = {
  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/api/v1/auth/login', { email, password });
    return response.data;
  },

  async registroEstudiante(data: RegistroEstudianteInput): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/api/v1/auth/registro/estudiante', data);
    return response.data;
  },

  async registroEmpresa(data: RegistroEmpresaInput): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/api/v1/auth/registro/empresa', data);
    return response.data;
  },

  async getMe(): Promise<Usuario> {
    const response = await api.get<Usuario>('/api/v1/auth/me');
    return response.data;
  },

  async cambiarPassword(password_actual: string, password_nueva: string): Promise<void> {
    await api.post('/api/v1/auth/cambiar-password', {
      password_actual,
      password_nueva,
    });
  },

  async getBloqueados(): Promise<Usuario[]> {
    const response = await api.get<Usuario[]>('/api/v1/auth/bloqueados');
    return response.data;
  },

  async desbloquearUsuario(usuario_id: number): Promise<void> {
    await api.patch(`/api/v1/auth/usuarios/${usuario_id}/desbloquear`);
  },
};
