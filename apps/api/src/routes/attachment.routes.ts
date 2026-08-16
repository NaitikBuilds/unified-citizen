import { Router } from "express";
import { getAttachment } from "../controllers/attachment.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = Router();

// Protected route: Only authenticated users can access
router.get("/:filename", authenticate, getAttachment);

export default router;