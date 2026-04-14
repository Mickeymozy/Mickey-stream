// MongoDB notifications service
import { mongodbClient } from "./client";

export interface Notification {
  _id?: string;
  userId?: string;
  title: string;
  message: string;
  isRead: boolean;
  isGlobal: boolean;
  createdAt: string;
  updatedAt?: string;
}

export const notificationService = {
  async getUserNotifications(userId: string): Promise<Notification[]> {
    try {
      return await mongodbClient.get<Notification[]>(`/notifications/user/${userId}`);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      return [];
    }
  },

  async getGlobalNotifications(): Promise<Notification[]> {
    try {
      return await mongodbClient.get<Notification[]>("/notifications/global");
    } catch (error) {
      console.error("Error fetching global notifications:", error);
      return [];
    }
  },

  async createNotification(data: Omit<Notification, "_id" | "createdAt">): Promise<Notification> {
    return mongodbClient.post<Notification>("/notifications", {
      ...data,
      createdAt: new Date().toISOString(),
    });
  },

  async markAsRead(notificationId: string): Promise<Notification> {
    return mongodbClient.put<Notification>(`/notifications/${notificationId}`, {
      isRead: true,
      updatedAt: new Date().toISOString(),
    });
  },

  async deleteNotification(notificationId: string): Promise<void> {
    await mongodbClient.delete<void>(`/notifications/${notificationId}`);
  },
};
