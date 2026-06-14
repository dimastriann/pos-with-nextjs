import { LocalStorageAdapter } from './local/LocalStorageAdapter';
import { ApiAdapter } from './api/ApiAdapter';
import type { IBackendAdapter } from './IBackendAdapter';

const backendType = process.env.NEXT_PUBLIC_BACKEND_ADAPTER ?? 'localStorage';
const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080/api';

export const adapter: IBackendAdapter =
  backendType === 'api' ? new ApiAdapter(apiUrl) : new LocalStorageAdapter();
