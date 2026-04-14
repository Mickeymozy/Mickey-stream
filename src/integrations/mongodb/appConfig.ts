// MongoDB app configuration service
import { mongodbClient } from "./client";

export interface AppConfig {
  _id?: string;
  key: string;
  value: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const appConfigService = {
  async getConfig(key: string): Promise<string | null> {
    try {
      const config = await mongodbClient.get<AppConfig>(`/app-config/${key}`);
      return config?.value || null;
    } catch (error) {
      console.error(`Error fetching config ${key}:`, error);
      return null;
    }
  },

  async getAllConfigs(): Promise<Record<string, string>> {
    try {
      const configs = await mongodbClient.get<AppConfig[]>("/app-config");
      return configs.reduce((acc, config) => {
        acc[config.key] = config.value;
        return acc;
      }, {} as Record<string, string>);
    } catch (error) {
      console.error("Error fetching configs:", error);
      return {};
    }
  },

  async setConfig(key: string, value: string, description?: string): Promise<AppConfig> {
    return mongodbClient.post<AppConfig>("/app-config", {
      key,
      value,
      description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  },

  async updateConfig(key: string, value: string): Promise<AppConfig> {
    return mongodbClient.put<AppConfig>(`/app-config/${key}`, {
      value,
      updatedAt: new Date().toISOString(),
    });
  },

  async deleteConfig(key: string): Promise<void> {
    await mongodbClient.delete<void>(`/app-config/${key}`);
  },

  // Convenience methods for commonly used configs
  async getGlobalToken(): Promise<string | null> {
    return this.getConfig("global_token");
  },

  async setGlobalToken(token: string): Promise<AppConfig> {
    return this.setConfig("global_token", token, "Global CDN token for MPD streams");
  },
};
