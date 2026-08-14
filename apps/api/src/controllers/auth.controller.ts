import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../services/prisma.service.js';
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'super-secret-refresh-key';

export async function register(req: Request, res: Response): Promise<void> {
  try {
    const { email, password, name, role, departmentId } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(400).json({ error: 'User already exists with this email' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: role || 'Citizen',
        departmentId: departmentId || null,
      },
    });

    res.status(201).json({ message: 'User registered successfully', userId: user.id });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const accessToken = jwt.sign({ userId: user.id, role: user.role, email: user.email }, JWT_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ userId: user.id }, JWT_REFRESH_SECRET, { expiresIn: '7d' });

    res.json({ accessToken, refreshToken, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function refresh(req: Request, res: Response): Promise<void> {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      res.status(400).json({ error: 'Refresh token required' });
      return;
    }

    const payload = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as { userId: string };
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });

    if (!user) {
      res.status(403).json({ error: 'Invalid refresh token' });
      return;
    }

    const accessToken = jwt.sign({ userId: user.id, role: user.role, email: user.email }, JWT_SECRET, { expiresIn: '15m' });
    res.json({ accessToken });
  } catch (error) {
    res.status(403).json({ error: 'Invalid or expired refresh token' });
  }
}

export async function logout(_req: Request, res: Response): Promise<void> {
  // Stateless JWT logout is usually handled on client by clearing tokens, but endpoint can return success
  res.json({ message: 'Logged out successfully' });
}

export async function getMe(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { id: true, name: true, email: true, role: true, departmentId: true, createdAt: true },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
}