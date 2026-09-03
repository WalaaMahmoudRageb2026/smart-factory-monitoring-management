// Centralized API Client

const BASE_URL = '/api';

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.status = status;
    this.data = data;
    this.name = 'ApiError';
  }
}

export function getAuthToken(): string | null {
  return localStorage.getItem('smart_factory_jwt_token');
}

export function setAuthToken(token: string) {
  localStorage.setItem('smart_factory_jwt_token', token);
}

export function removeAuthToken() {
  localStorage.removeItem('smart_factory_jwt_token');
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = endpoint.startsWith('/') ? `${BASE_URL}${endpoint}` : `${BASE_URL}/${endpoint}`;

  const res = await fetch(url, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    if (res.status === 401 && !endpoint.includes('/auth/login')) {
      // Session expired or invalid
      removeAuthToken();
      window.dispatchEvent(new Event('auth:unauthorized'));
    }
    throw new ApiError(data.error || `HTTP error ${res.status}`, res.status, data);
  }

  return data;
}

export const api = {
  get: <T = any>(url: string, params?: Record<string, any>) => {
    let finalUrl = url;
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          searchParams.append(key, String(val));
        }
      });
      const qs = searchParams.toString();
      if (qs) finalUrl += `?${qs}`;
    }
    return apiRequest<T>(finalUrl, { method: 'GET' });
  },
  post: <T = any>(url: string, body?: any) =>
    apiRequest<T>(url, { method: 'POST', body: JSON.stringify(body || {}) }),
  put: <T = any>(url: string, body?: any) =>
    apiRequest<T>(url, { method: 'PUT', body: JSON.stringify(body || {}) }),
  patch: <T = any>(url: string, body?: any) =>
    apiRequest<T>(url, { method: 'PATCH', body: JSON.stringify(body || {}) }),
  delete: <T = any>(url: string) => apiRequest<T>(url, { method: 'DELETE' }),
};
