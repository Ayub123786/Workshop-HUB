import { useState, useEffect, useCallback, useRef } from 'react';
import Cropper from 'react-easy-crop';
import {
  Upload,
  Image as ImageIcon,
  Check,
  X,
  Loader2,
  Sparkles,
  Layers,
  Search,
  Link as LinkIcon,
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

export default function ImagePickerModal({
  isOpen,
  onClose,
  onSelect,
  defaultSlot = 'hero-banner',
}) {
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' | 'library' | 'url'
  const [slot, setSlot] = useState(
    SLOTS.find((s) => s.id === defaultSlot) || SLOTS[0]
  );

  // Library State
  const [libraryImages, setLibraryImages] = useState([]);
  const [libraryLoading, setLibraryLoading] = useState(false);
  const [libraryFilter, setLibraryFilter] = useState('all');
  const [librarySearch, setLibrarySearch] = useState('');

  // Upload & Crop State
  const [fileSrc, setFileSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [altText, setAltText] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Direct URL State
  const [directUrl, setDirectUrl] = useState('');

  useEffect(() => {
    if (defaultSlot) {
      const match = SLOTS.find((s) => s.id === defaultSlot);
      if (match) setSlot(match);
    }
  }, [defaultSlot]);

  useEffect(() => {
    if (isOpen && activeTab === 'library') {
      fetchLibrary();
    }
  }, [isOpen, activeTab]);

  const fetchLibrary = async () => {
    setLibraryLoading(true);
    try {
      const res = await api.get('/images');
      setLibraryImages(res.data.images || []);
    } catch (err) {
      console.error('Failed to fetch image library', err);
    } finally {
      setLibraryLoading(false);
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
      });
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  const onCropComplete = useCallback((_, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleCropAndUpload = async () => {
    if (!fileSrc) return;
    setUploading(true);

    try {
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

      canvas.width = slot.w || width;
      canvas.height = slot.h || height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(image, x, y, width, height, 0, 0, canvas.width, canvas.height);

      const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/webp', 0.92));
      const formData = new FormData();
      formData.append('image', blob, `${slot.id}.webp`);
      formData.append('slot', slot.id);
      formData.append('alt', altText || slot.label);
      formData.append('width', slot.w);
      formData.append('height', slot.h);
      formData.append('aspectRatio', slot.ratioText);

      const res = await api.post('/images/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data?.image?.url) {
        onSelect(res.data.image.url);
        onClose();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleSelectFromLibrary = (url) => {
    onSelect(url);
    onClose();
  };

  const handleApplyDirectUrl = (e) => {
    e.preventDefault();
    if (directUrl.trim()) {
      onSelect(directUrl.trim());
      onClose();
    }
  };

  if (!isOpen) return null;

  const filteredLibrary = libraryImages.filter((img) => {
    if (libraryFilter !== 'all' && img.slot !== libraryFilter) return false;
    if (librarySearch) {
      const q = librarySearch.toLowerCase();
      return (
        img.alt?.toLowerCase().includes(q) ||
        img.slot?.toLowerCase().includes(q) ||
        img.url?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="admin-dark fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#121218] rounded-3xl shadow-2xl border border-white/10 w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh] text-white">
        {/* Header with Tabs */}
        <div className="p-4 border-b border-white/10 bg-[#161622] flex items-center justify-between">
          <div className="flex items-center gap-1 bg-[#121218] p-1 rounded-xl border border-white/10 shadow-md">
            <button
              type="button"
              onClick={() => setActiveTab('upload')}
              className={`text-xs px-3 py-1.5 rounded-lg font-mono uppercase tracking-wider font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'upload'
                  ? 'bg-gold text-black font-bold shadow-md shadow-gold/20'
                  : 'text-[#8A8A85] hover:text-white'
              }`}
            >
              <Upload className="w-3.5 h-3.5" /> Upload & Crop
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('library')}
              className={`text-xs px-3 py-1.5 rounded-lg font-mono uppercase tracking-wider font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'library'
                  ? 'bg-gold text-black font-bold shadow-md shadow-gold/20'
                  : 'text-[#8A8A85] hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" /> Image Library
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('url')}
              className={`text-xs px-3 py-1.5 rounded-lg font-mono uppercase tracking-wider font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'url'
                  ? 'bg-gold text-black font-bold shadow-md shadow-gold/20'
                  : 'text-[#8A8A85] hover:text-white'
              }`}
            >
              <LinkIcon className="w-3.5 h-3.5" /> Direct URL
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-[#8A8A85] hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab 1: Upload & Crop */}
        {activeTab === 'upload' && (
          <div className="flex-1 overflow-y-auto flex flex-col">
            {!fileSrc ? (
              <div className="p-8 sm:p-12 flex flex-col items-center justify-center text-center space-y-4">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full max-w-md p-10 border-2 border-dashed border-border hover:border-gold rounded-2xl bg-cream/40 hover:bg-cream cursor-pointer transition-all flex flex-col items-center justify-center space-y-3 group"
                >
                  <div className="w-14 h-14 rounded-2xl bg-white border border-border shadow-xs flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Upload className="w-6 h-6 text-gold" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-navy">
                      Click to choose an image or drop file here
                    </p>
                    <p className="text-xs text-muted mt-1">
                      JPG, PNG, WebP up to 25MB. Will be cropped to {slot.ratioText}.
                    </p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>

                {/* Slot Selector before upload */}
                <div className="w-full max-w-md text-left bg-cream p-4 rounded-xl border border-border">
                  <label className="block text-xs font-semibold text-navy mb-1.5">
                    Target Crop Ratio:
                  </label>
                  <select
                    value={slot.id}
                    onChange={(e) => {
                      const found = SLOTS.find((s) => s.id === e.target.value);
                      if (found) setSlot(found);
                    }}
                    className="w-full px-3 py-2 rounded-lg border border-border text-xs bg-white text-navy focus:border-gold focus:outline-hidden"
                  >
                    {SLOTS.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.label} ({s.ratioText}) — {s.w}×{s.h}px
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ) : (
              <div className="flex flex-col flex-1">
                {/* Crop Canvas */}
                <div className="relative w-full h-80 bg-navy/95">
                  <Cropper
                    image={fileSrc}
                    crop={crop}
                    zoom={zoom}
                    aspect={slot.aspect}
                    onCropChange={setCrop}
                    onCropComplete={onCropComplete}
                    onZoomChange={setZoom}
                  />
                </div>

                {/* Controls */}
                <div className="p-4 bg-white border-t border-border space-y-3">
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

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-navy mb-1">
                        Aspect Ratio
                      </label>
                      <select
                        value={slot.id}
                        onChange={(e) => {
                          const found = SLOTS.find((s) => s.id === e.target.value);
                          if (found) setSlot(found);
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
                      <label className="block text-[11px] font-semibold text-navy mb-1">
                        Alt / Description
                      </label>
                      <input
                        type="text"
                        value={altText}
                        onChange={(e) => setAltText(e.target.value)}
                        placeholder="Image description..."
                        className="w-full px-2.5 py-1.5 rounded-lg border border-border text-xs focus:border-gold focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <button
                      type="button"
                      onClick={() => setFileSrc(null)}
                      className="text-xs text-muted hover:text-navy underline"
                    >
                      Choose Different Image
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg border border-border text-xs font-semibold text-muted hover:text-navy"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleCropAndUpload}
                        disabled={uploading}
                        className="btn-primary text-xs py-2 px-5 flex items-center gap-2 shadow-xs"
                      >
                        {uploading ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Sparkles className="w-3.5 h-3.5" />
                        )}
                        {uploading ? 'Uploading to Supabase...' : 'Crop & Use Image'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Image Library */}
        {activeTab === 'library' && (
          <div className="p-4 flex-1 overflow-y-auto space-y-4">
            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-muted absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={librarySearch}
                  onChange={(e) => setLibrarySearch(e.target.value)}
                  placeholder="Search assets..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-border bg-white text-xs text-navy focus:border-gold focus:outline-hidden"
                />
              </div>

              <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                <button
                  type="button"
                  onClick={() => setLibraryFilter('all')}
                  className={`text-[11px] px-2.5 py-1 rounded-lg border shrink-0 ${
                    libraryFilter === 'all'
                      ? 'bg-navy text-white border-navy font-bold'
                      : 'bg-white text-muted border-border hover:border-gold'
                  }`}
                >
                  All ({libraryImages.length})
                </button>
                {SLOTS.slice(0, 4).map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setLibraryFilter(s.id)}
                    className={`text-[11px] px-2.5 py-1 rounded-lg border shrink-0 ${
                      libraryFilter === s.id
                        ? 'bg-navy text-white border-navy font-bold'
                        : 'bg-white text-muted border-border hover:border-gold'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Grid */}
            {libraryLoading ? (
              <div className="p-12 text-center">
                <Loader2 className="w-6 h-6 text-gold animate-spin mx-auto mb-2" />
                <p className="text-xs text-muted">Loading image library...</p>
              </div>
            ) : filteredLibrary.length === 0 ? (
              <div className="p-12 text-center border-2 border-dashed border-border rounded-xl">
                <ImageIcon className="w-8 h-8 text-muted/50 mx-auto mb-2" />
                <p className="text-xs text-navy font-semibold">No images in library yet</p>
                <p className="text-[11px] text-muted mt-1 mb-3">
                  Upload an image using the first tab to store it in your library.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab('upload')}
                  className="btn-primary text-xs py-1.5 px-3"
                >
                  Upload New Image
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {filteredLibrary.map((img) => (
                  <div
                    key={img._id || img.id}
                    onClick={() => handleSelectFromLibrary(img.url)}
                    className="bg-cream rounded-xl border border-border overflow-hidden cursor-pointer group hover:border-gold hover:shadow-card transition-all flex flex-col"
                  >
                    <div className="aspect-[16/9] relative bg-cream-dark overflow-hidden">
                      <img
                        src={img.url}
                        alt={img.alt || 'Asset'}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-navy/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="bg-gold text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-xs flex items-center gap-1">
                          <Check className="w-3 h-3" /> Select
                        </span>
                      </div>
                      <span className="absolute top-1.5 left-1.5 bg-navy/80 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                        {img.aspectRatio || '16:9'}
                      </span>
                    </div>
                    <div className="p-2 text-[10px]">
                      <p className="font-semibold text-navy truncate">{img.alt || img.slot}</p>
                      <p className="text-muted">{img.width ? `${img.width}×${img.height}` : 'WebP'}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Direct URL */}
        {activeTab === 'url' && (
          <form onSubmit={handleApplyDirectUrl} className="p-6 space-y-4 flex-1">
            <div>
              <label className="block text-xs font-semibold text-navy mb-1.5">
                Paste Image URL:
              </label>
              <input
                type="url"
                value={directUrl}
                onChange={(e) => setDirectUrl(e.target.value)}
                placeholder="https://example.com/images/banner.jpg"
                className="w-full px-3 py-2 rounded-lg border border-border text-xs focus:border-gold focus:outline-hidden"
                required
              />
              <p className="text-[11px] text-muted mt-1">
                You can paste an external image link, a Supabase URL, or a local path like <code className="bg-cream px-1 py-0.5 rounded">/ayub-founder-full.jpg</code>.
              </p>
            </div>

            {directUrl && (
              <div className="bg-cream p-3 rounded-xl border border-border">
                <p className="text-[11px] font-semibold text-navy mb-2">Live Preview:</p>
                <div className="aspect-[16/9] max-h-48 rounded-lg overflow-hidden bg-white border border-border flex items-center justify-center">
                  <img
                    src={directUrl}
                    alt="Preview"
                    className="max-h-full max-w-full object-contain"
                    onError={(e) => (e.target.style.display = 'none')}
                  />
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-border">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg border border-border text-xs font-semibold text-muted hover:text-navy"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!directUrl.trim()}
                className="btn-primary text-xs py-2 px-5 disabled:opacity-50"
              >
                Use This Image URL
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
