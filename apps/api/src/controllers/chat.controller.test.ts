import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../ai/services/chatbot.service.js", () => ({
  chatWithCitizen: vi.fn(),
}));

import { chatWithCitizen } from "../ai/services/chatbot.service.js";
import { chat } from "./chat.controller.js";

function mockRes() {
  const res: any = {
    statusCode: 0,
    body: null,
    status(code: number) {
      res.statusCode = code;
      return res;
    },
    json(payload: any) {
      res.statusCode = res.statusCode || 200;
      res.body = payload;
      return res;
    },
  };
  return res;
}

describe("Chat Controller (POST /api/v1/chat)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 Unauthorized if user is not authenticated", async () => {
    const res = mockRes();
    await chat(
      {
        user: undefined,
        body: { message: "How do I check my grievance?" },
      } as any,
      res,
      () => {},
    );

    expect(res.statusCode).toBe(401);
    expect(res.body.error).toBe("Unauthorized");
  });

  it("returns 200 with assistant response message", async () => {
    (chatWithCitizen as any).mockResolvedValue(
      "You can track your grievance in the My Grievances portal.",
    );

    const res = mockRes();
    await chat(
      {
        user: { userId: "citizen-123", role: "CITIZEN" },
        body: { message: "How do I check my grievance?" },
      } as any,
      res,
      () => {},
    );

    expect(res.statusCode).toBe(200);
    expect(chatWithCitizen).toHaveBeenCalledWith(
      "citizen-123",
      "How do I check my grievance?",
    );
    expect(res.body).toEqual({
      message: "You can track your grievance in the My Grievances portal.",
    });
  });
});
