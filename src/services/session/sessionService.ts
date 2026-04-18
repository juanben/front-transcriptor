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
  async createSession(params: CreateSessionParams): Promise<any> {
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
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data.detail || error.response.data.message || 'Error al crear la sesión');
      } else if (error.request) {
        throw new Error('No se pudo conectar con el servidor.');
      } else {
        throw new Error('Error interno al crear sesión.');
      }
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
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data.detail || error.response.data.message || 'Error al obtener las sesiones');
      } else if (error.request) {
        throw new Error('No se pudo conectar con el servidor.');
      } else {
        throw new Error('Error interno al obtener sesiones.');
      }
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
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data.detail || error.response.data.message || 'Error al obtener los detalles de la sesión');
      } else if (error.request) {
        throw new Error('No se pudo conectar con el servidor.');
      } else {
        throw new Error('Error interno al obtener los detalles.');
      }
    }
  },

  /**
   * Añade recursos complementarios a una sesión
   * Ruta: PUT /sessions/{room_id}/{session_id}/complementary-resourses
   */
  async addComplementaryResources(roomId: string, sessionId: string, ownerEmail: string, resources: string): Promise<any> {
    try {
      const response = await apiClient.put(`/sessions/${encodeURIComponent(roomId)}/${encodeURIComponent(sessionId)}/complementary-resourses`, {
        owner_email: ownerEmail,
        complementaryResourses: resources
      });
      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data.detail || error.response.data.message || 'Error al añadir recursos complementarios');
      } else if (error.request) {
        throw new Error('No se pudo conectar con el servidor.');
      } else {
        throw new Error('Error interno al añadir recursos.');
      }
    }
  },

  /**
   * Actualiza la visibilidad de una sesión
   * Ruta: PUT /sessions/{room_id}/{session_id}/visible
   */
  async updateSessionVisibility(roomId: string, sessionId: string, ownerEmail: string, visible: boolean): Promise<any> {
    try {
      const response = await apiClient.put(`/sessions/${encodeURIComponent(roomId)}/${encodeURIComponent(sessionId)}/visible`, {
        owner_email: ownerEmail,
        visible: visible
      });
      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data.detail || error.response.data.message || 'Error al actualizar la visibilidad');
      } else if (error.request) {
        throw new Error('No se pudo conectar con el servidor.');
      } else {
        throw new Error('Error interno al actualizar la visibilidad.');
      }
    }
  },

  /**
   * Actualiza si se permite la descarga de una sesión
   * Ruta: PUT /sessions/{room_id}/{session_id}/allow-download
   */
  async updateSessionAllowDownload(roomId: string, sessionId: string, ownerEmail: string, allowDownload: boolean): Promise<any> {
    try {
      const response = await apiClient.put(`/sessions/${encodeURIComponent(roomId)}/${encodeURIComponent(sessionId)}/allow-download`, {
        owner_email: ownerEmail,
        allow_download: allowDownload
      });
      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data.detail || error.response.data.message || 'Error al actualizar permisos de descarga');
      } else if (error.request) {
        throw new Error('No se pudo conectar con el servidor.');
      } else {
        throw new Error('Error interno al actualizar permisos.');
      }
    }
  }
};
