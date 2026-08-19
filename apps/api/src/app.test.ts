import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "./app.js";

describe("App-level API behavior", () => {
  it("GET /api/v1/health returns 200", async () => {
    const res = await request(app).get("/api/v1/health");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("returns JSON 404 for unknown routes", async () => {
    const res = await request(app).get("/api/v1/does-not-exist");
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe("Route not found");
  });

  it("rate limits repeated login attempts", async () => {
    let lastStatus = 0;
    // loginLimiter allows 10 requests per window; the 11th must be limited.
    for (let i = 0; i < 11; i += 1) {
      // Empty body fails Zod validation (400) before reaching the controller,
      // so no database access occurs.
      const res = await request(app).post("/api/v1/auth/login").send({});
      lastStatus = res.status;
    }
    expect(lastStatus).toBe(429);
  });
});
