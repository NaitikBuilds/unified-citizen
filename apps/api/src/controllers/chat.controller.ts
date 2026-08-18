import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../middlewares/auth.middleware.js";
import { chatWithCitizen } from "../ai/services/chatbot.service.js";

export async function chat(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { message } = req.body;

    if (!message || typeof message !== "string") {
      res.status(400).json({
        error: "Message is required",
      });
      return;
    }

    const response = await chatWithCitizen(req.user.userId, message);

    res.status(200).json({
      message: response,
    });
  } catch (error) {
    next(error);
  }
}
