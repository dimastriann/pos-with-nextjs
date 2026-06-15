import { IBackendAdapter, AuthResult } from '@/adapters/IBackendAdapter';
import { User } from '@/models/User';
import { ApiError } from './ApiError';

/**
 * REST API adapter — connect this to any backend that follows the contract:
 *
 *   GET    /{resource}        → T[]
 *   GET    /{resource}/:id    → T
 *   POST   /{resource}        → T  (body: T)
 *   PUT    /{resource}/:id    → T  (body: T)
 *   DELETE /{resource}/:id    → 204
 *   POST   /auth/login        → { user: User, token: string }
 *   POST   /auth/logout       → 204
 *   GET    /auth/me           → User
 *
 * Set NEXT_PUBLIC_BACKEND_ADAPTER=api and NEXT_PUBLIC_API_URL=https://your-backend/api
 */
export class ApiAdapter implements IBackendAdapter {
  private token: string | null = null;

  constructor(private baseUrl: string) {
    if (typeof window !== 'undefined') {
      this.token = sessionStorage.getItem('pos_token');
    }
  }

  private headers(): HeadersInit {
    const h: HeadersInit = { 'Content-Type': 'application/json' };
    if (this.token) h['Authorization'] = `Bearer ${this.token}`;
    return h;
  }

  private async request<T>(
    method: string,
    path: string,
    body?: unknown,
  ): Promise<T> {
    const res = await fetch(`${this.baseUrl}/${path}`, {
      method,
      headers: this.headers(),
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) {
      const text = await res.text().catch(() => res.statusText);
      throw new ApiError(res.status, text);
    }
    if (res.status === 204) return undefined as T;
    return res.json() as Promise<T>;
  }

  async getAll<T>(resource: string): Promise<T[]> {
    return this.request<T[]>('GET', resource);
  }

  async getById<T>(resource: string, id: string): Promise<T | null> {
    try {
      return await this.request<T>('GET', `${resource}/${id}`);
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) return null;
      throw err;
    }
  }

  async create<T extends { id: string }>(
    resource: string,
    item: T,
  ): Promise<T> {
    return this.request<T>('POST', resource, item);
  }

  async update<T extends { id: string }>(
    resource: string,
    item: T,
  ): Promise<T> {
    return this.request<T>('PUT', `${resource}/${item.id}`, item);
  }

  async delete(resource: string, id: string): Promise<void> {
    return this.request<void>('DELETE', `${resource}/${id}`);
  }

  async login(username: string, password: string): Promise<AuthResult> {
    try {
      const data = await this.request<{ user: User; token: string }>(
        'POST',
        'auth/login',
        {
          username,
          password,
        },
      );
      this.token = data.token;
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('pos_token', data.token);
      }
      return { success: true, user: data.user };
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Login failed';
      return { success: false, error: msg };
    }
  }

  async logout(): Promise<void> {
    try {
      await this.request<void>('POST', 'auth/logout');
    } finally {
      this.token = null;
      if (typeof window !== 'undefined') sessionStorage.removeItem('pos_token');
    }
  }

  async getCurrentUser(): Promise<User | null> {
    if (!this.token) return null;
    try {
      return await this.request<User>('GET', 'auth/me');
    } catch {
      return null;
    }
  }
}
