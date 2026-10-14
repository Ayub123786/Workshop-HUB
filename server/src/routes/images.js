import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import { v2 as cloudinary } from 'cloudinary';
import ImageAsset from '../models/ImageAsset.js';
import { protect, requireEditor } from '../middleware/auth.js';
import { createError } from '../middleware/errorHandler.js';
import { supabase, isSupabaseConfigured } from '../utils/supabase.js';

const router = express.Router();

// Configure Cloudinary if keys exist
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const hasCloudinary = !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY);

// Use memory storage to process uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files allowed'));
    }
    cb(null, true);
  },
});

// Helper: ensure Supabase storage bucket exists
let bucketChecked = false;
async function ensureBucket() {
  if (!isSupabaseConfigured || !supabase || bucketChecked) return;
  try {
    const { data: buckets } = await supabase.storage.listBuckets();
    const exists = (buckets || []).some((b) => b.name === 'workshop-hub');
    if (!exists) {
      await supabase.storage.createBucket('workshop-hub', { public: true });
    }
    bucketChecked = true;
  } catch (err) {
    console.error('Bucket check error:', err.message);
  }
}

// POST /api/images/upload
router.post('/upload', protect, requireEditor, upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) throw createError('No file uploaded', 400);

    const { workshopId, slot, alt, width, height, aspectRatio } = req.body;
    let url = '';
    let publicId = '';

    // Determine extension
    let ext = 'webp';
    if (req.file.mimetype === 'image/jpeg' || req.file.mimetype === 'image/jpg') ext = 'jpg';
    else if (req.file.mimetype === 'image/png') ext = 'png';
    else if (req.file.mimetype === 'image/gif') ext = 'gif';
    else if (req.file.mimetype === 'image/svg+xml') ext = 'svg';

    const filename = `${slot || 'asset'}-${Date.now()}-${randomUUID().slice(0, 8)}.${ext}`;

    // 1. Always save a local copy to server and client public/uploads
    try {
      const serverUploads = path.join(process.cwd(), 'public/uploads');
      if (!fs.existsSync(serverUploads)) fs.mkdirSync(serverUploads, { recursive: true });
      fs.writeFileSync(path.join(serverUploads, filename), req.file.buffer);

      const clientUploads = path.join(process.cwd(), '../client/public/uploads');
      if (fs.existsSync(path.join(process.cwd(), '../client/public'))) {
        if (!fs.existsSync(clientUploads)) fs.mkdirSync(clientUploads, { recursive: true });
        fs.writeFileSync(path.join(clientUploads, filename), req.file.buffer);
      }
    } catch (saveErr) {
      console.error('Local file save warning:', saveErr.message);
    }

    // 2. Upload to Cloudinary if configured
    if (hasCloudinary) {
      try {
        const result = await new Promise((resolve, reject) => {
          cloudinary.uploader.upload_stream(
            {
              folder: `workshop-hub/${workshopId || 'general'}`,
              transformation: [
                { quality: 'auto', fetch_format: 'webp' },
                ...(width && height ? [{ width: parseInt(width), height: parseInt(height), crop: 'fill' }] : []),
              ],
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          ).end(req.file.buffer);
        });
        url = result.secure_url;
        publicId = result.public_id;
      } catch (cloudErr) {
        console.error('Cloudinary upload error:', cloudErr.message);
      }
    }

    // 3. Upload to Supabase Storage if configured and not already set
    if (!url && isSupabaseConfigured && supabase) {
      try {
        await ensureBucket();
        const storagePath = `assets/${filename}`;
        const { error: uploadError } = await supabase.storage
          .from('workshop-hub')
          .upload(storagePath, req.file.buffer, {
            contentType: req.file.mimetype || 'image/webp',
            upsert: true,
          });

        if (uploadError) {
          console.error('Supabase storage upload error:', uploadError.message);
        } else {
          const { data: publicUrlData } = supabase.storage
            .from('workshop-hub')
            .getPublicUrl(storagePath);
          if (publicUrlData?.publicUrl) {
            url = publicUrlData.publicUrl;
            publicId = `supabase:${storagePath}`;
          }
        }
      } catch (supaErr) {
        console.error('Supabase storage exception:', supaErr.message);
      }
    }

    // 4. Fallback to local server static URL if Cloudinary/Supabase not available
    if (!url) {
      url = `/uploads/${filename}`;
      publicId = `local:${filename}`;
    }

    const imageAsset = await ImageAsset.create({
      workshopId: workshopId || null,
      url,
      publicId,
      slot: slot || 'general',
      width: parseInt(width) || null,
      height: parseInt(height) || null,
      aspectRatio: aspectRatio || '16:9',
      alt: alt || '',
      size: req.file.size,
    });

    res.status(201).json({ success: true, image: imageAsset });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/images/:id
router.delete('/:id', protect, requireEditor, async (req, res, next) => {
  try {
    const image = await ImageAsset.findByIdAndDelete(req.params.id);
    if (!image) throw createError('Image not found', 404);

    // Clean up Supabase storage
    if (image.publicId?.startsWith('supabase:')) {
      const storagePath = image.publicId.replace('supabase:', '');
      if (isSupabaseConfigured && supabase) {
        await supabase.storage.from('workshop-hub').remove([storagePath]).catch(console.error);
      }
    } else if (image.publicId?.startsWith('local:')) {
      const fname = image.publicId.replace('local:', '');
      try {
        const p1 = path.join(process.cwd(), 'public/uploads', fname);
        const p2 = path.join(process.cwd(), '../client/public/uploads', fname);
        if (fs.existsSync(p1)) fs.unlinkSync(p1);
        if (fs.existsSync(p2)) fs.unlinkSync(p2);
      } catch (err) {
        console.error('Local unlink error:', err.message);
      }
    } else if (image.publicId && hasCloudinary) {
      await cloudinary.uploader.destroy(image.publicId).catch(console.error);
    }

    res.json({ success: true, message: 'Image deleted' });
  } catch (err) {
    next(err);
  }
});

// GET /api/images – list all images
router.get('/', protect, requireEditor, async (req, res, next) => {
  try {
    const { workshopId, slot } = req.query;
    const query = {};
    if (workshopId && workshopId !== 'all') query.workshopId = workshopId;
    if (slot && slot !== 'all') query.slot = slot;
    const images = await ImageAsset.find(query).sort({ createdAt: -1 });
    res.json({ success: true, images });
  } catch (err) {
    next(err);
  }
});

// GET /api/images/:workshopId – list images for a workshop
router.get('/:workshopId', protect, requireEditor, async (req, res, next) => {
  try {
    const images = await ImageAsset.find({ workshopId: req.params.workshopId }).sort({ createdAt: -1 });
    res.json({ success: true, images });
  } catch (err) {
    next(err);
  }
});

export default router;
