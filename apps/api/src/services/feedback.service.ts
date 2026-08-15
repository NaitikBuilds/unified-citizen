import { prisma } from './prisma.service.js';
import { createAuditLog } from './audit.service.js';

export async function submitFeedback(
  grievanceId: string,
  userId: string,
  rating: number,
  comment?: string
) {
  if (rating < 1 || rating > 5) {
    throw new Error('Rating must be between 1 and 5');
  }

  // Verify the grievance exists and belongs to this user (citizen)
  const grievance = await prisma.grievance.findUnique({
    where: { id: grievanceId },
  });

  if (!grievance) {
    throw new Error('Grievance not found');
  }

  if (grievance.citizenId !== userId) {
    throw new Error('Only the citizen who filed the grievance can submit feedback');
  }

  // Create feedback record
  const feedback = await prisma.feedback.create({
    data: {
      grievanceId,
      userId,
      rating,
      comment: comment || null,
    },
  });

  // Log audit action
  await createAuditLog({
    userId,
    grievanceId,
    action: 'FEEDBACK_SUBMITTED',
    newValue: `Rating: ${rating}`,
    metadata: { comment },
  });

  return feedback;
}