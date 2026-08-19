import { describe, it, expect, afterEach } from "vitest";
import { errorHandler } from "./error.middleware.js";
import { z } from "zod";

function createRes() {
  const res: any = { statusCode: 0, body: undefined };
  res.status = (code: number) => {
    res.statusCode = code;
    return res;
  };
  res.json = (body: any) => {
    res.body = body;
    return res;
  };
  return res;
}

describe("errorHandler", () => {
  const originalNodeEnv = process.env.NODE_ENV;

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
  });

  it("maps Zod validation errors to 400 with field errors", () => {
    const parsed = z.object({ name: z.string() }).safeParse({ name: 42 });
    const res = createRes();
    errorHandler(parsed.error, {} as any, res, (() => {}) as any);
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe("Validation failed");
    expect(res.body.errors).toHaveLength(1);
    expect(res.body.errors[0].field).toBe("name");
  });

  it("maps Prisma P2002 to 409", () => {
    const res = createRes();
    errorHandler({ code: "P2002" }, {} as any, res, (() => {}) as any);
    expect(res.statusCode).toBe(409);
  });

  it("maps Prisma P2025 to 404", () => {
    const res = createRes();
    errorHandler({ code: "P2025" }, {} as any, res, (() => {}) as any);
    expect(res.statusCode).toBe(404);
  });

  it("maps multer LIMIT_FILE_SIZE to 413", () => {
    const res = createRes();
    errorHandler({ code: "LIMIT_FILE_SIZE" }, {} as any, res, (() => {}) as any);
    expect(res.statusCode).toBe(413);
  });

  it("respects explicit statusCode on AppError", () => {
    const err: any = new Error("Forbidden");
    err.statusCode = 403;
    const res = createRes();
    errorHandler(err, {} as any, res, (() => {}) as any);
    expect(res.statusCode).toBe(403);
    expect(res.body.error).toBe("Forbidden");
  });

  it("masks internal messages and stack outside development", () => {
    process.env.NODE_ENV = "production";
    const res = createRes();
    errorHandler(
      new Error("connection string: postgresql://user:secret@db/prod"),
      {} as any,
      res,
      (() => {}) as any,
    );
    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBe("Internal server error");
    expect(res.body.stack).toBeUndefined();
  });

  it("keeps message and stack in development", () => {
    process.env.NODE_ENV = "development";
    const res = createRes();
    errorHandler(new Error("boom"), {} as any, res, (() => {}) as any);
    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBe("boom");
    expect(res.body.stack).toBeDefined();
  });
});
