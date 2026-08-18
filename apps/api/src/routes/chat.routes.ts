import { Router } from "express";
import { chat } from "../controllers/chat.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(authenticate);

router.post("/", chat);

export default router;
