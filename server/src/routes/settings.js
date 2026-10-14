import express from 'express';
import PlatformSettings from '../models/PlatformSettings.js';
import { protect, requireAdmin } from '../middleware/auth.js';
import { createError } from '../middleware/errorHandler.js';

const router = express.Router();

// GET /api/settings – public (for navbar, footer, etc.)
router.get('/', async (req, res, next) => {
  try {
    let settings = await PlatformSettings.findOne().populate('featuredWorkshopId');
    if (!settings) {
      settings = await PlatformSettings.create({});
    }
    res.json({ success: true, settings });
  } catch (err) {
    next(err);
  }
});

// PUT /api/settings – admin update
router.put('/', protect, requireAdmin, async (req, res, next) => {
  try {
    let settings = await PlatformSettings.findOne();
    if (!settings) {
      settings = await PlatformSettings.create(req.body);
    } else {
      Object.assign(settings, req.body);
      await settings.save();
    }
    res.json({ success: true, settings });
  } catch (err) {
    next(err);
  }
});

export default router;
