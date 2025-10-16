import { Router, Request, Response } from "express";
import { FCMService, NotificationPayload } from "../services/fcm.service.js";

const router = Router();

/**
 * @route POST /api/test/bulk-send
 * Send multiple notifications to different tokens (for load testing)
 */
router.post("/bulk-send", async (req: Request, res: Response) => {
  try {
    const {
      tokens,
      title = "Bulk Test",
      description = "Bulk notification test",
    } = req.body;

    if (!tokens || !Array.isArray(tokens) || tokens.length === 0) {
      return res.status(400).json({
        message: "Missing tokens array",
        example: {
          tokens: ["token1", "token2", "token3"],
          title: "Optional title",
          description: "Optional description",
        },
      });
    }

    const results = [];
    const errors = [];

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      const payload: NotificationPayload = {
        token,
        id: Date.now() + i,
        type: 2,
        title: `${title} (${i + 1}/${tokens.length})`,
        description: `${description} - Message ${i + 1}`,
        read: false,
        issuedDate: new Date().toISOString(),
      };

      try {
        const response = await FCMService.sendNotification(payload);
        results.push({ token, success: true, response });
      } catch (error: any) {
        errors.push({ token, success: false, error: error.message });
      }
    }

    res.json({
      message: "Bulk send completed",
      total: tokens.length,
      successful: results.length,
      failed: errors.length,
      results,
      errors,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route POST /api/test/scheduled-notification
 * Simulate a scheduled notification (with delay for testing)
 */
router.post("/scheduled-notification", async (req: Request, res: Response) => {
  try {
    const {
      token,
      delaySeconds = 5,
      title = "Scheduled Test",
      description = "This notification was delayed",
    } = req.body;

    if (!token) {
      return res.status(400).json({
        message: "Missing FCM token",
        example: {
          token: "your-fcm-token",
          delaySeconds: 5,
          title: "Optional title",
          description: "Optional description",
        },
      });
    }

    const delay = Math.max(1, Math.min(60, delaySeconds)); // Clamp between 1-60 seconds

    // Respond immediately with confirmation
    res.json({
      message: `Notification scheduled to be sent in ${delay} seconds`,
      scheduledFor: new Date(Date.now() + delay * 1000).toISOString(),
      token,
    });

    // Send the notification after delay
    setTimeout(async () => {
      try {
        const payload: NotificationPayload = {
          token,
          id: Date.now(),
          type: 3,
          title,
          description: `${description} (sent at ${new Date().toLocaleTimeString()})`,
          read: false,
          issuedDate: new Date().toISOString(),
        };

        await FCMService.sendNotification(payload);
        console.log(
          `Scheduled notification sent to ${token} after ${delay} seconds`
        );
      } catch (error) {
        console.error("Scheduled notification failed:", error);
      }
    }, delay * 1000);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route POST /api/test/notification-types
 * Test different notification types with various data payloads
 */
router.post("/notification-types", async (req: Request, res: Response) => {
  try {
    const { token, type = "info" } = req.body;

    if (!token) {
      return res.status(400).json({
        message: "Missing FCM token",
        availableTypes: ["info", "warning", "error", "success", "urgent"],
        example: {
          token: "your-fcm-token",
          type: "info",
        },
      });
    }

    const notificationTypes = {
      info: {
        title: "ℹ️ Information",
        description: "This is an informational notification",
        type: 1,
        data: { priority: "normal", category: "info" },
      },
      warning: {
        title: "⚠️ Warning",
        description: "This is a warning notification",
        type: 2,
        data: {
          priority: "high",
          category: "warning",
          action_required: "false",
        },
      },
      error: {
        title: "❌ Error",
        description: "This is an error notification",
        type: 3,
        data: { priority: "high", category: "error", action_required: "true" },
      },
      success: {
        title: "✅ Success",
        description: "Operation completed successfully!",
        type: 4,
        data: { priority: "normal", category: "success" },
      },
      urgent: {
        title: "🚨 Urgent",
        description: "This requires immediate attention!",
        type: 5,
        data: { priority: "high", category: "urgent", action_required: "true" },
      },
    };

    const selectedType =
      notificationTypes[type as keyof typeof notificationTypes];

    if (!selectedType) {
      return res.status(400).json({
        message: "Invalid notification type",
        availableTypes: Object.keys(notificationTypes),
      });
    }

    const payload: NotificationPayload = {
      token,
      id: Date.now(),
      type: selectedType.type,
      title: selectedType.title,
      description: selectedType.description,
      read: false,
      issuedDate: new Date().toISOString(),
    };

    const response = await FCMService.sendNotification(payload);

    res.json({
      message: `${type} notification sent successfully`,
      payload,
      additionalData: selectedType.data,
      response,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route GET /api/test/health
 * Health check endpoint for testing
 */
router.get("/health", (req: Request, res: Response) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: "1.0.0",
    environment: process.env.NODE_ENV || "development",
  });
});

/**
 * @route POST /api/test/validate-token
 * Validate if an FCM token format is correct (basic validation)
 */
router.post("/validate-token", (req: Request, res: Response) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({
      message: "Missing token to validate",
      example: {
        token: "your-fcm-token",
      },
    });
  }

  // Basic FCM token validation
  const isValidLength = token.length >= 140; // FCM tokens are typically 152+ characters
  const hasValidChars = /^[A-Za-z0-9_-]+$/.test(token);
  const hasColonPrefix = token.startsWith(":") || !token.includes(":");

  const validation = {
    token,
    isValid: isValidLength && hasValidChars,
    checks: {
      length: {
        valid: isValidLength,
        current: token.length,
        minimum: 140,
      },
      characters: {
        valid: hasValidChars,
        allowed: "A-Z, a-z, 0-9, _, -",
      },
      format: {
        valid: !token.includes(" "),
        note: "Should not contain spaces",
      },
    },
  };

  res.json({
    message: "Token validation complete",
    ...validation,
    note: "This is basic format validation only. Actual FCM validation requires sending a test message.",
  });
});

export default router;
