import axios from 'axios';
import { apiClient } from '../config';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  session_token?: string;
  expires_at?: string;
  message?: string;
}

export const loginService = {
  /**
   * Envía las credenciales al servicio de backend para iniciar sesión.
   * URL de la API base: la del archivo .env (por defecto http://localhost:8000)
   * Ruta: /user/login
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const response = await apiClient.post<LoginResponse>('/user/login', credentials);
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          throw new Error(error.response.data.detail || error.response.data.message || "Credenciales inválidas" );
        } else if (error.request) {
          throw new Error('No se pudo conectar con el servidor. Verifica tu conexión o intenta más tarde.');
        } else {
          throw new Error('Error interno al intentar iniciar sesión.');
        }
      }
      throw new Error('Error interno al intentar iniciar sesión.');
    }
  },

  /**
   * Envía el ID Token de Google al servicio de backend (/user/google-auth).
   */
  async loginWithGoogle(googleToken: string): Promise<LoginResponse> {
    try {
      const response = await apiClient.post<LoginResponse>('/user/google-auth', { token: googleToken });
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          throw new Error(error.response.data.detail || error.response.data.message || "Error al autenticar con Google");
        } else if (error.request) {
          throw new Error('No se pudo conectar con el servidor. Verifica tu conexión.');
        }
      }
      throw new Error('Error al autenticar con Google');
    }
  }
};
