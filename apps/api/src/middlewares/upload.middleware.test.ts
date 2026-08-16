import { describe, it, expect, afterAll } from "vitest";
import fs from "fs";
import os from "os";
import path from "path";
import { validateFileSignature } from "./upload.middleware.js";

describe("validateFileSignature", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "sig-test-"));

  afterAll(() => {
    fs.rmSync(dir, { recursive: true, force: true });
  });

  it("accepts a file with a real PDF signature", async () => {
    const p = path.join(dir, "a.pdf");
    fs.writeFileSync(p, "%PDF-1.4 fake pdf content");
    expect(await validateFileSignature(p, "application/pdf")).toBe(true);
  });

  it("rejects a text file disguised as PDF", async () => {
    const p = path.join(dir, "b.pdf");
    fs.writeFileSync(p, "this is definitely not a pdf");
    expect(await validateFileSignature(p, "application/pdf")).toBe(false);
  });

  it("accepts a real JPEG signature", async () => {
    const p = path.join(dir, "c.jpg");
    fs.writeFileSync(p, Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]));
    expect(await validateFileSignature(p, "image/jpeg")).toBe(true);
  });

  it("rejects an unknown MIME type", async () => {
    const p = path.join(dir, "d.txt");
    fs.writeFileSync(p, "hello");
    expect(await validateFileSignature(p, "text/plain")).toBe(false);
  });
});
