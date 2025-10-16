import { Router, Request, Response } from "express";
import { FCMService, NotificationPayload } from "../services/fcm.service.js";

const router = Router();

// Get token from environment variable
const DEFAULT_TOKEN = process.env.TOKEN || "your_token_here";

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

/**
 * @route GET /api/fcm/test
 * Test endpoint to verify the FCM service is working
 */
router.get("/test", (req: Request, res: Response) => {
  res.json({
    message: "FCM service is running",
    timestamp: new Date().toISOString(),
    endpoints: {
      send: "POST /api/fcm/send",
      topic: "POST /api/fcm/topic",
      testSend: "POST /api/fcm/test/send",
      testTopic: "POST /api/fcm/test/topic",
      mockSend: "POST /api/fcm/test/mock-send",
      mockTopic: "POST /api/fcm/test/mock-topic",
    },
  });
});

/**
 * @route POST /api/fcm/test/send
 * Test endpoint with sample notification data
 */
router.post("/test/send", async (req: Request, res: Response) => {
  try {
    // Use token from environment variable
    const token = DEFAULT_TOKEN;

    const testPayload: NotificationPayload = {
      token,
      id: 12345,
      type: 1,
      title: "Test Notification",
      description: "This is a test notification from your FCM backend!",
      read: false,
      issuedDate: new Date().toISOString(),
    };

    const response = await FCMService.sendNotification(testPayload);
    res.json({
      message: "Test notification sent successfully",
      payload: testPayload,
      response,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route POST /api/fcm/test/topic
 * Test endpoint for topic notifications with sample data
 */
router.post("/test/topic", async (req: Request, res: Response) => {
  try {
    const { topic } = req.body;

    if (!topic) {
      return res.status(400).json({
        message: "Missing topic name",
        example: {
          topic: "all-users",
        },
      });
    }

    const response = await FCMService.sendToTopic(
      topic,
      "Test Topic Notification",
      "This is a test notification sent to all subscribers of the topic!",
      {
        testId: "12345",
        timestamp: new Date().toISOString(),
        priority: "high",
      }
    );

    res.json({
      message: `Test notification sent to topic '${topic}'`,
      response,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route POST /api/fcm/test/mock-send
 * Mock endpoint that simulates sending without actually using FCM (for testing)
 */
router.post("/test/mock-send", (req: Request, res: Response) => {
  // Use token from environment variable
  const token = DEFAULT_TOKEN;

  const mockPayload: NotificationPayload = {
    token,
    id: Math.floor(Math.random() * 10000),
    type: 1,
    title: "Mock Test Notification",
    description: "This is a mock notification (not actually sent via FCM)",
    read: false,
    issuedDate: new Date().toISOString(),
  };

  // Simulate FCM response
  const mockResponse = `projects/your-project/messages/${Date.now()}`;

  res.json({
    message: "Mock notification processed successfully (not sent)",
    payload: mockPayload,
    mockResponse,
    note: "This is a mock response - no actual FCM notification was sent",
  });
});

/**
 * @route POST /api/fcm/test/mock-topic
 * Mock endpoint for topic notifications (for testing without FCM)
 */
router.post("/test/mock-topic", (req: Request, res: Response) => {
  const { topic } = req.body;

  if (!topic) {
    return res.status(400).json({
      message: "Missing topic name",
      example: {
        topic: "all-users",
      },
    });
  }

  const mockResponse = `projects/your-project/messages/${Date.now()}`;

  res.json({
    message: `Mock notification processed for topic '${topic}' (not sent)`,
    topic,
    title: "Mock Topic Notification",
    description: "This is a mock topic notification",
    data: {
      testId: Math.floor(Math.random() * 10000).toString(),
      timestamp: new Date().toISOString(),
      priority: "normal",
    },
    mockResponse,
    note: "This is a mock response - no actual FCM notification was sent",
  });
});

/**
 * @route GET /api/fcm/examples
 * Get example payloads for testing
 */
router.get("/examples", (req: Request, res: Response) => {
  res.json({
    message: "FCM API Examples",
    examples: {
      sendNotification: {
        endpoint: "POST /api/fcm/send",
        payload: {
          token: "your-fcm-device-token",
          id: 12345,
          type: 1,
          title: "Hello World",
          description: "This is your first notification!",
          read: false,
          issuedDate: new Date().toISOString(),
        },
      },
      topicNotification: {
        endpoint: "POST /api/fcm/topic",
        payload: {
          topic: "all-users",
          title: "Important Update",
          description: "We have some exciting news to share!",
          data: {
            updateId: "123",
            priority: "high",
          },
        },
      },
      testNotification: {
        endpoint: "POST /api/fcm/test/send",
        payload: {
          token: "your-fcm-device-token",
        },
      },
      testTopicNotification: {
        endpoint: "POST /api/fcm/test/topic",
        payload: {
          topic: "test-topic",
        },
      },
    },
    curlExamples: {
      testEndpoint: `curl -X GET http://localhost:3000/api/fcm/test`,
      sendNotification: `curl -X POST http://localhost:3000/api/fcm/send \\
  -H "Content-Type: application/json" \\
  -d '{
    "token": "your-fcm-token",
    "id": 1,
    "type": 1,
    "title": "Test",
    "description": "Test notification",
    "read": false,
    "issuedDate": "${new Date().toISOString()}"
  }'`,
      topicNotification: `curl -X POST http://localhost:3000/api/fcm/topic \\
  -H "Content-Type: application/json" \\
  -d '{
    "topic": "all-users",
    "title": "Broadcast",
    "description": "Message for everyone"
  }'`,
    },
  });
});

export default router;
