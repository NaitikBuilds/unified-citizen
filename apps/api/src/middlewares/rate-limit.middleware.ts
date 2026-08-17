import rateLimit from "express-rate-limit";
import { Request, Response } from "express";

// Common handler so every rate-limited endpoint returns the same JSON shape.
function rateLimitHandler(_req: Request, res: Response): void {
  res.status(429).json({
    success: false,
    error: "Too many requests. Please try again later.",
  });
}

const baseConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
};

// Public authentication endpoints are the main brute-force surface:
// - login: strictest (credential guessing)
// - register / refresh: moderate (account flooding / token abuse)
export const loginLimiter = rateLimit({
  ...baseConfig,
  limit: 10,
});

export const authLimiter = rateLimit({
  ...baseConfig,
  limit: 20,
});
