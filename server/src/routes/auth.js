import express from 'express';
import User from '../models/User.js';
import { generateToken, protect } from '../middleware/auth.js';
import { createError } from '../middleware/errorHandler.js';

const router = express.Router();

// POST /api/auth/login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) throw createError('Email and password are required');

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) throw createError('Invalid credentials', 401);

    const isMatch = await user.comparePassword(password);
    if (!isMatch) throw createError('Invalid credentials', 401);

    const token = generateToken(user._id);
    res.json({
      success: true,
      token,
      user: user.toSafeObject(),
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/auth/me  (protected)
router.get('/me', protect, async (req, res, next) => {
  try {
    res.json({ success: true, user: req.user.toSafeObject() });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/register (admin only in production; here for initial setup)
router.post('/register', protect, async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') throw createError('Admin only', 403);
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) throw createError('Name, email, password required');

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) throw createError('Email already exists', 409);

    const user = await User.create({ name, email, passwordHash: password, role: role || 'editor' });
    res.status(201).json({ success: true, user: user.toSafeObject() });
  } catch (err) {
    next(err);
  }
});

export default router;
