import express from "express";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import fcmRoutes from "./routes/fcm.routes.js";
import testRoutes from "./routes/test.routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

app.use(express.json());
app.use(express.static(join(__dirname, "../public")));
app.use("/api/fcm", fcmRoutes);
app.use("/api/test", testRoutes);

app.get("/", (_req, res) => {
  res.json({
    message: "FCM Notification Service Running",
    version: "1.0.0",
    endpoints: {
      main: {
        health: "GET /",
        fcmTest: "GET /api/fcm/test",
        examples: "GET /api/fcm/examples",
      },
      notifications: {
        send: "POST /api/fcm/send",
        topic: "POST /api/fcm/topic",
      },
      testing: {
        testSend: "POST /api/fcm/test/send",
        testTopic: "POST /api/fcm/test/topic",
        mockSend: "POST /api/fcm/test/mock-send",
        mockTopic: "POST /api/fcm/test/mock-topic",
        bulkSend: "POST /api/test/bulk-send",
        scheduled: "POST /api/test/scheduled-notification",
        types: "POST /api/test/notification-types",
        validateToken: "POST /api/test/validate-token",
        health: "GET /api/test/health",
      },
    },
    quickStart: {
      testInterface: "GET /test.html (Interactive test page)",
      testService: "GET /api/fcm/test",
      mockNotification: "POST /api/fcm/test/mock-send",
      examples: "GET /api/fcm/examples",
    },
  });
});

export default app;
