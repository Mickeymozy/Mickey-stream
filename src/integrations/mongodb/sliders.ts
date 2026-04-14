// MongoDB sliders service (home carousel)
import { mongodbClient } from "./client";

export interface Slider {
  _id?: string;
  imageUrl: string;
  title: string;
  description?: string;
  actionUrl?: string;
  displayOrder: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export const sliderService = {
  async getSliders(): Promise<Slider[]> {
    try {
      const sliders = await mongodbClient.get<Slider[]>("/sliders");
      return sliders.sort((a, b) => a.displayOrder - b.displayOrder);
    } catch (error) {
      console.error("Error fetching sliders:", error);
      return [];
    }
  },

  async getActiveSliders(): Promise<Slider[]> {
    try {
      const sliders = await mongodbClient.get<Slider[]>("/sliders?filter=active");
      return sliders.sort((a, b) => a.displayOrder - b.displayOrder);
    } catch (error) {
      console.error("Error fetching active sliders:", error);
      return [];
    }
  },

  async getSliderById(id: string): Promise<Slider | null> {
    try {
      return await mongodbClient.get<Slider>(`/sliders/${id}`);
    } catch (error) {
      console.error("Error fetching slider:", error);
      return null;
    }
  },

  async createSlider(data: Omit<Slider, "_id" | "createdAt" | "updatedAt">): Promise<Slider> {
    return mongodbClient.post<Slider>("/sliders", {
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  },

  async updateSlider(id: string, data: Partial<Slider>): Promise<Slider> {
    return mongodbClient.put<Slider>(`/sliders/${id}`, {
      ...data,
      updatedAt: new Date().toISOString(),
    });
  },

  async deleteSlider(id: string): Promise<void> {
    await mongodbClient.delete<void>(`/sliders/${id}`);
  },
};
