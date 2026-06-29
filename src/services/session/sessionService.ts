import axios from 'axios';
import { apiClient } from '../config';

export interface CreateSessionParams {
  roomId: string;
  audioFile: File | Blob;
  sessionName: string;
  creatorEmail: string;
  allowDownload: boolean;
  visible: boolean;
}

export interface Session {
  session_id: string;
  room_id: string;
  room_code: string;
  name: string;
  creator_email: string;
  duration: number;
  allow_download: boolean;
  record_path: string;
  status: string;
  transcription: string;
  summary: string;
  created_at: string;
  updated_at: string;
  error_message: string;
  visible: boolean;
  complementaryResourses?: string | string[] | null;
  complementaryResources?: string | string[] | null;
}

export interface RoomSessionsResponse {
  room_id: string;
  room_name: string;
  total: number;
  sessions: Session[];
}

export const sessionService = {
  /**
   * Crea una nueva sesión enviando un audio y sus datos
   * Ruta: POST /sessions/{room_id}/create
   */
  async createSession(params: CreateSessionParams): Promise<unknown> {
    const formData = new FormData();
    // Añadir el archivo con un nombre de archivo
    formData.append('file', params.audioFile, 'audio.wav');
    formData.append('session_name', params.sessionName);
    formData.append('creator_email', params.creatorEmail);
    formData.append('allow_download', String(params.allowDownload));
    formData.append('visible', String(params.visible));

    try {
      const response = await apiClient.post(`/sessions/${params.roomId}/create`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.detail || error.response?.data?.message || 'Error al crear la sesión');
      }
      throw error;
    }
  },

  /**
   * Obtiene la lista de sesiones por ID de sala
   * Ruta: GET /sessions/{room_id}/list
   */
  async getSessionsByRoomId(roomId: string, requesterEmail: string, limit: number = 100): Promise<RoomSessionsResponse> {
    try {
      const response = await apiClient.get<RoomSessionsResponse>(`/sessions/${encodeURIComponent(roomId)}/list`, {
        params: {
          requester_email: requesterEmail,
          limit: limit
        }
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.detail || error.response?.data?.message || 'Error al obtener las sesiones');
      }
      throw error;
    }
  },

  /**
   * Obtiene los detalles de una sesión específica
   * Ruta: GET /sessions/{room_id}/{session_id}/details
   */
  async getSessionDetails(roomId: string, sessionId: string, requesterEmail: string): Promise<Session> {
    try {
      const response = await apiClient.get<Session>(`/sessions/${encodeURIComponent(roomId)}/${encodeURIComponent(sessionId)}/details`, {
        params: {
          requester_email: requesterEmail
        }
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.detail || error.response?.data?.message || 'Error al obtener los detalles de la sesión');
      }
      throw error;
    }
  },

  /**
   * Añade recursos complementarios a una sesión
   * Ruta: PUT /sessions/{room_id}/{session_id}/complementary-resourses
   */
  async addComplementaryResources(roomId: string, sessionId: string, ownerEmail: string, resources: string): Promise<unknown> {
    try {
      const response = await apiClient.put(`/sessions/${encodeURIComponent(roomId)}/${encodeURIComponent(sessionId)}/complementary-resourses`, {
        owner_email: ownerEmail,
        complementaryResourses: resources
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.detail || error.response?.data?.message || 'Error al añadir recursos complementarios');
      }
      throw error;
    }
  },

  /**
   * Actualiza la visibilidad de una sesión
   * Ruta: PUT /sessions/{room_id}/{session_id}/visible
   */
  async updateSessionVisibility(roomId: string, sessionId: string, ownerEmail: string, visible: boolean): Promise<unknown> {
    try {
      const response = await apiClient.put(`/sessions/${encodeURIComponent(roomId)}/${encodeURIComponent(sessionId)}/visible`, {
        owner_email: ownerEmail,
        visible: visible
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.detail || error.response?.data?.message || 'Error al actualizar la visibilidad');
      }
      throw error;
    }
  },

  /**
   * Actualiza si se permite la descarga de una sesión
   * Ruta: PUT /sessions/{room_id}/{session_id}/allow-download
   */
  async updateSessionAllowDownload(roomId: string, sessionId: string, ownerEmail: string, allowDownload: boolean): Promise<unknown> {
    try {
      const response = await apiClient.put(`/sessions/${encodeURIComponent(roomId)}/${encodeURIComponent(sessionId)}/allow-download`, {
        owner_email: ownerEmail,
        allow_download: allowDownload
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.detail || error.response?.data?.message || 'Error al actualizar permisos de descarga');
      }
      throw error;
    }
  },

  /**
   * Actualiza el nombre de una sesión
   * Ruta: PUT /sessions/{room_id}/{session_id}/name
   */
  async updateSessionName(roomId: string, sessionId: string, ownerEmail: string, name: string): Promise<unknown> {
    try {
      const response = await apiClient.put(`/sessions/${encodeURIComponent(roomId)}/${encodeURIComponent(sessionId)}/name`, {
        owner_email: ownerEmail,
        name: name
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.detail || error.response?.data?.message || 'Error al actualizar el nombre de la sesión');
      }
      throw error;
    }
  },

  /**
   * Elimina una sesión
   * Ruta: DELETE /sessions/{room_id}/{session_id}
   */
  async deleteSession(roomId: string, sessionId: string, ownerEmail: string): Promise<unknown> {
    try {
      const response = await apiClient.delete(`/sessions/${encodeURIComponent(roomId)}/${encodeURIComponent(sessionId)}`, {
        data: {
          owner_email: ownerEmail
        }
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.detail || error.response?.data?.message || 'Error al eliminar la sesión');
      }
      throw error;
    }
  }
};
