import express from 'express';
import Form from '../models/Form.js';
import Submission from '../models/Submission.js';
import Workshop from '../models/Workshop.js';
import { protect, requireEditor, requireAdmin } from '../middleware/auth.js';
import { createError } from '../middleware/errorHandler.js';
import { sendConfirmationEmail } from '../utils/email.js';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';

const router = express.Router();

// Rate limiter for form submissions
const submitLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 10,
  message: { success: false, message: 'Too many submissions, please try again later.' },
});

/* ─── PUBLIC ─── */

// POST /api/forms/:id/submit
router.post('/:id/submit', submitLimiter, async (req, res, next) => {
  try {
    let form = await Form.findById(req.params.id);
    if (!form) {
      form = await Form.findOne({ workshopId: req.params.id });
    }

    // Workshop lookup
    const targetWorkshopId = form?.workshopId || req.body.workshopId || req.params.id;
    const workshop = await Workshop.findById(targetWorkshopId);
    if (!workshop) throw createError('Workshop not found', 404);

    if (!form) {
      form = {
        _id: workshop.id,
        id: workshop.id,
        workshopId: workshop.id,
        isActive: true,
        fields: [],
        capacity: workshop.seatsTotal || 100,
        successMessage: 'Thank you for registering! We have reserved your seat.',
      };
    }

    if (!form.isActive) throw createError('Registration is currently closed', 400);

    // Honeypot check
    if (req.body._honey || req.body.honeypot) {
      return res.json({ success: true, message: 'Thank you!' }); // silently discard
    }

    // Deadline check
    if (form.deadline && new Date() > form.deadline) {
      throw createError('Registration deadline has passed', 400);
    }

    const isWaitlist = Boolean(req.body.isWaitlist || req.body.data?.isWaitlist);

    // Capacity check (only for regular registrations, not waitlist)
    const effectiveCapacity = form.capacity || workshop.seatsTotal || 100;
    if (!isWaitlist && workshop.seatsBooked >= effectiveCapacity) {
      throw createError('This workshop is sold out. Please join the waitlist.', 400);
    }

    // Extract email
    const emailField = form.fields?.find(f => f.type === 'email');
    const rawEmail = (emailField ? req.body.data?.[emailField.id] : null) || req.body.data?.email || req.body.email;
    const email = rawEmail ? String(rawEmail).trim().toLowerCase() : null;

    // Duplicate registration check
    if (email) {
      const existing = await Submission.findOne({ workshopId: workshop.id, email });
      if (existing) {
        throw createError(
          existing.data?.isWaitlist
            ? 'You are already on the waitlist for this workshop'
            : 'You have already registered for this workshop',
          409
        );
      }
    }

    // Server-side validation for configured form fields
    const requiredFields = (form.fields || []).filter(f => f.required);
    for (const field of requiredFields) {
      const val = req.body.data?.[field.id];
      if (!val || (typeof val === 'string' && !val.trim())) {
        throw createError(`${field.label} is required`, 400);
      }
    }

    // Create submission
    const submission = await Submission.create({
      formId: form._id,
      workshopId: workshop.id,
      data: {
        ...(req.body.data || {}),
        isWaitlist,
      },
      email,
      ip: req.ip || req.headers['x-forwarded-for'],
      userAgent: req.headers['user-agent'],
    });

    // Increment seats only if NOT waitlist
    if (!isWaitlist) {
      await Workshop.findByIdAndUpdate(workshop.id, { $inc: { seatsBooked: 1 } });
    }

    // Send confirmation email (non-blocking)
    if (email) {
      sendConfirmationEmail({
        email,
        name: req.body.data?.name,
        workshop,
        form,
        isWaitlist,
      }).catch(console.error);
    }

    res.status(201).json({
      success: true,
      message: form.successMessage,
      submissionId: submission._id,
    });
  } catch (err) {
    next(err);
  }
});

/* ─── ADMIN ─── */

// GET /api/forms/admin/submissions – list submissions across all workshops
router.get('/admin/submissions', protect, requireEditor, async (req, res, next) => {
  try {
    const { workshopId, search, page = 1, limit = 50 } = req.query;
    const query = {};
    if (workshopId && workshopId !== 'all') query.workshopId = workshopId;
    if (search) {
      query.$or = [
        { email: { $regex: search, $options: 'i' } },
        { 'data.name': { $regex: search, $options: 'i' } },
        { 'data.company': { $regex: search, $options: 'i' } },
      ];
    }
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [submissions, total, workshops] = await Promise.all([
      Submission.find(query)
        .populate('workshopId', 'title slug')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Submission.countDocuments(query),
      Workshop.find({}).select('title slug').sort({ title: 1 }),
    ]);
    res.json({ success: true, submissions, total, workshops });
  } catch (err) {
    next(err);
  }
});

// GET /api/forms/admin/submissions/export – CSV export all or by workshop
router.get('/admin/submissions/export', protect, requireEditor, async (req, res, next) => {
  try {
    const { workshopId } = req.query;
    const query = {};
    if (workshopId && workshopId !== 'all') query.workshopId = workshopId;

    const submissions = await Submission.find(query)
      .populate('workshopId', 'title')
      .sort({ createdAt: -1 });

    const headers = ['Submitted At', 'Workshop', 'Email', 'Name', 'Company', 'Role', 'IP'];
    const rows = submissions.map(s => [
      new Date(s.createdAt).toISOString(),
      `"${(s.workshopId?.title || '').replace(/"/g, '""')}"`,
      `"${(s.email || '').replace(/"/g, '""')}"`,
      `"${(s.data?.name || '').replace(/"/g, '""')}"`,
      `"${(s.data?.company || '').replace(/"/g, '""')}"`,
      `"${(s.data?.role || '').replace(/"/g, '""')}"`,
      s.ip || '',
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=all-submissions.csv');
    res.send(csv);
  } catch (err) {
    next(err);
  }
});

// GET /api/forms/:workshopId – get form for a workshop
router.get('/:workshopId', protect, requireEditor, async (req, res, next) => {
  try {
    const form = await Form.findOne({ workshopId: req.params.workshopId });
    if (!form) throw createError('Form not found', 404);
    res.json({ success: true, form });
  } catch (err) {
    next(err);
  }
});

// PUT /api/forms/:id – update form fields/settings
router.put('/:id', protect, requireEditor, async (req, res, next) => {
  try {
    const form = await Form.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!form) throw createError('Form not found', 404);
    res.json({ success: true, form });
  } catch (err) {
    next(err);
  }
});

// GET /api/forms/:id/submissions – list submissions
router.get('/:id/submissions', protect, requireEditor, async (req, res, next) => {
  try {
    const { search, page = 1, limit = 50 } = req.query;
    const query = { formId: req.params.id };
    if (search) {
      query.$or = [
        { email: { $regex: search, $options: 'i' } },
        { 'data.name': { $regex: search, $options: 'i' } },
      ];
    }
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [submissions, total] = await Promise.all([
      Submission.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      Submission.countDocuments(query),
    ]);
    res.json({ success: true, submissions, total });
  } catch (err) {
    next(err);
  }
});

// GET /api/forms/:id/submissions/export – CSV export
router.get('/:id/submissions/export', protect, requireEditor, async (req, res, next) => {
  try {
    const form = await Form.findById(req.params.id);
    if (!form) throw createError('Form not found', 404);

    const submissions = await Submission.find({ formId: req.params.id }).sort({ createdAt: -1 });
    const fieldIds = form.fields.map(f => f.id);
    const fieldLabels = form.fields.reduce((acc, f) => { acc[f.id] = f.label; return acc; }, {});

    // Build CSV manually
    const headers = ['Submitted At', 'Email', 'IP', ...form.fields.map(f => f.label)];
    const rows = submissions.map(s => {
      const row = [
        new Date(s.createdAt).toISOString(),
        s.email || '',
        s.ip || '',
        ...fieldIds.map(id => {
          const val = s.data?.[id];
          return typeof val === 'string' ? `"${val.replace(/"/g, '""')}"` : (val ?? '');
        }),
      ];
      return row.join(',');
    });

    const csv = [headers.join(','), ...rows].join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=submissions-${req.params.id}.csv`);
    res.send(csv);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/forms/:formId/submissions/:submissionId
router.delete('/:formId/submissions/:submissionId', protect, requireAdmin, async (req, res, next) => {
  try {
    const submission = await Submission.findByIdAndDelete(req.params.submissionId);
    if (!submission) throw createError('Submission not found', 404);
    // Decrement seats
    await Workshop.findByIdAndUpdate(submission.workshopId, { $inc: { seatsBooked: -1 } });
    res.json({ success: true, message: 'Submission deleted' });
  } catch (err) {
    next(err);
  }
});

// PUT /api/forms/admin/submissions/:id/promote
router.put('/admin/submissions/:id/promote', protect, requireEditor, async (req, res, next) => {
  try {
    const submission = await Submission.findById(req.params.id);
    if (!submission) throw createError('Submission not found', 404);

    const workshop = await Workshop.findById(submission.workshopId);
    if (!workshop) throw createError('Workshop not found', 404);

    const updatedData = { ...submission.data, isWaitlist: false, promotedAt: new Date().toISOString() };
    
    const { isSupabaseConfigured, supabase, readLocalStore, writeLocalStore } = await import('../utils/supabase.js');
    if (isSupabaseConfigured) {
      const { error } = await supabase
        .from('submissions')
        .update({ data: updatedData })
        .eq('id', submission.id);
      if (error) throw error;
    } else {
      const store = readLocalStore();
      const idx = (store.submissions || []).findIndex((s) => s.id === submission.id);
      if (idx !== -1) {
        store.submissions[idx].data = updatedData;
        writeLocalStore(store);
      }
    }

    // Increment seats
    await Workshop.findByIdAndUpdate(workshop.id, { $inc: { seatsBooked: 1 } });

    // Send confirmation email
    if (submission.email) {
      sendConfirmationEmail({
        email: submission.email,
        name: submission.data?.name,
        workshop,
        isWaitlist: false,
      }).catch(console.error);
    }

    res.json({ success: true, message: 'Attendee successfully promoted and confirmation email sent' });
  } catch (err) {
    next(err);
  }
});

export default router;
