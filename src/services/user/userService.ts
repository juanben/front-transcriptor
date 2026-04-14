import { apiClient } from '../config';

export interface SignUpData {
  name: string;
  email: string;
  password: string;
}

export interface SignUpResponse {
  message?: string;
  user?: any;
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
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data.detail || error.response.data.message || 'Error al crear el usuario');
      } else if (error.request) {
        throw new Error('No se pudo conectar con el servidor. Verifica tu conexión o intenta más tarde.');
      } else {
        throw new Error('Error interno al intentar registrar usuario.');
      }
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
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data.detail || error.response.data.message || 'Token inválido');
      } else if (error.request) {
        throw new Error('No se pudo conectar con el servidor.');
      } else {
        throw new Error('Error interno al verificar sesión.');
      }
    }
  }
};

