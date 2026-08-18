import { Router } from "express";
import { chat } from "../controllers/chat.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { chatLimiter } from "../middlewares/rate-limit.middleware.js";
import { chatMessageSchema } from "../validations/chat.validation.js";

const router = Router();

router.use(authenticate);

router.post("/", chatLimiter, validate(chatMessageSchema), chat);

export default router;
