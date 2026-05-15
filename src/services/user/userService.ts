import axios from 'axios';
import { apiClient } from '../config';

export interface SignUpData {
  name: string;
  email: string;
  password: string;
}

export interface SignUpResponse {
  message?: string;
  user?: unknown;
}

export interface UserMeResponse {
  user_id: string;
  name: string;
  email: string;
  email_verified: boolean;
}

export const userService = {
  /**
   * Envía los datos al servicio de backend para registrar un nuevo usuario.
   * URL de la API base: la del archivo .env (por defecto http://localhost:8000)
   * Ruta: /user/
   */
  async signUp(data: SignUpData): Promise<SignUpResponse> {
    try {
      const response = await apiClient.post<SignUpResponse>('/user/', data);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.detail || error.response?.data?.message || 'Error al crear el usuario');
      }
      throw error;
    }
  },

  /**
   * Verifica si un token es válido y devuelve los datos del usuario.
   * Ruta: GET /user/me?token={token}
   */
  async getUserMe(token: string): Promise<UserMeResponse> {
    try {
      const response = await apiClient.get<UserMeResponse>(`/user/me?token=${token}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.detail || error.response?.data?.message || 'Token inválido');
      }
      throw error;
    }
  }
};

