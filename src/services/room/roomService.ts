import { apiClient } from '../config';
import type { Room } from '../../types/rooms';

export interface UserRoomsResponse {
  owner_email: string;
  total: number;
  rooms: Room[];
}

export interface CreateRoomData {
  name: string;
  owner_email: string;
  is_public: boolean;
  allow_download: boolean;
}

export interface CreateRoomResponse {
  name: string;
  owner_email: string;
  is_public: boolean;
  allow_download: boolean;
  // Puede contener _id dependiendo del backend, aunque el payload de ejemplo no lo muestre explícitamente
  _id?: string; 
}

export interface UpdateRoomNameData {
  owner_email: string;
  new_name: string;
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
}

export interface RoomSessionsResponse {
  room_id: string;
  room_name: string;
  total: number;
  sessions: Session[];
}

export const roomService = {
  /**
   * Recupera las salas (rooms) que le pertenecen a un usuario específico.
   * URL: GET /room/user-rooms/{email}
   */
  async getUserRooms(email: string): Promise<UserRoomsResponse> {
    try {
      const response = await apiClient.get<UserRoomsResponse>(`/room/user-rooms/${encodeURIComponent(email)}`);
      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data.detail || error.response.data.message || 'Error al obtener las salas');
      } else if (error.request) {
        throw new Error('No se pudo conectar con el servidor.');
      } else {
        throw new Error('Error interno al obtener las salas.');
      }
    }
  },

  /**
   * Crea una nueva sala (room).
   * URL: POST /room/createRoom
   */
  async createRoom(data: CreateRoomData): Promise<CreateRoomResponse> {
    try {
      const response = await apiClient.post<CreateRoomResponse>('/room/createRoom', data);
      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data.detail || error.response.data.message || 'Error al crear la sala');
      } else if (error.request) {
        throw new Error('No se pudo conectar con el servidor.');
      } else {
        throw new Error('Error interno al crear la sala.');
      }
    }
  },

  /**
   * Elimina una sala.
   * URL: DELETE /room/{id_room}
   */
  async deleteRoom(idRoom: string, ownerEmail: string): Promise<any> {
    try {
      // Axios maneja el body en DELETE dentro de un objeto `data`
      const response = await apiClient.delete(`/room/${encodeURIComponent(idRoom)}`, {
        data: { owner_email: ownerEmail }
      });
      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data.detail || error.response.data.message || 'Error al eliminar la sala');
      } else if (error.request) {
        throw new Error('No se pudo conectar con el servidor.');
      } else {
        throw new Error('Error interno al eliminar la sala.');
      }
    }
  },

  /**
   * Edita el nombre de una sala.
   * URL: PUT /room/{id_room}/update-name
   */
  async updateRoomName(idRoom: string, data: UpdateRoomNameData): Promise<any> {
    try {
      // Se asume que el método puede ser PUT o PATCH. Si fuera POST, se debe cambiar.
      const response = await apiClient.put(`/room/${encodeURIComponent(idRoom)}/update-name`, data);
      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data.detail || error.response.data.message || 'Error al actualizar el nombre de la sala');
      } else if (error.request) {
        throw new Error('No se pudo conectar con el servidor.');
      } else {
        throw new Error('Error interno al actualizar el nombre de la sala.');
      }
    }
  },

  /**
   * Recupera las sesiones de una sala (room) específica.
   * URL: GET /room/{id_room}/sessions
   */
  async getRoomSessions(idRoom: string): Promise<RoomSessionsResponse> {
    try {
      // Asumiendo que el endpoint es /room/{id_room}/sessions
      const response = await apiClient.get<RoomSessionsResponse>(`/room/${encodeURIComponent(idRoom)}/sessions`);
      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data.detail || error.response.data.message || 'Error al obtener las sesiones de la sala');
      } else if (error.request) {
        throw new Error('No se pudo conectar con el servidor.');
      } else {
        throw new Error('Error interno al obtener las sesiones de la sala.');
      }
    }
  },

  /**
   * Recupera la lista de espera de una sala.
   * URL: GET /room/{room_id}/waitlist
   */
  async getWaitlist(roomId: string, ownerEmail: string): Promise<any> {
    try {
      const response = await apiClient.get(`/room/${encodeURIComponent(roomId)}/waitlist`, {
        params: {
          owner_email: ownerEmail
        }
      });
      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data.detail || error.response.data.message || 'Error al obtener la lista de espera');
      } else if (error.request) {
        throw new Error('No se pudo conectar con el servidor.');
      } else {
        throw new Error('Error interno al obtener la lista de espera.');
      }
    }
  },

  /**
   * Acepta un usuario de la lista de espera.
   * URL: POST /room/{room_id}/waitlist/accept
   */
  async acceptWaitlistUser(roomId: string, ownerEmail: string, userEmail: string): Promise<any> {
    try {
      const response = await apiClient.post(`/room/${encodeURIComponent(roomId)}/waitlist/accept`, {
        owner_email: ownerEmail,
        user_email: userEmail
      });
      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data.detail || error.response.data.message || 'Error al aceptar usuario de la lista de espera');
      } else if (error.request) {
        throw new Error('No se pudo conectar con el servidor.');
      } else {
        throw new Error('Error interno al aceptar usuario.');
      }
    }
  },

  /**
   * Acepta todos los usuarios de la lista de espera.
   * URL: POST /room/{room_id}/waitlist/accept-all
   */
  async acceptAllWaitlist(roomId: string, ownerEmail: string): Promise<any> {
    try {
      const response = await apiClient.post(`/room/${encodeURIComponent(roomId)}/waitlist/accept-all`, {
        owner_email: ownerEmail
      });
      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data.detail || error.response.data.message || 'Error al aceptar todos los usuarios');
      } else if (error.request) {
        throw new Error('No se pudo conectar con el servidor.');
      } else {
        throw new Error('Error interno al aceptar todos los usuarios.');
      }
    }
  }
};
