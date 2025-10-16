import { Router, Request, Response } from "express";
import { FCMService, NotificationPayload } from "../services/fcm.service.js";

const router = Router();

/**
 * @route POST /api/fcm/send
 * Send a push notification to a specific device.
 */
router.post("/send", async (req: Request, res: Response) => {
  try {
    const payload: NotificationPayload = req.body;

    if (!payload.token) {
      return res.status(400).json({ message: "Missing FCM token" });
    }

    const response = await FCMService.sendNotification(payload);
    res.json({ message: "Notification sent successfully", response });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route POST /api/fcm/topic
 * Send a push notification to all devices subscribed to a topic.
 */
router.post("/topic", async (req: Request, res: Response) => {
  try {
    const { topic, title, description, data } = req.body;

    if (!topic || !title || !description) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const response = await FCMService.sendToTopic(
      topic,
      title,
      description,
      data || {}
    );
    res.json({ message: `Notification sent to topic '${topic}'`, response });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
