import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import { createError } from '../middleware/errorHandler';

const generateToken = (userId: number, username: string): string => {
  const secret = process.env.JWT_SECRET || 'fallback_secret';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  return jwt.sign({ id: userId, username }, secret, { expiresIn } as jwt.SignOptions);
};

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ success: false, errors: errors.array() });
      return;
    }

    const { username, email, password } = req.body;

    const existingUser = await User.findOne({
      where: { email },
    });

    if (existingUser) {
      next(createError('An account with this email already exists.', 409));
      return;
    }

    const existingUsername = await User.findOne({ where: { username } });
    if (existingUsername) {
      next(createError('This username is already taken.', 409));
      return;
    }

    const user = await User.create({ username, email, password });
    const token = generateToken(user.id, user.username);

    res.status(201).json({
      success: true,
      message: 'Account created successfully. Welcome to TaskFlow!',
      data: {
        token,
        user: user.toSafeJSON(),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ success: false, errors: errors.array() });
      return;
    }

    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      next(createError('Invalid email or password.', 401));
      return;
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      next(createError('Invalid email or password.', 401));
      return;
    }

    const token = generateToken(user.id, user.username);

    res.status(200).json({
      success: true,
      message: `Welcome back, ${user.username}!`,
      data: {
        token,
        user: user.toSafeJSON(),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req: Request & { user?: User }, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      next(createError('Not authenticated.', 401));
      return;
    }
    res.status(200).json({
      success: true,
      data: { user: req.user.toSafeJSON() },
    });
  } catch (error) {
    next(error);
  }
};

// Change Password (no email needed — just username + new password)
export const changePassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, newPassword, confirmPassword } = req.body;

    if (!username || !newPassword || !confirmPassword) {
      res.status(400).json({ success: false, message: 'All fields are required.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      res.status(400).json({ success: false, message: 'Passwords do not match.' });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
      return;
    }

    if (!/\d/.test(newPassword)) {
      res.status(400).json({ success: false, message: 'Password must contain at least one number.' });
      return;
    }

    // ✅ Use top-level imported User — no dynamic import needed
    const user = await User.findOne({ where: { username } });

    if (!user) {
      res.status(404).json({ success: false, message: 'No account found with that username.' });
      return;
    }


  // Model's beforeUpdate hook handles hashing automatically
await user.update({ password: newPassword });
    res.json({ success: true, message: 'Password changed successfully!' });
  } catch (error) {
    console.error('changePassword error:', error);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
};