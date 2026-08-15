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
import {
  registerSchema,
  loginSchema,
  refreshSchema,
} from "../validations/auth.validation.js";

const router = Router();

router.post("/register", validate(registerSchema), register);

router.post("/login", validate(loginSchema), login);

router.post("/refresh", validate(refreshSchema), refresh);

router.post("/logout", authenticate, logout);

router.get("/me", authenticate, getMe);

export default router;
