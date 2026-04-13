// MongoDB subscription service
const MONGODB_URI = import.meta.env.VITE_MONGODB_URI;

interface Subscription {
  _id?: string;
  userId: string;
  duration: "1_week" | "2_weeks" | "1_month";
  startsAt: string;
  expiresAt: string;
  isActive: boolean;
  createdAt: string;
}

export const subscriptionService = {
  async getSubscription(userId: string): Promise<Subscription | null> {
    try {
      const response = await fetch(`${MONGODB_URI}/subscriptions/${userId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) return null;
      return response.json();
    } catch (error) {
      console.error("Error fetching subscription:", error);
      return null;
    }
  },

  async createSubscription(data: Omit<Subscription, "_id" | "createdAt">): Promise<Subscription> {
    const response = await fetch(`${MONGODB_URI}/subscriptions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...data,
        createdAt: new Date().toISOString(),
      }),
    });
    if (!response.ok) throw new Error("Failed to create subscription");
    return response.json();
  },

  async updateSubscription(userId: string, data: Partial<Subscription>): Promise<Subscription> {
    const response = await fetch(`${MONGODB_URI}/subscriptions/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to update subscription");
    return response.json();
  },

  async deleteSubscription(userId: string): Promise<void> {
    const response = await fetch(`${MONGODB_URI}/subscriptions/${userId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) throw new Error("Failed to delete subscription");
  },

  async getAllSubscriptions(): Promise<Subscription[]> {
    try {
      const response = await fetch(`${MONGODB_URI}/subscriptions`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) return [];
      return response.json();
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
      return [];
    }
  },
};
