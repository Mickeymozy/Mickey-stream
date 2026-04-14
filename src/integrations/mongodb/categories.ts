// MongoDB categories service
import { mongodbClient } from "./client";

export interface Category {
  _id?: string;
  name: string;
  icon?: string;
  displayOrder: number;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export const categoryService = {
  async getCategories(): Promise<Category[]> {
    try {
      const categories = await mongodbClient.get<Category[]>("/categories");
      return categories.sort((a, b) => a.displayOrder - b.displayOrder);
    } catch (error) {
      console.error("Error fetching categories:", error);
      return [];
    }
  },

  async getCategoryById(id: string): Promise<Category | null> {
    try {
      return await mongodbClient.get<Category>(`/categories/${id}`);
    } catch (error) {
      console.error("Error fetching category:", error);
      return null;
    }
  },

  async createCategory(data: Omit<Category, "_id" | "createdAt" | "updatedAt">): Promise<Category> {
    return mongodbClient.post<Category>("/categories", {
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  },

  async updateCategory(id: string, data: Partial<Category>): Promise<Category> {
    return mongodbClient.put<Category>(`/categories/${id}`, {
      ...data,
      updatedAt: new Date().toISOString(),
    });
  },

  async deleteCategory(id: string): Promise<void> {
    await mongodbClient.delete<void>(`/categories/${id}`);
  },
};
