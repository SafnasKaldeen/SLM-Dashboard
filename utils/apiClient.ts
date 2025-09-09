import { getSession } from "next-auth/react";

export class ApiClient {
  private baseURL: string;

  constructor(baseURL = '/api') {
    this.baseURL = baseURL;
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const session = await getSession();
    
    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Add authorization header if session exists
    if (session?.accessToken) {
      headers['Authorization'] = `Bearer ${session.accessToken}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API Error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

// Export a default instance
export const apiClient = new ApiClient();

// Helper function for server-side API calls
export async function getAuthHeaders() {
  const session = await getSession();
  return {
    'Content-Type': 'application/json',
    ...(session?.accessToken && {
      'Authorization': `Bearer ${session.accessToken}`
    })
  };
}