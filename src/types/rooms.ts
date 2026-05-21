export interface Room {
  _id: string;
  id?: string;
  name: string;
  owner_email: string;
  is_public: boolean;
  allow_download: boolean;
  created_at: string;
  members: Array<string>;
  waitlist: Array<string>;
  room_code?: string;
  visible?: boolean;
  is_member?: boolean;
  is_waitlisted?: boolean;
  membership_status?: 'member' | 'waitlist' | 'none' | string;
}