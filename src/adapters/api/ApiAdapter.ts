import { IBackendAdapter, AuthResult } from '@/adapters/IBackendAdapter';
import { User } from '@/models/User';
import { ApiError } from './ApiError';

const TOKEN_KEY = 'pos_token';
const REFRESH_KEY = 'pos_refresh_token';

/**
 * REST API adapter — connect this to any backend that follows the contract:
 *
 *   GET    /{resource}        → T[]
 *   GET    /{resource}/:id    → T
 *   POST   /{resource}        → T  (body: T)
 *   PUT    /{resource}/:id    → T  (body: T)
 *   DELETE /{resource}/:id    → 204
 *   POST   /auth/login        → { user: User, token: string, refreshToken?: string }
 *   POST   /auth/refresh      → { token: string, refreshToken?: string }
 *   POST   /auth/logout       → 204
 *   GET    /auth/me           → User
 *
 * Set NEXT_PUBLIC_BACKEND_ADAPTER=api and NEXT_PUBLIC_API_URL=https://your-backend/api
 */
export class ApiAdapter implements IBackendAdapter {
  private token: string | null = null;

  constructor(private baseUrl: string) {
    if (typeof window !== 'undefined') {
      this.token = sessionStorage.getItem(TOKEN_KEY);
    }
  }

  private headers(): HeadersInit {
    const h: HeadersInit = { 'Content-Type': 'application/json' };
    if (this.token) h['Authorization'] = `Bearer ${this.token}`;
    return h;
  }

  private storeTokens(token: string, refreshToken?: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(TOKEN_KEY, token);
      if (refreshToken) localStorage.setItem(REFRESH_KEY, refreshToken);
    }
  }

  private clearTokens() {
    this.token = null;
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REFRESH_KEY);
    }
  }

  private async tryRefresh(): Promise<boolean> {
    const refreshToken =
      typeof window !== 'undefined' ? localStorage.getItem(REFRESH_KEY) : null;
    if (!refreshToken) return false;
    try {
      const res = await fetch(`${this.baseUrl}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
      if (!res.ok) return false;
      const data: { token: string; refreshToken?: string } = await res.json();
      this.storeTokens(data.token, data.refreshToken);
      return true;
    } catch {
      return false;
    }
  }

  private async request<T>(
    method: string,
    path: string,
    body?: unknown,
    isRetry = false,
  ): Promise<T> {
    const res = await fetch(`${this.baseUrl}/${path}`, {
      method,
      headers: this.headers(),
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    // Auto-refresh on 401, but don't loop on auth endpoints
    if (res.status === 401 && !isRetry && !path.startsWith('auth/')) {
      const refreshed = await this.tryRefresh();
      if (refreshed) return this.request<T>(method, path, body, true);
      this.clearTokens();
    }

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
      const data = await this.request<{
        user: User;
        token: string;
        refreshToken?: string;
      }>('POST', 'auth/login', { username, password });
      this.storeTokens(data.token, data.refreshToken);
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
      this.clearTokens();
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
