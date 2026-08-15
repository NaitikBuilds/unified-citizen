import express from "express";
import cors from "cors";
import helmet from "helmet";
import path from "path";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import departmentRoutes from "./routes/department.routes.js";
import grievanceRoutes from "./routes/grievance.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import { errorHandler } from "./middlewares/error.middleware.js";

const app = express();

app.use(helmet());

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

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

// Centralized Error Handler (must be registered after routes)
app.use(errorHandler);

export default app;