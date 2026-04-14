// MongoDB API client utility
const MONGODB_URI = import.meta.env.VITE_MONGODB_URI;

export const mongodbClient = {
  async fetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${MONGODB_URI}${endpoint}`;
    try {
      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        ...options,
      });
      if (!response.ok) {
        throw new Error(`MongoDB API error: ${response.status} ${response.statusText}`);
      }
      return response.json();
    } catch (error) {
      console.error(`[MongoDB] Error calling ${endpoint}:`, error);
      throw error;
    }
  },

  async get<T>(endpoint: string): Promise<T> {
    return this.fetch<T>(endpoint, { method: "GET" });
  },

  async post<T>(endpoint: string, data: any): Promise<T> {
    return this.fetch<T>(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async put<T>(endpoint: string, data: any): Promise<T> {
    return this.fetch<T>(endpoint, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  async delete<T>(endpoint: string): Promise<T> {
    return this.fetch<T>(endpoint, { method: "DELETE" });
  },
};
