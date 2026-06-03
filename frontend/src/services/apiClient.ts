export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

class ApiClient {
  private async request(endpoint: string, options: RequestInit = {}) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('verticle_token') : null;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    const response = await fetch(`${BASE_URL}${endpoint}`, config);
    
    let data: { message?: string } & Record<string, unknown>;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = { message: await response.text() };
    }

    if (!response.ok) {
      if (response.status === 401 && typeof window !== 'undefined' && !endpoint.includes('/auth/login')) {
        localStorage.removeItem('verticle_token');
        localStorage.removeItem('verticle_user');
        window.dispatchEvent(new CustomEvent('session-expired'));
      }

      throw new ApiError(
        data.message || `API request failed with status ${response.status}`,
        response.status,
        data
      );
    }

    return data;
  }

  async get(endpoint: string, options?: RequestInit) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  async post(endpoint: string, body: unknown, options?: RequestInit) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async put(endpoint: string, body: unknown, options?: RequestInit) {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  async delete(endpoint: string, options?: RequestInit) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();
