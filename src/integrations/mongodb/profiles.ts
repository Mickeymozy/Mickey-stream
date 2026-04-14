// MongoDB user profiles service
import { mongodbClient } from "./client";

export interface UserProfile {
  _id?: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl?: string;
  status: "pending" | "active" | "blocked" | "deleted";
  createdAt: string;
  updatedAt: string;
}

export const profileService = {
  async getProfile(userId: string): Promise<UserProfile | null> {
    try {
      return await mongodbClient.get<UserProfile>(`/profiles/${userId}`);
    } catch (error) {
      console.error("Error fetching profile:", error);
      return null;
    }
  },

  async createProfile(data: Omit<UserProfile, "_id" | "createdAt" | "updatedAt">): Promise<UserProfile> {
    return mongodbClient.post<UserProfile>("/profiles", {
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  },

  async updateProfile(userId: string, data: Partial<UserProfile>): Promise<UserProfile> {
    return mongodbClient.put<UserProfile>(`/profiles/${userId}`, {
      ...data,
      updatedAt: new Date().toISOString(),
    });
  },

  async deleteProfile(userId: string): Promise<void> {
    await mongodbClient.delete<void>(`/profiles/${userId}`);
  },

  async getAllProfiles(): Promise<UserProfile[]> {
    try {
      return await mongodbClient.get<UserProfile[]>("/profiles");
    } catch (error) {
      console.error("Error fetching profiles:", error);
      return [];
    }
  },
};
