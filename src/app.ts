import express from "express";
import fcmRoutes from "./routes/fcm.routes.js";

const app = express();

app.use(express.json());
app.use("/api/fcm", fcmRoutes);

app.get("/", (_req, res) => {
  res.send("🚀 FCM Notification Service Running");
});

export default app;
