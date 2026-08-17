import { prisma } from "./prisma.service.js";
import { canAccessGrievanceSubResource } from "./subresource-auth.service.js";
import { createAuditLog } from "./audit.service.js";

interface UserContext {
  userId: string;
  role: string;
  departmentId: string | null;
}

// --- COMMENTS ---
export async function addCommentToGrievance(
  grievanceId: string,
  user: UserContext,
  textContent: string,
  requestedIsInternal = false,
) {
  const allowed = await canAccessGrievanceSubResource(grievanceId, user);

  if (!allowed) {
    throw new Error(
      "Forbidden: You do not have access to this grievance sub-resource.",
    );
  }

  const isInternal = user.role === "CITIZEN" ? false : requestedIsInternal;

  const comment = await prisma.comment.create({
    data: {
      grievanceId,
      userId: user.userId,
      message: textContent,
      isInternal,
    },
  });

  await createAuditLog({
    userId: user.userId,
    grievanceId,
    action: "COMMENT_ADDED",
    newValue: comment.id,
  });

  return comment;
}

// --- ATTACHMENTS ---
export async function addAttachmentToGrievance(
  grievanceId: string,
  user: UserContext,
  fileUrl: string,
  fileType: string,
  fileName?: string,
) {
  const allowed = await canAccessGrievanceSubResource(grievanceId, user);
  if (!allowed) {
    throw new Error(
      "Forbidden: You do not have access to this grievance sub-resource.",
    );
  }

  const attachment = await prisma.attachment.create({
    data: {
      grievanceId,
      uploadedById: user.userId,
      fileUrl,
      fileName: fileName || fileUrl.split("/").pop() || "attachment",
      fileType: fileType as any,
    },
  });

  await createAuditLog({
    userId: user.userId,
    grievanceId,
    action: "ATTACHMENT_ADDED",
    newValue: attachment.id,
  });

  return attachment;
}

// --- FEEDBACK ---
export async function submitGrievanceFeedback(
  grievanceId: string,
  user: UserContext,
  rating: number,
  comments?: string,
) {
  const allowed = await canAccessGrievanceSubResource(grievanceId, user);
  if (!allowed) {
    throw new Error(
      "Forbidden: You do not have access to this grievance sub-resource.",
    );
  }

  const feedback = await prisma.feedback.create({
    data: {
      grievanceId,
      userId: user.userId,
      rating,
      comment: comments || null,
    },
  });

  await createAuditLog({
    userId: user.userId,
    grievanceId,
    action: "FEEDBACK_SUBMITTED",
    newValue: String(rating),
  });

  return feedback;
}
