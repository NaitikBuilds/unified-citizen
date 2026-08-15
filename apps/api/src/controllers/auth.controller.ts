import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { prisma } from '../services/prisma.service.js';
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '../services/jwt.service.js';

export async function register(req: Request, res: Response): Promise<void> {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      res.status(400).json({ error: 'Missing required fields: email, password, name' });
      return;
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(400).json({ error: 'User already exists with this email' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // SECURITY: Public registration strictly forces CITIZEN and null department
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash: hashedPassword,
        name,
        role: 'CITIZEN',
        departmentId: null,
      },
    });

    res.status(201).json({ message: 'User registered successfully', userId: user.id });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const tokenPayload = {
      userId: user.id,
      role: user.role,
      email: user.email,
      departmentId: user.departmentId,
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshTokenRaw = generateRefreshToken(user.id);
    
    const tokenHash = crypto.createHash('sha256').update(refreshTokenRaw).digest('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await prisma.refreshToken.create({
      data: {
        tokenHash,
        userId: user.id,
        expiresAt,
      },
    });

    res.json({
      accessToken,
      refreshToken: refreshTokenRaw,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, departmentId: user.departmentId },
    });
  } catch (error) {
    console.error('Login error:', error);
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

    const payload = verifyRefreshToken(refreshToken);
    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');

    const storedToken = await prisma.refreshToken.findUnique({
      where: { tokenHash },
    });

    if (!storedToken || storedToken.revokedAt || storedToken.expiresAt < new Date()) {
      res.status(403).json({ error: 'Invalid or revoked refresh token' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user) {
      res.status(403).json({ error: 'User not found' });
      return;
    }

    const accessToken = generateAccessToken({
      userId: user.id,
      role: user.role,
      email: user.email,
      departmentId: user.departmentId,
    });

    res.json({ accessToken });
  } catch (error) {
    res.status(403).json({ error: 'Invalid or expired refresh token' });
  }
}

export async function logout(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { refreshToken } = req.body;
    
    if (refreshToken) {
      const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
      await prisma.refreshToken.updateMany({
        where: { tokenHash, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    } else if (req.user) {
      await prisma.refreshToken.updateMany({
        where: { userId: req.user.userId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    }

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
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