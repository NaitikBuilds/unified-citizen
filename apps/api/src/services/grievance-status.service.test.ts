import { describe, it, expect } from "vitest";
import { canTransitionGrievanceStatus } from "./grievance-status.service.js";

describe("canTransitionGrievanceStatus", () => {
  it("allows SUBMITTED -> AI_CLASSIFIED, ASSIGNED, IN_PROGRESS", () => {
    expect(canTransitionGrievanceStatus("SUBMITTED", "AI_CLASSIFIED")).toBe(true);
    expect(canTransitionGrievanceStatus("SUBMITTED", "ASSIGNED")).toBe(true);
    expect(canTransitionGrievanceStatus("SUBMITTED", "IN_PROGRESS")).toBe(true);
  });

  it("allows AI_CLASSIFIED -> ASSIGNED, IN_PROGRESS, REJECTED", () => {
    expect(canTransitionGrievanceStatus("AI_CLASSIFIED", "ASSIGNED")).toBe(true);
    expect(canTransitionGrievanceStatus("AI_CLASSIFIED", "IN_PROGRESS")).toBe(true);
    expect(canTransitionGrievanceStatus("AI_CLASSIFIED", "REJECTED")).toBe(true);
  });

  it("allows ASSIGNED -> IN_PROGRESS, REJECTED", () => {
    expect(canTransitionGrievanceStatus("ASSIGNED", "IN_PROGRESS")).toBe(true);
    expect(canTransitionGrievanceStatus("ASSIGNED", "REJECTED")).toBe(true);
  });

  it("allows IN_PROGRESS -> RESOLVED, REJECTED, ESCALATED", () => {
    expect(canTransitionGrievanceStatus("IN_PROGRESS", "RESOLVED")).toBe(true);
    expect(canTransitionGrievanceStatus("IN_PROGRESS", "REJECTED")).toBe(true);
    expect(canTransitionGrievanceStatus("IN_PROGRESS", "ESCALATED")).toBe(true);
  });

  it("allows ESCALATED -> IN_PROGRESS, RESOLVED", () => {
    expect(canTransitionGrievanceStatus("ESCALATED", "IN_PROGRESS")).toBe(true);
    expect(canTransitionGrievanceStatus("ESCALATED", "RESOLVED")).toBe(true);
  });

  it("allows RESOLVED -> REOPENED only", () => {
    expect(canTransitionGrievanceStatus("RESOLVED", "REOPENED")).toBe(true);
    expect(canTransitionGrievanceStatus("RESOLVED", "IN_PROGRESS")).toBe(false);
    expect(canTransitionGrievanceStatus("RESOLVED", "SUBMITTED")).toBe(false);
  });

  it("treats REJECTED as terminal", () => {
    for (const next of [
      "SUBMITTED",
      "AI_CLASSIFIED",
      "ASSIGNED",
      "IN_PROGRESS",
      "ESCALATED",
      "RESOLVED",
      "REJECTED",
      "REOPENED",
    ]) {
      expect(canTransitionGrievanceStatus("REJECTED", next as any)).toBe(false);
    }
  });

  it("allows REOPENED -> IN_PROGRESS", () => {
    expect(canTransitionGrievanceStatus("REOPENED", "IN_PROGRESS")).toBe(true);
    expect(canTransitionGrievanceStatus("REOPENED", "RESOLVED")).toBe(false);
  });

  it("rejects skips and impossible jumps", () => {
    expect(canTransitionGrievanceStatus("SUBMITTED", "RESOLVED")).toBe(false);
    expect(canTransitionGrievanceStatus("SUBMITTED", "ESCALATED")).toBe(false);
    expect(canTransitionGrievanceStatus("ASSIGNED", "RESOLVED")).toBe(false);
    expect(canTransitionGrievanceStatus("IN_PROGRESS", "ASSIGNED")).toBe(false);
  });

  it("rejects unknown statuses", () => {
    expect(canTransitionGrievanceStatus("NOPE" as any, "RESOLVED")).toBe(false);
    expect(canTransitionGrievanceStatus("IN_PROGRESS", "NOPE" as any)).toBe(false);
  });
});
