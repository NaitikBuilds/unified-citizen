import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import path from "path";
import fs from "fs";

vi.mock("../middlewares/upload.middleware.js", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("../middlewares/upload.middleware.js")>();
  return { ...actual, validateFileSignature: vi.fn() };
});

vi.mock("../services/subresource.service.js", () => ({
  addCommentToGrievance: vi.fn(),
  addAttachmentToGrievance: vi.fn(),
  submitGrievanceFeedback: vi.fn(),
}));

vi.mock("../services/prisma.service.js", () => ({
  prisma: {
    grievance: { findUnique: vi.fn() },
    comment: { findMany: vi.fn(), count: vi.fn() },
    attachment: { findMany: vi.fn() },
    assignment: { findFirst: vi.fn() },
    notification: { create: vi.fn() },
    $transaction: vi.fn(),
  },
}));

import { validateFileSignature } from "../middlewares/upload.middleware.js";
import { addAttachmentToGrievance } from "../services/subresource.service.js";
import { uploadGrievanceAttachment } from "./grievance.controller.js";

const uploadsDir = path.join(process.cwd(), "uploads");
const createdFiles: string[] = [];

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

// Writes a real file into the (gitignored) uploads dir and returns a multer-like
// req.file object pointing at it.
function makeUploadedFile(filename: string, content = "%PDF-1.4 test") {
  const p = path.join(uploadsDir, filename);
  fs.mkdirSync(uploadsDir, { recursive: true });
  fs.writeFileSync(p, content);
  createdFiles.push(p);
  return {
    path: p,
    filename,
    originalname: "doc.pdf",
    mimetype: "application/pdf",
  };
}

const staffUser = {
  userId: "officer-1",
  role: "OFFICER",
  departmentId: "dept-1",
  email: "officer1@example.com",
};

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  for (const p of createdFiles) {
    fs.rmSync(p, { force: true });
  }
  createdFiles.length = 0;
});

describe("uploadGrievanceAttachment — orphan file prevention", () => {
  it("deletes the file when its content does not match the declared type", async () => {
    (validateFileSignature as any).mockResolvedValue(false);

    const file = makeUploadedFile("sig-fail.pdf");
    const res = mockRes();
    await uploadGrievanceAttachment(
      { user: staffUser, params: { id: "g-1" }, file } as any,
      res,
      () => {},
    );

    expect(res.statusCode).toBe(400);
    expect(fs.existsSync(file.path)).toBe(false);
  });

  it("deletes the file when authorization fails (403)", async () => {
    (validateFileSignature as any).mockResolvedValue(true);
    (addAttachmentToGrievance as any).mockRejectedValue(
      new Error("Forbidden: You do not have access to this grievance sub-resource."),
    );

    const file = makeUploadedFile("authz-fail.pdf");
    const res = mockRes();
    await uploadGrievanceAttachment(
      { user: staffUser, params: { id: "g-1" }, file } as any,
      res,
      () => {},
    );

    expect(res.statusCode).toBe(403);
    expect(fs.existsSync(file.path)).toBe(false);
  });

  it("deletes the file when an unexpected error occurs", async () => {
    (validateFileSignature as any).mockResolvedValue(true);
    (addAttachmentToGrievance as any).mockRejectedValue(new Error("boom"));

    const file = makeUploadedFile("err-fail.pdf");
    const res = mockRes();
    const next = vi.fn();
    await uploadGrievanceAttachment(
      { user: staffUser, params: { id: "g-1" }, file } as any,
      res,
      next,
    );

    expect(next).toHaveBeenCalledWith(expect.any(Error));
    expect(fs.existsSync(file.path)).toBe(false);
  });

  it("keeps the file when the upload succeeds", async () => {
    (validateFileSignature as any).mockResolvedValue(true);
    (addAttachmentToGrievance as any).mockResolvedValue({
      id: "attachment-1",
      fileUrl: "/uploads/ok.pdf",
    });

    const file = makeUploadedFile("ok.pdf");
    const res = mockRes();
    await uploadGrievanceAttachment(
      { user: staffUser, params: { id: "g-1" }, file } as any,
      res,
      () => {},
    );

    expect(res.statusCode).toBe(201);
    expect(fs.existsSync(file.path)).toBe(true);
  });
});
