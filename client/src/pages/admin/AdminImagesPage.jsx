import { useState, useEffect, useCallback, useRef } from 'react';
import Cropper from 'react-easy-crop';
import {
  Upload,
  Copy,
  Check,
  Trash2,
  Image as ImageIcon,
  Crop,
  Layers,
  X,
  Loader2,
  Sparkles,
  ExternalLink,
  Filter,
} from 'lucide-react';
import api from '../../lib/api';

const SLOTS = [
  { id: 'hero-banner', label: 'Hero Banner', aspect: 16 / 9, ratioText: '16:9', w: 1200, h: 675 },
  { id: 'card-banner', label: 'Card Banner', aspect: 16 / 9, ratioText: '16:9', w: 800, h: 450 },
  { id: 'trainer-portrait', label: 'Trainer Portrait', aspect: 3 / 4, ratioText: '3:4', w: 600, h: 800 },
  { id: 'community-image', label: 'Community Photo', aspect: 16 / 9, ratioText: '16:9', w: 1200, h: 675 },
  { id: 'logos-wall', label: 'Logos Wall', aspect: 21 / 9, ratioText: '21:9', w: 1400, h: 600 },
  { id: 'testimonial-avatar', label: 'Testimonial Avatar', aspect: 1, ratioText: '1:1', w: 200, h: 200 },
  { id: 'og-image', label: 'Social OG Image', aspect: 1.91 / 1, ratioText: '1200x630', w: 1200, h: 630 },
];

export default function AdminImagesPage() {
  const [images, setImages] = useState([]);
  const [workshops, setWorkshops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState(SLOTS[0]);
  const [filterSlot, setFilterSlot] = useState('all');
  const [selectedWorkshop, setSelectedWorkshop] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  // Upload & Crop state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fileSrc, setFileSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [altText, setAltText] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [imgRes, wRes] = await Promise.all([
        api.get('/images'),
        api.get('/workshops/admin/all'),
      ]);
      setImages(imgRes.data.images || []);
      setWorkshops(wRes.data.workshops || []);
    } catch (err) {
      console.error('Failed to load images', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setFileSrc(reader.result);
        setCrop({ x: 0, y: 0 });
        setZoom(1);
        setIsModalOpen(true);
      });
      reader.readAsDataURL(file);
    }
    // reset input so the same file can be re-selected if needed
    e.target.value = '';
  };

  const onCropComplete = useCallback((_, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  // Upload cropped image
  const handleUpload = async () => {
    if (!fileSrc) return;
    setUploading(true);
    try {
      // In browser, create canvas to crop
      const canvas = document.createElement('canvas');
      const image = new Image();
      image.src = fileSrc;
      await new Promise((resolve) => (image.onload = resolve));

      const { width, height, x, y } = croppedAreaPixels || {
        width: image.width,
        height: image.height,
        x: 0,
        y: 0,
      };

      canvas.width = selectedSlot.w || width;
      canvas.height = selectedSlot.h || height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(image, x, y, width, height, 0, 0, canvas.width, canvas.height);

      const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/webp', 0.92));
      const formData = new FormData();
      formData.append('image', blob, `${selectedSlot.id || 'image'}.webp`);
      formData.append('slot', selectedSlot.id);
      formData.append('alt', altText || selectedSlot.label);
      formData.append('width', selectedSlot.w);
      formData.append('height', selectedSlot.h);
      formData.append('aspectRatio', selectedSlot.ratioText);
      if (selectedWorkshop) formData.append('workshopId', selectedWorkshop);

      const res = await api.post('/images/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data?.image) {
        setImages((prev) => [res.data.image, ...prev]);
      }
      setIsModalOpen(false);
      setFileSrc(null);
      setAltText('');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleCopyUrl = (id, url) => {
    // If relative URL, prepend origin for easy pasting
    const fullUrl = url.startsWith('http') ? url : `${window.location.origin}${url}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this image?')) return;
    try {
      await api.delete(`/images/${id}`);
      setImages((prev) => prev.filter((img) => img._id !== id && img.id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete image');
    }
  };

  // Filtered images list
  const filteredImages = images.filter((img) => {
    if (filterSlot === 'all') return true;
    return img.slot === filterSlot;
  });

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy">Image Asset Manager</h1>
          <p className="text-xs text-muted mt-1">
            Upload, crop to target aspect ratios, optimize to WebP, and store directly in Supabase Storage.
          </p>
        </div>

        {/* Upload Trigger */}
        <label className="btn-primary text-xs py-2.5 px-4 cursor-pointer flex items-center gap-2 self-start sm:self-auto shadow-sm hover:scale-[1.02] transition-transform">
          <Upload className="w-4 h-4" /> Upload & Crop Image
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </label>
      </div>

      {/* Target Slots Legend & Quick Selector */}
      <div className="bg-white rounded-2xl border border-border p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold text-navy uppercase tracking-wider flex items-center gap-2">
            <Crop className="w-3.5 h-3.5 text-gold" />
            Preset Aspect Ratio Slots
          </p>
          <span className="text-[11px] text-muted">
            Click a slot to filter gallery or prepare next upload
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilterSlot('all')}
            className={`text-xs px-3.5 py-1.5 rounded-xl border transition-all flex items-center gap-1.5 ${
              filterSlot === 'all'
                ? 'bg-navy text-white border-navy font-bold shadow-xs'
                : 'bg-cream text-muted border-border hover:border-gold hover:text-navy'
            }`}
          >
            <Filter className="w-3 h-3" />
            <span>All Slots</span>
            <span className="text-[10px] opacity-75">({images.length})</span>
          </button>

          {SLOTS.map((slot) => {
            const count = images.filter((img) => img.slot === slot.id).length;
            const isFilterActive = filterSlot === slot.id;
            return (
              <button
                key={slot.id}
                onClick={() => {
                  setSelectedSlot(slot);
                  setFilterSlot(slot.id);
                }}
                className={`text-xs px-3 py-1.5 rounded-xl border transition-all flex items-center gap-2 ${
                  isFilterActive
                    ? 'bg-navy text-white border-navy font-bold shadow-xs'
                    : 'bg-cream text-muted border-border hover:border-gold hover:text-navy'
                }`}
              >
                <span>{slot.label}</span>
                <span className="text-[10px] opacity-75">({slot.ratioText})</span>
                {count > 0 && (
                  <span className="bg-white/20 text-[10px] px-1.5 py-0.2 rounded-full font-semibold">
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="bg-white rounded-2xl border border-border p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-bold text-navy uppercase tracking-wider">
            Saved Image Assets ({filteredImages.length}
            {filterSlot !== 'all' && ` filtered by ${SLOTS.find((s) => s.id === filterSlot)?.label || filterSlot}`})
          </h2>
          {filterSlot !== 'all' && (
            <button
              onClick={() => setFilterSlot('all')}
              className="text-[11px] text-gold font-semibold hover:underline"
            >
              Clear filter
            </button>
          )}
        </div>

        {loading ? (
          <div className="p-16 text-center">
            <Loader2 className="w-8 h-8 text-gold animate-spin mx-auto mb-3" />
            <p className="text-xs text-muted">Loading image library...</p>
          </div>
        ) : filteredImages.length === 0 ? (
          <div className="p-16 text-center border-2 border-dashed border-border rounded-xl">
            <ImageIcon className="w-10 h-10 text-muted/50 mx-auto mb-2" />
            <p className="text-sm font-semibold text-navy">No image assets found</p>
            <p className="text-xs text-muted mt-1 mb-4">
              {filterSlot === 'all'
                ? 'Upload your first image to begin building your asset library.'
                : `No images uploaded for the ${SLOTS.find((s) => s.id === filterSlot)?.label || filterSlot} slot yet.`}
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="btn-primary text-xs py-2 px-4 inline-flex items-center gap-2"
            >
              <Upload className="w-3.5 h-3.5" /> Upload Image
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredImages.map((img) => (
              <div
                key={img._id || img.id}
                className="bg-cream rounded-xl border border-border overflow-hidden group hover:shadow-card transition-all flex flex-col justify-between"
              >
                <div className="aspect-[16/9] relative overflow-hidden bg-cream-dark">
                  <img
                    src={img.url}
                    alt={img.alt || 'Asset'}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute top-2 left-2 bg-navy/80 text-white text-[10px] font-bold px-2 py-0.5 rounded backdrop-blur-xs">
                    {img.aspectRatio || '16:9'}
                  </div>
                  <a
                    href={img.url}
                    target="_blank"
                    rel="noreferrer"
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-navy/70 text-white hover:bg-navy opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Open full image in new tab"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                <div className="p-3 space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-navy capitalize truncate max-w-[130px]" title={img.alt || img.slot}>
                      {img.alt || img.slot || 'General'}
                    </span>
                    <span className="text-muted text-[10px]">
                      {img.width ? `${img.width}×${img.height}` : 'WebP'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 pt-1 border-t border-border">
                    <button
                      onClick={() => handleCopyUrl(img._id || img.id, img.url)}
                      className="flex-1 py-1.5 rounded-lg bg-white border border-border hover:border-gold text-navy text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors"
                    >
                      {copiedId === (img._id || img.id) ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" /> Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 text-muted" /> Copy URL
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleDelete(img._id || img.id)}
                      className="p-1.5 rounded-lg bg-white border border-border hover:bg-red-50 text-muted hover:text-red-600 transition-colors"
                      title="Delete image"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cropper Modal */}
      {isModalOpen && fileSrc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-border w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh]">
            <div className="p-4 border-b border-border flex items-center justify-between bg-cream">
              <div>
                <h3 className="text-sm font-bold text-navy flex items-center gap-2">
                  <Crop className="w-4 h-4 text-gold" />
                  Crop Image — {selectedSlot.label} ({selectedSlot.ratioText})
                </h3>
                <p className="text-[11px] text-muted">
                  Pan and zoom to crop. Output will be saved directly to Supabase Storage.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-full text-muted hover:bg-cream-dark transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Cropper Canvas Container */}
            <div className="relative w-full h-80 sm:h-96 bg-navy/95">
              <Cropper
                image={fileSrc}
                crop={crop}
                zoom={zoom}
                aspect={selectedSlot.aspect}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>

            {/* Controls */}
            <div className="p-4 bg-white border-t border-border space-y-3">
              {/* Zoom slider */}
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-navy">Zoom:</span>
                <input
                  type="range"
                  value={zoom}
                  min={1}
                  max={3}
                  step={0.05}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="flex-1 accent-gold cursor-pointer"
                />
                <span className="text-xs text-muted w-10 text-right">{zoom.toFixed(1)}x</span>
              </div>

              {/* Slot Switcher inside modal */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-navy mb-1">Target Slot</label>
                  <select
                    value={selectedSlot.id}
                    onChange={(e) => {
                      const found = SLOTS.find((s) => s.id === e.target.value);
                      if (found) setSelectedSlot(found);
                    }}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-border text-xs bg-white text-navy focus:border-gold focus:outline-hidden"
                  >
                    {SLOTS.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.label} ({s.ratioText})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-navy mb-1">Alt / Description</label>
                  <input
                    type="text"
                    value={altText}
                    onChange={(e) => setAltText(e.target.value)}
                    placeholder={selectedSlot.label}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-border text-xs focus:border-gold focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-navy mb-1">Workshop (Optional)</label>
                  <select
                    value={selectedWorkshop}
                    onChange={(e) => setSelectedWorkshop(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-border text-xs bg-white text-navy focus:border-gold focus:outline-hidden"
                  >
                    <option value="">General / Shared</option>
                    {workshops.map((w) => (
                      <option key={w._id} value={w._id}>
                        {w.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-border">
                <span className="text-[11px] text-muted">
                  Output size: {selectedSlot.w}×{selectedSlot.h}px ({selectedSlot.ratioText})
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-lg border border-border text-xs font-semibold text-muted hover:text-navy hover:bg-cream"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpload}
                    disabled={uploading}
                    className="btn-primary text-xs py-2 px-5 flex items-center gap-2 shadow-xs"
                  >
                    {uploading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5" />
                    )}
                    {uploading ? 'Uploading to Supabase...' : 'Save & Optimize'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
