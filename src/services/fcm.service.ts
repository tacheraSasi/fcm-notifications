import admin from "../config/firebase.js";

export interface NotificationPayload {
  token: string; // Single device token
  id: number;
  type: number;
  title: string;
  description: string;
  read: boolean;
  issuedDate: string;
}

export class FCMService {
  /**
   * Send a single push notification to a specific device token.
   */
  static async sendNotification(payload: NotificationPayload): Promise<string> {
    const message = {
      notification: {
        title: payload.title,
        body: payload.description,
      },
      data: {
        id: payload.id.toString(),
        type: payload.type.toString(),
        read: payload.read.toString(),
        issuedDate: payload.issuedDate,
      },
      token: payload.token,
    };

    try {
      const response = await admin.messaging().send(message);
      console.log("✅ Notification sent:", response);
      return response;
    } catch (error) {
      console.error("❌ FCM send error:", error);
      throw error;
    }
  }

  /**
   * Send a notification to a topic (e.g. all supervisors)
   */
  static async sendToTopic(
    topic: string,
    title: string,
    description: string,
    data: Record<string, string> = {}
  ): Promise<string> {
    const message = {
      notification: {
        title,
        body: description,
      },
      data,
      topic,
    };

    try {
      const response = await admin.messaging().send(message);
      console.log(`📢 Notification sent to topic '${topic}':`, response);
      return response;
    } catch (error) {
      console.error("❌ Topic send error:", error);
      throw error;
    }
  }
}
