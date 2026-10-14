import express from 'express';
import Section from '../models/Section.js';
import { protect, requireEditor } from '../middleware/auth.js';
import { createError } from '../middleware/errorHandler.js';

const router = express.Router();

// GET /api/sections/:workshopId – all sections for a workshop (admin)
router.get('/:workshopId', protect, requireEditor, async (req, res, next) => {
  try {
    const sections = await Section.find({ workshopId: req.params.workshopId }).sort({ order: 1 });
    res.json({ success: true, sections });
  } catch (err) {
    next(err);
  }
});

// POST /api/sections – create new section
router.post('/', protect, requireEditor, async (req, res, next) => {
  try {
    const section = await Section.create(req.body);
    res.status(201).json({ success: true, section });
  } catch (err) {
    next(err);
  }
});

// PUT /api/sections/:id – update section content/visibility/animation
router.put('/:id', protect, requireEditor, async (req, res, next) => {
  try {
    const section = await Section.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!section) throw createError('Section not found', 404);
    res.json({ success: true, section });
  } catch (err) {
    next(err);
  }
});

// PUT /api/sections/reorder/:workshopId – bulk reorder
router.put('/reorder/:workshopId', protect, requireEditor, async (req, res, next) => {
  try {
    // req.body.order = [{ id, order }, ...]
    const { order } = req.body;
    if (!Array.isArray(order)) throw createError('order array required');
    await Promise.all(order.map(({ id, order: ord }) =>
      Section.findByIdAndUpdate(id, { order: ord })
    ));
    res.json({ success: true, message: 'Sections reordered' });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/sections/:id – remove section
router.delete('/:id', protect, requireEditor, async (req, res, next) => {
  try {
    await Section.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Section deleted' });
  } catch (err) {
    next(err);
  }
});

export default router;
