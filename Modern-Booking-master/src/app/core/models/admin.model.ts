export type AdminRole = 'ADMIN' | 'AGENT';

export interface Admin {
  id?: number;
  username: string;
  password: string;
  role: AdminRole;
}
