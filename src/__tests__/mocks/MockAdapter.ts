import { IBackendAdapter, AuthResult } from '@/adapters/IBackendAdapter';
import { User } from '@/models/User';

type AnyRecord = Record<string, unknown>;

export class MockAdapter implements IBackendAdapter {
  private store: Record<string, AnyRecord> = {};
  private currentUser: User | null = null;
  private users: User[];

  constructor(seedUsers: User[] = []) {
    this.users = seedUsers;
  }

  async getAll<T>(resource: string): Promise<T[]> {
    return Object.values(this.store[resource] ?? {}) as T[];
  }

  async getById<T>(resource: string, id: string): Promise<T | null> {
    return (this.store[resource]?.[id] as T) ?? null;
  }

  async create<T extends { id: string }>(
    resource: string,
    item: T,
  ): Promise<T> {
    if (!this.store[resource]) this.store[resource] = {};
    this.store[resource][item.id] = item as unknown as AnyRecord;
    return item;
  }

  async update<T extends { id: string }>(
    resource: string,
    item: T,
  ): Promise<T> {
    if (!this.store[resource]) this.store[resource] = {};
    this.store[resource][item.id] = item as unknown as AnyRecord;
    return item;
  }

  async delete(resource: string, id: string): Promise<void> {
    if (this.store[resource]) delete this.store[resource][id];
  }

  async login(username: string, password: string): Promise<AuthResult> {
    const user = this.users.find(
      (u) => u.username === username && u.password === password,
    );
    if (user) {
      this.currentUser = user;
      return { success: true, user };
    }
    return { success: false, error: 'Invalid credentials' };
  }

  async logout(): Promise<void> {
    this.currentUser = null;
  }

  async getCurrentUser(): Promise<User | null> {
    return this.currentUser;
  }

  /** Set the authenticated user without going through login */
  setCurrentUser(user: User | null): void {
    this.currentUser = user;
  }

  /** Reset all stored data and auth state between tests */
  clear(): void {
    this.store = {};
    this.currentUser = null;
  }
}
