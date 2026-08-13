/*
  Warnings:

  - The values [UNDER_REVIEW,CLOSED] on the enum `GrievanceStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `predictedCategory` on the `AIClassification` table. All the data in the column will be lost.
  - You are about to drop the column `predictedDepartment` on the `AIClassification` table. All the data in the column will be lost.
  - You are about to drop the column `predictedPriority` on the `AIClassification` table. All the data in the column will be lost.
  - You are about to drop the column `entity` on the `AuditLog` table. All the data in the column will be lost.
  - You are about to drop the column `entityId` on the `AuditLog` table. All the data in the column will be lost.
  - You are about to drop the column `authorId` on the `Comment` table. All the data in the column will be lost.
  - You are about to drop the column `content` on the `Comment` table. All the data in the column will be lost.
  - Added the required column `message` to the `Comment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Comment` table without a default value. This is not possible if the table is not empty.
  - Made the column `code` on table `Department` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "GrievanceStatus_new" AS ENUM ('SUBMITTED', 'AI_CLASSIFIED', 'ASSIGNED', 'IN_PROGRESS', 'ESCALATED', 'RESOLVED', 'REJECTED', 'REOPENED');
ALTER TABLE "public"."Grievance" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Grievance" ALTER COLUMN "status" TYPE "GrievanceStatus_new" USING ("status"::text::"GrievanceStatus_new");
ALTER TYPE "GrievanceStatus" RENAME TO "GrievanceStatus_old";
ALTER TYPE "GrievanceStatus_new" RENAME TO "GrievanceStatus";
DROP TYPE "public"."GrievanceStatus_old";
ALTER TABLE "Grievance" ALTER COLUMN "status" SET DEFAULT 'SUBMITTED';
COMMIT;

-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_authorId_fkey";

-- DropIndex
DROP INDEX "AuditLog_entityId_idx";

-- DropIndex
DROP INDEX "AuditLog_entity_idx";

-- DropIndex
DROP INDEX "Comment_authorId_idx";

-- AlterTable
ALTER TABLE "AIClassification" DROP COLUMN "predictedCategory",
DROP COLUMN "predictedDepartment",
DROP COLUMN "predictedPriority",
ADD COLUMN     "category" TEXT,
ADD COLUMN     "department" TEXT,
ADD COLUMN     "duplicateScore" DOUBLE PRECISION,
ADD COLUMN     "priority" "GrievancePriority",
ADD COLUMN     "sentiment" TEXT,
ADD COLUMN     "summary" TEXT;

-- AlterTable
ALTER TABLE "AuditLog" DROP COLUMN "entity",
DROP COLUMN "entityId",
ADD COLUMN     "grievanceId" TEXT,
ADD COLUMN     "newValue" JSONB,
ADD COLUMN     "oldValue" JSONB;

-- AlterTable
ALTER TABLE "Comment" DROP COLUMN "authorId",
DROP COLUMN "content",
ADD COLUMN     "message" TEXT NOT NULL,
ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Department" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ALTER COLUMN "code" SET NOT NULL;

-- AlterTable
ALTER TABLE "Escalation" ADD COLUMN     "escalatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Grievance" ADD COLUMN     "address" TEXT;

-- CreateIndex
CREATE INDEX "AIClassification_category_idx" ON "AIClassification"("category");

-- CreateIndex
CREATE INDEX "AIClassification_department_idx" ON "AIClassification"("department");

-- CreateIndex
CREATE INDEX "AIClassification_priority_idx" ON "AIClassification"("priority");

-- CreateIndex
CREATE INDEX "AuditLog_grievanceId_idx" ON "AuditLog"("grievanceId");

-- CreateIndex
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");

-- CreateIndex
CREATE INDEX "Comment_userId_idx" ON "Comment"("userId");

-- CreateIndex
CREATE INDEX "Department_isActive_idx" ON "Department"("isActive");

-- CreateIndex
CREATE INDEX "Escalation_escalatedAt_idx" ON "Escalation"("escalatedAt");

-- CreateIndex
CREATE INDEX "Grievance_category_idx" ON "Grievance"("category");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_grievanceId_fkey" FOREIGN KEY ("grievanceId") REFERENCES "Grievance"("id") ON DELETE SET NULL ON UPDATE CASCADE;
