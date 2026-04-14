import { apiClient } from '../config';

export interface Room {
  _id: string;
  name: string;
  owner_email: string;
  is_public: boolean;
  allow_download: boolean;
  created_at: string;
  members: string[];
}

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
  }
};

