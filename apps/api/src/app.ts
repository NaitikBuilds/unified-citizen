import express from "express";
import cors from "cors";
import helmet from "helmet";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import departmentRoutes from "./routes/department.routes.js";
import grievanceRoutes from "./routes/grievance.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import slaRoutes from "./routes/sla.routes.js";
import escalationRoutes from "./routes/escalation.routes.js";
import auditRoutes from "./routes/audit.routes.js";
import chatRoutes from "./routes/chat.routes.js";
import analyticsRoutes from "./routes/analytics.routes.js";
import { errorHandler } from "./middlewares/error.middleware.js";

const app = express();

app.use(helmet());

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());

// Uploaded files are NOT served statically. They are only accessible through
// the protected attachment download endpoint which enforces authentication
// and grievance-level authorization.

app.get("/api/v1/health", (_req, res) => {
  res.json({
    success: true,
    message: "Unified Citizen Governance API is running",
  });
});

// API Routes with Versioning Prefix (/api/v1)
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/departments", departmentRoutes);
app.use("/api/v1/grievances", grievanceRoutes);
app.use("/api/v1/notifications", notificationRoutes);
app.use("/api/v1/slas", slaRoutes);
app.use("/api/v1/escalations", escalationRoutes);
app.use("/api/v1/audit-logs", auditRoutes);
app.use("/api/v1/chat", chatRoutes);
app.use("/api/v1/analytics", analyticsRoutes);

// JSON 404 for unknown routes (must be registered after all routes)
app.use((_req, res) => {
  res.status(404).json({ success: false, error: "Route not found" });
});

// Centralized Error Handler (must be registered after routes)
app.use(errorHandler);

export default app;