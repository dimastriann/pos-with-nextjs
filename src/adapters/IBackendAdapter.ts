import { User } from '@/models/User';

export type AuthResult =
  | { success: true; user: User }
  | { success: false; error: string };

export interface IBackendAdapter {
  getAll<T>(resource: string): Promise<T[]>;
  getById<T>(resource: string, id: string): Promise<T | null>;
  create<T extends { id: string }>(resource: string, item: T): Promise<T>;
  update<T extends { id: string }>(resource: string, item: T): Promise<T>;
  delete(resource: string, id: string): Promise<void>;

  login(username: string, password: string): Promise<AuthResult>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<User | null>;
}
