import { useState } from 'react';
import { Image as ImageIcon, Upload, X, ExternalLink } from 'lucide-react';
import ImagePickerModal from './ImagePickerModal';

export default function ImageField({
  label = 'Image',
  value = '',
  onChange,
  slotHint = 'hero-banner',
  helperText = '',
  placeholder = 'https://... or /image.jpg',
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-xs font-semibold text-navy uppercase tracking-wider">
          {label}
        </label>
      )}

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-cream/60 p-2.5 rounded-xl border border-border">
        {/* Thumbnail Preview */}
        <div className="w-20 h-14 sm:w-24 sm:h-16 rounded-lg bg-cream-dark border border-border overflow-hidden shrink-0 flex items-center justify-center relative group">
          {value ? (
            <>
              <img
                src={value}
                alt="Preview"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
              <a
                href={value}
                target="_blank"
                rel="noreferrer"
                className="absolute inset-0 bg-navy/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                title="Open in new tab"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center text-muted">
              <ImageIcon className="w-5 h-5 opacity-40" />
              <span className="text-[9px] uppercase font-bold opacity-60 mt-0.5">No Image</span>
            </div>
          )}
        </div>

        {/* Input + Action Buttons */}
        <div className="flex-1 w-full space-y-2">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              className="flex-1 px-3 py-1.5 rounded-lg border border-border bg-white text-navy text-xs focus:border-gold focus:outline-hidden font-mono"
            />
            {value && (
              <button
                type="button"
                onClick={() => onChange('')}
                className="p-1.5 rounded-lg border border-border bg-white text-muted hover:text-red-600 hover:bg-red-50 transition-colors"
                title="Remove Image"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="btn-secondary text-[11px] py-1 px-3 inline-flex items-center gap-1.5 shadow-2xs hover:border-gold"
            >
              <Upload className="w-3 h-3 text-gold" />
              <span>{value ? 'Change / Crop Image' : 'Upload or Choose Image'}</span>
            </button>
            {helperText && (
              <span className="text-[10px] text-muted">{helperText}</span>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      <ImagePickerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelect={(newUrl) => onChange(newUrl)}
        defaultSlot={slotHint}
      />
    </div>
  );
}
