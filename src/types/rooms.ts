export interface Room {
  _id: string;
  name: string;
  owner_email: string;
  is_public: boolean;
  allow_download: boolean;
  created_at: string;
  members: Array<string>;
  waitlist: Array<string>;
}