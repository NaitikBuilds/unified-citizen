import express from "express";
import cors from "cors";
import helmet from "helmet";
import path from "path";
import grievanceRoutes from "./routes/grievance.routes.js"; // Adjust path if needed based on your structure

const app = express();

app.use(helmet());

app.use(
  cors({
    origin: "http://localhost:5173",
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

// Grievance routes
app.use("/api/grievances", grievanceRoutes);

export default app;