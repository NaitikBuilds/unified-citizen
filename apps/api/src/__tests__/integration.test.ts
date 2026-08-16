import request from "supertest";
import app from "../app.js";
import { prisma } from "../services/prisma.service.js";

describe("Unified Citizen Governance API Integration Tests", () => {
  let citizenToken = "";
  let grievanceId = "";

  afterAll(async () => {
    await prisma.$disconnect();
  });

  test("1. Health Check Route", async () => {
    const res = await request(app).get("/api/v1/health");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test("2. Auth Flow: Register & Login Citizen", async () => {
    const uniqueEmail = `citizen_${Date.now()}@test.com`;

    const regRes = await request(app).post("/api/v1/auth/register").send({
      name: "Test Citizen",
      email: uniqueEmail,
      password: "Password123!",
      role: "CITIZEN",
    });

    expect(regRes.status).toBe(201);

    const loginRes = await request(app).post("/api/v1/auth/login").send({
      email: uniqueEmail,
      password: "Password123!",
    });

    expect(loginRes.status).toBe(200);
    expect(loginRes.body.token || loginRes.body.accessToken).toBeDefined();

    citizenToken = loginRes.body.token || loginRes.body.accessToken;
  });

  test("3. Grievance CRUD: Create Grievance as Citizen", async () => {
    const dept = await prisma.department.findFirst();
    if (!dept) {
      console.warn("Skipping grievance creation test: No department seeded in database.");
      return;
    }

    const res = await request(app)
      .post("/api/v1/grievances")
      .set("Authorization", `Bearer ${citizenToken}`)
      .send({
        title: "Pothole on Main Street",
        description: "Large pothole causing traffic issues.",
        category: "INFRASTRUCTURE",
        departmentId: dept.id,
        priority: "MEDIUM",
      });

    expect(res.status).toBe(201);
    expect(res.body.grievance).toBeDefined();
    grievanceId = res.body.grievance.id;
  });

  test("4. RBAC Check: Citizen cannot update grievance status", async () => {
    if (!grievanceId) return;

    const res = await request(app)
      .patch(`/api/v1/grievances/${grievanceId}/status`)
      .set("Authorization", `Bearer ${citizenToken}`)
      .send({
        status: "RESOLVED",
        comment: "Trying to force status update as citizen",
      });

    expect(res.status).toBe(403);
  });
});