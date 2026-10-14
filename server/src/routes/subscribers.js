import express from 'express';
import Subscriber from '../models/Subscriber.js';
import { protect, requireAdmin } from '../middleware/auth.js';
import { createError } from '../middleware/errorHandler.js';

const router = express.Router();

// POST /api/subscribers – public subscribe (newsletter / workshop notifications)
router.post('/', async (req, res, next) => {
  try {
    const { email, source = 'hub_newsletter', workshopSlug } = req.body;
    if (!email || !email.includes('@')) {
      throw createError('Please provide a valid email address', 400);
    }

    const existing = await Subscriber.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.json({ success: true, message: "You're already subscribed!", subscriber: existing });
    }

    const subscriber = await Subscriber.create({ email, source, workshopSlug });
    res.status(201).json({ success: true, message: 'Subscribed successfully!', subscriber });
  } catch (err) {
    next(err);
  }
});

// GET /api/subscribers – admin list
router.get('/', protect, requireAdmin, async (req, res, next) => {
  try {
    const subscribers = await Subscriber.find({});
    res.json({ success: true, subscribers, total: subscribers.length });
  } catch (err) {
    next(err);
  }
});

// GET /api/subscribers/export – admin CSV export
router.get('/export', protect, requireAdmin, async (req, res, next) => {
  try {
    const subscribers = await Subscriber.find({});
    const headers = 'ID,Email,Source,WorkshopSlug,CreatedAt\n';
    const rows = subscribers
      .map((s) => `"${s.id}","${s.email}","${s.source}","${s.workshopSlug || ''}","${s.createdAt}"`)
      .join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="subscribers.csv"');
    res.send(headers + rows);
  } catch (err) {
    next(err);
  }
});

export default router;
