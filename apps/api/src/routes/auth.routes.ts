import { Router } from "express";
import {
  register,
  login,
  refresh,
  logout,
  getMe,
} from "../controllers/auth.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { loginLimiter, authLimiter } from "../middlewares/rate-limit.middleware.js";
import {
  registerSchema,
  loginSchema,
  refreshSchema,
  logoutSchema,
} from "../validations/auth.validation.js";

const router = Router();

router.post("/register", authLimiter, validate(registerSchema), register);

router.post("/login", loginLimiter, validate(loginSchema), login);

router.post("/refresh", authLimiter, validate(refreshSchema), refresh);

router.post("/logout", authenticate, validate(logoutSchema), logout);

router.get("/me", authenticate, getMe);

export default router;
