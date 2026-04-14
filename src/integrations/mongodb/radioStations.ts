// MongoDB radio stations service
import { mongodbClient } from "./client";

export interface RadioStation {
  _id?: string;
  name: string;
  streamUrl: string;
  logoUrl?: string;
  category?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export const radioStationService = {
  async getRadioStations(): Promise<RadioStation[]> {
    try {
      return await mongodbClient.get<RadioStation[]>("/radio-stations");
    } catch (error) {
      console.error("Error fetching radio stations:", error);
      return [];
    }
  },

  async getRadioStation(id: string): Promise<RadioStation | null> {
    try {
      return await mongodbClient.get<RadioStation>(`/radio-stations/${id}`);
    } catch (error) {
      console.error("Error fetching radio station:", error);
      return null;
    }
  },

  async createRadioStation(data: Omit<RadioStation, "_id" | "createdAt" | "updatedAt">): Promise<RadioStation> {
    return mongodbClient.post<RadioStation>("/radio-stations", {
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  },

  async updateRadioStation(id: string, data: Partial<RadioStation>): Promise<RadioStation> {
    return mongodbClient.put<RadioStation>(`/radio-stations/${id}`, {
      ...data,
      updatedAt: new Date().toISOString(),
    });
  },

  async deleteRadioStation(id: string): Promise<void> {
    await mongodbClient.delete<void>(`/radio-stations/${id}`);
  },
};
