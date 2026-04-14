// MongoDB matches service
import { mongodbClient } from "./client";

export interface Match {
  _id?: string;
  title: string;
  matchTime: string;
  channelId: string;
  channelName?: string;
  isLive: boolean;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const matchService = {
  async getMatches(): Promise<Match[]> {
    try {
      return await mongodbClient.get<Match[]>("/matches");
    } catch (error) {
      console.error("Error fetching matches:", error);
      return [];
    }
  },

  async getLiveMatches(): Promise<Match[]> {
    try {
      return await mongodbClient.get<Match[]>("/matches?filter=live");
    } catch (error) {
      console.error("Error fetching live matches:", error);
      return [];
    }
  },

  async getMatchById(id: string): Promise<Match | null> {
    try {
      return await mongodbClient.get<Match>(`/matches/${id}`);
    } catch (error) {
      console.error("Error fetching match:", error);
      return null;
    }
  },

  async createMatch(data: Omit<Match, "_id" | "createdAt" | "updatedAt">): Promise<Match> {
    return mongodbClient.post<Match>("/matches", {
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  },

  async updateMatch(id: string, data: Partial<Match>): Promise<Match> {
    return mongodbClient.put<Match>(`/matches/${id}`, {
      ...data,
      updatedAt: new Date().toISOString(),
    });
  },

  async deleteMatch(id: string): Promise<void> {
    await mongodbClient.delete<void>(`/matches/${id}`);
  },
};
