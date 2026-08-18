import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../apps/api/src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  console.log("🌱 Starting database seed...\n");

  // ============================================================
  // 1. PASSWORDS
  // ============================================================

  const adminPassword = await bcrypt.hash("Admin@12345", 12);
  const officerPassword = await bcrypt.hash("Officer@12345", 12);
  const citizenPassword = await bcrypt.hash("Citizen@12345", 12);

  // ============================================================
  // 2. DEPARTMENTS
  // ============================================================

  console.log("Creating departments...");

  const departmentData = [
    {
      name: "Public Works Department",
      code: "PWD",
      description: "Roads, infrastructure, streetlights and public works.",
    },
    {
      name: "Water Department",
      code: "WATER",
      description: "Water supply, pipelines and water-related complaints.",
    },
    {
      name: "Electricity Department",
      code: "ELECTRICITY",
      description: "Electricity supply, outages and electrical infrastructure.",
    },
    {
      name: "Sanitation Department",
      code: "SANITATION",
      description: "Waste management, cleanliness and sanitation services.",
    },
    {
      name: "Health Department",
      code: "HEALTH",
      description: "Public health services and health-related complaints.",
    },
    {
      name: "Education Department",
      code: "EDUCATION",
      description: "Government schools and education services.",
    },
    {
      name: "Police Department",
      code: "POLICE",
      description: "Law enforcement and public safety.",
    },
    {
      name: "Transport Department",
      code: "TRANSPORT",
      description: "Public transportation and traffic-related services.",
    },
    {
      name: "Municipal Services",
      code: "MUNICIPAL",
      description: "General municipal services and civic administration.",
    },
    {
      name: "Other Department",
      code: "OTHER",
      description: "General complaints and uncategorized grievances. Catch-all for AI classification fallback.",
    },
  ];

  const departments: Record<string, any> = {};

  for (const department of departmentData) {
    departments[department.code] = await prisma.department.upsert({
      where: {
        code: department.code,
      },
      update: {
        name: department.name,
        description: department.description,
        isActive: true,
      },
      create: {
        name: department.name,
        code: department.code,
        description: department.description,
        isActive: true,
      },
    });
  }

  console.log(`✓ Created ${departmentData.length} departments\n`);

  // ============================================================
  // 3. SUPER ADMIN
  // ============================================================

  console.log("Creating super admin...");

  const superAdmin = await prisma.user.upsert({
    where: {
      email: "admin@unifiedcitizen.gov.in",
    },
    update: {
      name: "System Administrator",
      role: "SUPER_ADMIN",
      passwordHash: adminPassword,
    },
    create: {
      name: "System Administrator",
      email: "admin@unifiedcitizen.gov.in",
      passwordHash: adminPassword,
      role: "SUPER_ADMIN",
    },
  });

  console.log(`✓ Super admin: ${superAdmin.email}\n`);

  // ============================================================
  // 4. DEPARTMENT ADMINS
  // ============================================================

  console.log("Creating department administrators...");

  const pwdAdmin = await prisma.user.upsert({
    where: {
      email: "admin.pwd@unifiedcitizen.gov.in",
    },
    update: {
      name: "PWD Department Admin",
      role: "DEPARTMENT_ADMIN",
      departmentId: departments.PWD.id,
      passwordHash: adminPassword,
    },
    create: {
      name: "PWD Department Admin",
      email: "admin.pwd@unifiedcitizen.gov.in",
      passwordHash: adminPassword,
      role: "DEPARTMENT_ADMIN",
      departmentId: departments.PWD.id,
    },
  });

  const waterAdmin = await prisma.user.upsert({
    where: {
      email: "admin.water@unifiedcitizen.gov.in",
    },
    update: {
      name: "Water Department Admin",
      role: "DEPARTMENT_ADMIN",
      departmentId: departments.WATER.id,
      passwordHash: adminPassword,
    },
    create: {
      name: "Water Department Admin",
      email: "admin.water@unifiedcitizen.gov.in",
      passwordHash: adminPassword,
      role: "DEPARTMENT_ADMIN",
      departmentId: departments.WATER.id,
    },
  });

  console.log("✓ Created department administrators\n");

  // ============================================================
  // 5. OFFICERS
  // ============================================================

  console.log("Creating officers...");

  const pwdOfficer = await prisma.user.upsert({
    where: {
      email: "officer.pwd@unifiedcitizen.gov.in",
    },
    update: {
      name: "PWD Officer",
      role: "OFFICER",
      departmentId: departments.PWD.id,
      passwordHash: officerPassword,
    },
    create: {
      name: "PWD Officer",
      email: "officer.pwd@unifiedcitizen.gov.in",
      passwordHash: officerPassword,
      role: "OFFICER",
      departmentId: departments.PWD.id,
    },
  });

  const waterOfficer = await prisma.user.upsert({
    where: {
      email: "officer.water@unifiedcitizen.gov.in",
    },
    update: {
      name: "Water Officer",
      role: "OFFICER",
      departmentId: departments.WATER.id,
      passwordHash: officerPassword,
    },
    create: {
      name: "Water Officer",
      email: "officer.water@unifiedcitizen.gov.in",
      passwordHash: officerPassword,
      role: "OFFICER",
      departmentId: departments.WATER.id,
    },
  });

  const electricityOfficer = await prisma.user.upsert({
    where: {
      email: "officer.electricity@unifiedcitizen.gov.in",
    },
    update: {
      name: "Electricity Officer",
      role: "OFFICER",
      departmentId: departments.ELECTRICITY.id,
      passwordHash: officerPassword,
    },
    create: {
      name: "Electricity Officer",
      email: "officer.electricity@unifiedcitizen.gov.in",
      passwordHash: officerPassword,
      role: "OFFICER",
      departmentId: departments.ELECTRICITY.id,
    },
  });

  console.log("✓ Created officers\n");

  // ============================================================
  // 6. CITIZENS
  // ============================================================

  console.log("Creating citizens...");

  const citizen1 = await prisma.user.upsert({
    where: {
      email: "citizen1@example.com",
    },
    update: {
      name: "Rahul Sharma",
      passwordHash: citizenPassword,
      role: "CITIZEN",
    },
    create: {
      name: "Rahul Sharma",
      email: "citizen1@example.com",
      passwordHash: citizenPassword,
      role: "CITIZEN",
      phone: "9876543210",
    },
  });

  const citizen2 = await prisma.user.upsert({
    where: {
      email: "citizen2@example.com",
    },
    update: {
      name: "Priya Verma",
      passwordHash: citizenPassword,
      role: "CITIZEN",
    },
    create: {
      name: "Priya Verma",
      email: "citizen2@example.com",
      passwordHash: citizenPassword,
      role: "CITIZEN",
      phone: "9876543211",
    },
  });

  const citizen3 = await prisma.user.upsert({
    where: {
      email: "citizen3@example.com",
    },
    update: {
      name: "Amit Singh",
      passwordHash: citizenPassword,
      role: "CITIZEN",
    },
    create: {
      name: "Amit Singh",
      email: "citizen3@example.com",
      passwordHash: citizenPassword,
      role: "CITIZEN",
      phone: "9876543212",
    },
  });

  console.log("✓ Created citizens\n");

  // ============================================================
  // 7. SLA POLICIES
  // ============================================================

  console.log("Creating SLA policies...");

  const pwdSlaPolicy = await prisma.sLAPolicy.create({
    data: {
      name: "PWD Standard SLA",
      description: "Standard SLA for public works complaints.",
      departmentId: departments.PWD.id,
      responseTimeHours: 24,
      resolutionTimeHours: 72,
      isActive: true,
    },
  });

  const waterSlaPolicy = await prisma.sLAPolicy.create({
    data: {
      name: "Water Standard SLA",
      description: "Standard SLA for water complaints.",
      departmentId: departments.WATER.id,
      responseTimeHours: 12,
      resolutionTimeHours: 48,
      isActive: true,
    },
  });

  const electricitySlaPolicy = await prisma.sLAPolicy.create({
    data: {
      name: "Electricity Emergency SLA",
      description: "Fast SLA for electricity complaints.",
      departmentId: departments.ELECTRICITY.id,
      priority: "HIGH",
      responseTimeHours: 4,
      resolutionTimeHours: 24,
      isActive: true,
    },
  });

  console.log("✓ Created SLA policies\n");

  // ============================================================
  // 8. SAMPLE GRIEVANCE #1
  // ============================================================

  console.log("Creating sample grievances...");

  const grievance1 = await prisma.grievance.upsert({
    where: {
      ticketId: "GRV-2026-000001",
    },
    update: {},
    create: {
      ticketId: "GRV-2026-000001",
      citizenId: citizen1.id,

      title: "Large pothole on main road",

      description:
        "There is a large pothole near the main market road which is causing problems for vehicles and pedestrians.",

      category: "Roads",
      subcategory: "Pothole",

      priority: "HIGH",
      status: "ASSIGNED",

      departmentId: departments.PWD.id,

      location: "Kanpur",
      address: "Main Market Road",
      latitude: 26.4499,
      longitude: 80.3319,
    },
  });

  // ============================================================
  // 9. SAMPLE GRIEVANCE #2
  // ============================================================

  const grievance2 = await prisma.grievance.upsert({
    where: {
      ticketId: "GRV-2026-000002",
    },
    update: {},
    create: {
      ticketId: "GRV-2026-000002",
      citizenId: citizen2.id,

      title: "Water supply interruption",

      description:
        "There has been no water supply in our locality since yesterday morning.",

      category: "Water Supply",
      subcategory: "Supply Interruption",

      priority: "CRITICAL",
      status: "AI_CLASSIFIED",

      departmentId: departments.WATER.id,

      location: "Kanpur",
      address: "Civil Lines",
      latitude: 26.4725,
      longitude: 80.3311,
    },
  });

  // ============================================================
  // 10. SAMPLE GRIEVANCE #3
  // ============================================================

  const grievance3 = await prisma.grievance.upsert({
    where: {
      ticketId: "GRV-2026-000003",
    },
    update: {},
    create: {
      ticketId: "GRV-2026-000003",
      citizenId: citizen3.id,

      title: "Streetlight not working",

      description:
        "The streetlight outside our residential area has not been working for several days.",

      category: "Electricity",
      subcategory: "Streetlight",

      priority: "MEDIUM",
      status: "IN_PROGRESS",

      departmentId: departments.ELECTRICITY.id,

      location: "Kanpur",
      address: "Shastri Nagar",
      latitude: 26.477,
      longitude: 80.318,
    },
  });

  console.log("✓ Created sample grievances\n");

  // ============================================================
  // 11. AI CLASSIFICATIONS
  // ============================================================

  console.log("Creating AI classifications...");

  await prisma.aIClassification.upsert({
    where: {
      grievanceId: grievance1.id,
    },
    update: {
      category: "Roads",
      department: "PWD",
      priority: "HIGH",
      confidence: 0.96,
      summary: "Citizen reports a dangerous pothole on a major road.",
      duplicateScore: 0.12,
      sentiment: "NEGATIVE",
      modelName: "governance-classifier",
      modelVersion: "1.0",
      explanation:
        "The complaint contains road infrastructure and pothole-related keywords.",
    },
    create: {
      grievanceId: grievance1.id,
      category: "Roads",
      department: "PWD",
      priority: "HIGH",
      confidence: 0.96,
      summary: "Citizen reports a dangerous pothole on a major road.",
      duplicateScore: 0.12,
      sentiment: "NEGATIVE",
      modelName: "governance-classifier",
      modelVersion: "1.0",
      explanation:
        "The complaint contains road infrastructure and pothole-related keywords.",
    },
  });

  await prisma.aIClassification.upsert({
    where: {
      grievanceId: grievance2.id,
    },
    update: {
      category: "Water Supply",
      department: "WATER",
      priority: "CRITICAL",
      confidence: 0.98,
      summary: "Citizen reports a complete water supply interruption.",
      duplicateScore: 0.08,
      sentiment: "NEGATIVE",
      modelName: "governance-classifier",
      modelVersion: "1.0",
    },
    create: {
      grievanceId: grievance2.id,
      category: "Water Supply",
      department: "WATER",
      priority: "CRITICAL",
      confidence: 0.98,
      summary: "Citizen reports a complete water supply interruption.",
      duplicateScore: 0.08,
      sentiment: "NEGATIVE",
      modelName: "governance-classifier",
      modelVersion: "1.0",
    },
  });

  await prisma.aIClassification.upsert({
    where: {
      grievanceId: grievance3.id,
    },
    update: {
      category: "Electricity",
      department: "ELECTRICITY",
      priority: "MEDIUM",
      confidence: 0.94,
      summary: "Streetlight failure reported by citizen.",
      duplicateScore: 0.18,
      sentiment: "NEUTRAL",
      modelName: "governance-classifier",
      modelVersion: "1.0",
    },
    create: {
      grievanceId: grievance3.id,
      category: "Electricity",
      department: "ELECTRICITY",
      priority: "MEDIUM",
      confidence: 0.94,
      summary: "Streetlight failure reported by citizen.",
      duplicateScore: 0.18,
      sentiment: "NEUTRAL",
      modelName: "governance-classifier",
      modelVersion: "1.0",
    },
  });

  console.log("✓ Created AI classifications\n");

  // ============================================================
  // 12. ASSIGNMENTS
  // ============================================================

  console.log("Creating assignments...");

  await prisma.assignment.create({
    data: {
      grievanceId: grievance1.id,
      officerId: pwdOfficer.id,
      departmentId: departments.PWD.id,
      assignedById: pwdAdmin.id,
      type: "AI_RECOMMENDED",
      status: "ACTIVE",
      reason: "AI recommended PWD based on grievance classification.",
    },
  });

  await prisma.assignment.create({
    data: {
      grievanceId: grievance2.id,
      officerId: waterOfficer.id,
      departmentId: departments.WATER.id,
      assignedById: waterAdmin.id,
      type: "MANUAL",
      status: "ACTIVE",
      reason: "Assigned to water department officer.",
    },
  });

  await prisma.assignment.create({
    data: {
      grievanceId: grievance3.id,
      officerId: electricityOfficer.id,
      departmentId: departments.ELECTRICITY.id,
      assignedById: superAdmin.id,
      type: "MANUAL",
      status: "ACTIVE",
      reason: "Assigned to electricity department officer.",
    },
  });

  console.log("✓ Created assignments\n");

  // ============================================================
  // 13. SLA INSTANCES
  // ============================================================

  console.log("Creating SLA instances...");

  const now = new Date();

  await prisma.sLA.upsert({
    where: {
      grievanceId: grievance1.id,
    },
    update: {},
    create: {
      grievanceId: grievance1.id,
      policyId: pwdSlaPolicy.id,
      departmentId: departments.PWD.id,

      responseTimeHours: 24,
      resolutionTimeHours: 72,

      responseDueAt: new Date(now.getTime() + 24 * 60 * 60 * 1000),
      resolutionDueAt: new Date(now.getTime() + 72 * 60 * 60 * 1000),

      status: "ACTIVE",
    },
  });

  await prisma.sLA.upsert({
    where: {
      grievanceId: grievance2.id,
    },
    update: {},
    create: {
      grievanceId: grievance2.id,
      policyId: waterSlaPolicy.id,
      departmentId: departments.WATER.id,

      responseTimeHours: 12,
      resolutionTimeHours: 48,

      responseDueAt: new Date(now.getTime() + 12 * 60 * 60 * 1000),
      resolutionDueAt: new Date(now.getTime() + 48 * 60 * 60 * 1000),

      status: "WARNING",
    },
  });

  await prisma.sLA.upsert({
    where: {
      grievanceId: grievance3.id,
    },
    update: {},
    create: {
      grievanceId: grievance3.id,
      policyId: electricitySlaPolicy.id,
      departmentId: departments.ELECTRICITY.id,

      responseTimeHours: 4,
      resolutionTimeHours: 24,

      responseDueAt: new Date(now.getTime() + 4 * 60 * 60 * 1000),
      resolutionDueAt: new Date(now.getTime() + 24 * 60 * 60 * 1000),

      status: "ACTIVE",
    },
  });

  console.log("✓ Created SLA records\n");

  // ============================================================
  // 14. COMMENTS
  // ============================================================

  console.log("Creating comments...");

  await prisma.comment.create({
    data: {
      grievanceId: grievance1.id,
      userId: pwdOfficer.id,
      message:
        "The complaint has been reviewed. A field inspection has been scheduled.",
      isInternal: true,
    },
  });

  await prisma.comment.create({
    data: {
      grievanceId: grievance2.id,
      userId: waterOfficer.id,
      message:
        "The issue has been forwarded to the water supply maintenance team.",
      isInternal: false,
    },
  });

  console.log("✓ Created comments\n");

  // ============================================================
  // 15. NOTIFICATIONS
  // ============================================================

  console.log("Creating notifications...");

  await prisma.notification.create({
    data: {
      userId: citizen1.id,
      grievanceId: grievance1.id,
      type: "ASSIGNMENT_CHANGED",
      title: "Grievance Assigned",
      message:
        "Your grievance GRV-2026-000001 has been assigned to the PWD department.",
    },
  });

  await prisma.notification.create({
    data: {
      userId: citizen2.id,
      grievanceId: grievance2.id,
      type: "STATUS_CHANGED",
      title: "Grievance Classified",
      message:
        "Your grievance GRV-2026-000002 has been classified and forwarded to the Water Department.",
    },
  });

  await prisma.notification.create({
    data: {
      userId: pwdOfficer.id,
      grievanceId: grievance1.id,
      type: "GRIEVANCE_CREATED",
      title: "New Grievance Assigned",
      message:
        "You have been assigned grievance GRV-2026-000001.",
    },
  });

  console.log("✓ Created notifications\n");

  // ============================================================
  // 16. AUDIT LOGS
  // ============================================================

  console.log("Creating audit logs...");

  await prisma.auditLog.create({
    data: {
      userId: citizen1.id,
      grievanceId: grievance1.id,
      action: "GRIEVANCE_CREATED",
      newValue: {
        status: "SUBMITTED",
      },
      metadata: {
        source: "seed",
      },
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: pwdAdmin.id,
      grievanceId: grievance1.id,
      action: "GRIEVANCE_ASSIGNED",
      oldValue: {
        status: "AI_CLASSIFIED",
      },
      newValue: {
        status: "ASSIGNED",
        officerId: pwdOfficer.id,
      },
      metadata: {
        assignmentType: "AI_RECOMMENDED",
      },
    },
  });

  console.log("✓ Created audit logs\n");

  // ============================================================
  // 17. FEEDBACK
  // ============================================================

  console.log("Creating feedback...");

  await prisma.feedback.create({
    data: {
      grievanceId: grievance1.id,
      userId: citizen1.id,
      rating: 5,
      comment: "The complaint was handled quickly and professionally.",
    },
  });

  console.log("✓ Created feedback\n");

  // ============================================================
  // 18. ESCALATION
  // ============================================================

  console.log("Creating escalation...");

  await prisma.escalation.create({
    data: {
      grievanceId: grievance2.id,
      level: "LEVEL_1",
      status: "OPEN",
      reason:
        "Critical water supply complaint requires immediate attention.",
      createdById: waterAdmin.id,
    },
  });

  console.log("✓ Created escalation\n");

  // ============================================================
  // COMPLETE
  // ============================================================

  console.log("========================================");
  console.log("🎉 Database seed completed successfully!");
  console.log("========================================\n");

  console.log("Test accounts:");
  console.log("----------------------------------------");
  console.log("SUPER ADMIN");
  console.log("Email: admin@unifiedcitizen.gov.in");
  console.log("Password: Admin@12345\n");

  console.log("PWD ADMIN");
  console.log("Email: admin.pwd@unifiedcitizen.gov.in");
  console.log("Password: Admin@12345\n");

  console.log("PWD OFFICER");
  console.log("Email: officer.pwd@unifiedcitizen.gov.in");
  console.log("Password: Officer@12345\n");

  console.log("CITIZEN");
  console.log("Email: citizen1@example.com");
  console.log("Password: Citizen@12345");
  console.log("----------------------------------------");
}

main()
  .catch((error) => {
    console.error("❌ Seed failed:");
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });