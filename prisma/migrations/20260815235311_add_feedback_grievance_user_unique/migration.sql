/*
  Warnings:

  - A unique constraint covering the columns `[grievanceId,userId]` on the table `Feedback` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Feedback_grievanceId_userId_key" ON "Feedback"("grievanceId", "userId");
