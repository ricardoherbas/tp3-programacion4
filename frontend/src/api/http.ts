
const API_URL = import.meta.env.VITE_API_URL ?? "/api";

interface HttpOptions {
  method: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
}

async function request<T>(
  endpoint: string,
  options: HttpOptions,
): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    method: options.method,
    headers: options.body
      ? { "Content-Type": "application/json" }
      : undefined,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    throw new Error(
      `Error HTTP ${response.status}: ${response.statusText}`,
    );
  }

  return (await response.json()) as T;
}

export const http = {
  get<T>(endpoint: string): Promise<T> {
    return request<T>(endpoint, { method: "GET" });
  },

  post<T>(endpoint: string, body: unknown): Promise<T> {
    return request<T>(endpoint, { method: "POST", body });
  },

  put<T>(endpoint: string, body: unknown): Promise<T> {
    return request<T>(endpoint, { method: "PUT", body });
  },

  delete<T>(endpoint: string): Promise<T> {
    return request<T>(endpoint, { method: "DELETE" });
  },
};
