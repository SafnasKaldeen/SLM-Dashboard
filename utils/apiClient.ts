import { getSession } from "next-auth/react";

export class ApiClient {
  private baseURL: string;

  constructor(baseURL = "/api") {
    this.baseURL = baseURL;
  }

  private async getHeaders(options?: RequestInit["headers"]): Promise<Headers> {
    const session = await getSession();
    const headers = new Headers(options);

    headers.set("Content-Type", "application/json");

    if (session?.accessToken) {
      headers.set("Authorization", `Bearer ${session.accessToken}`);
    }

    return headers;
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers = await this.getHeaders(options.headers);

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }

    return response.json();
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "GET" });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "DELETE" });
  }
}

// Default instance
export const apiClient = new ApiClient();

// Helper for server-side API calls
export async function getAuthHeaders(): Promise<HeadersInit> {
  const session = await getSession();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (session?.accessToken) {
    headers["Authorization"] = `Bearer ${session.accessToken}`;
  }

  return headers;
}
