import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import fs from 'fs';
import { Request } from 'express';

// Ensure the uploads directory exists before multer writes to it.
const uploadsDir = path.join(process.cwd(), 'uploads');
fs.mkdirSync(uploadsDir, { recursive: true });

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(process.cwd(), 'uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = crypto.randomBytes(16).toString('hex');
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

// File filter (Allow images and common documents)
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    const error = new Error(
      'Invalid file type. Only JPEG, PNG, WEBP, PDF, and DOC/DOCX files are allowed.',
    ) as Error & { statusCode?: number };
    error.statusCode = 400;
    cb(error);
  }
};

// Magic-byte signatures for each allowed MIME type. The client-supplied MIME
// header is trivially spoofable, so the actual file content is verified after
// multer writes it to disk.
const SIGNATURES: Record<string, ((buf: Buffer) => boolean)[]> = {
  'image/jpeg': [(buf) => buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff],
  'image/png': [
    (buf) =>
      buf.length >= 8 &&
      buf[0] === 0x89 &&
      buf[1] === 0x50 &&
      buf[2] === 0x4e &&
      buf[3] === 0x47 &&
      buf[4] === 0x0d &&
      buf[5] === 0x0a &&
      buf[6] === 0x1a &&
      buf[7] === 0x0a,
  ],
  'image/webp': [
    (buf) =>
      buf.length >= 12 &&
      buf.toString('ascii', 0, 4) === 'RIFF' &&
      buf.toString('ascii', 8, 12) === 'WEBP',
  ],
  'application/pdf': [(buf) => buf.length >= 4 && buf.toString('ascii', 0, 4) === '%PDF'],
  'application/msword': [
    (buf) => buf.length >= 4 && buf[0] === 0xd0 && buf[1] === 0xcf && buf[2] === 0x11 && buf[3] === 0xe0,
  ],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [
    (buf) => buf.length >= 4 && buf[0] === 0x50 && buf[1] === 0x4b && buf[2] === 0x03 && buf[3] === 0x04,
  ],
};

export async function validateFileSignature(
  filePath: string,
  mimetype: string,
): Promise<boolean> {
  const checks = SIGNATURES[mimetype];
  if (!checks) {
    return false;
  }
  try {
    const buffer = await fs.promises.readFile(filePath);
    return checks.some((check) => check(buffer));
  } catch {
    return false;
  }
}

// Limits: Max 5MB file size
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
  },
});