export type UserGroup = string;

export interface User {
  username: string;
  firstname?: string;
  lastname?: string;
  groups: UserGroup[];
}

export interface AuthState {
  user: User | null;
  token: string | null;
}
