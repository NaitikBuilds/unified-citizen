import { Request, Response, NextFunction } from "express";
import path from "path";
import fs from "fs";
import { prisma } from "../services/prisma.service.js";

export const getAttachment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const rawFilename = req.params.filename;
    const filename = Array.isArray(rawFilename) ? rawFilename[0] : rawFilename;
    const userId = (req as any).user.id;

    if (!filename) {
      return res.status(400).json({ message: "Invalid filename parameter" });
    }

    // 1. Find the attachment record matching fileUrl or fileName, and fetch the related grievance
    const attachment = await prisma.attachment.findFirst({
      where: {
        OR: [
          { fileUrl: { contains: filename } },
          { fileName: { contains: filename } },
        ],
      },
      include: { grievance: true },
    });

    if (!attachment || !attachment.grievance) {
      return res.status(404).json({ message: "Attachment or associated grievance not found" });
    }

    // 2. Authorization Check: Is the user the citizen who created the grievance?
    const isOwner = attachment.grievance.citizenId === userId;

    if (!isOwner) {
      return res.status(403).json({ message: "Access denied" });
    }

    // 3. Serve the file securely from disk
    const filePath = path.join(process.cwd(), 'uploads', filename);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "File missing on disk" });
    }

    res.download(filePath);
  } catch (error) {
    next(error);
  }
};