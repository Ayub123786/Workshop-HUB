import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Check, Share2, MessageCircle, Mail } from 'lucide-react';

function LinkedInIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76c-.97 0-1.75-.79-1.75-1.76s.78-1.75 1.75-1.75 1.76.78 1.76 1.75-.79 1.76-1.76 1.76m1.4 9.74v-8.37H5.06v8.37z" />
    </svg>
  );
}

export default function ShareModal({ isOpen, onClose, workshop }) {
  const [copied, setCopied] = useState(false);
  if (!isOpen) return null;

  const url = window.location.href;
  const title = workshop?.title || 'Executive Master Class';
  const text = `Check out this master class: ${title}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareLinks = [
    {
      name: 'LinkedIn',
      icon: LinkedInIcon,
      color: 'bg-[#0077b5] text-white',
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    },
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      color: 'bg-[#25D366] text-white',
      href: `https://api.whatsapp.com/send?text=${encodeURIComponent(text + ' ' + url)}`,
    },
    {
      name: 'Email',
      icon: Mail,
      color: 'bg-navy text-white',
      href: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(text + '\n\n' + url)}`,
    },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-navy/60 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative bg-white rounded-2xl shadow-xl border border-border w-full max-w-sm overflow-hidden z-10 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Share2 className="w-5 h-5 text-gold" />
              <h3 className="text-base font-bold text-navy">Share Workshop</h3>
            </div>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-cream hover:bg-cream-dark flex items-center justify-center text-muted transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-muted mb-4 line-clamp-2">
            {workshop?.title}
          </p>

          <div className="grid grid-cols-3 gap-3 mb-5">
            {shareLinks.map((item) => (
              <a
                key={item.name}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex flex-col items-center justify-center p-3 rounded-xl border border-border/40 hover:scale-105 transition-transform ${item.color}`}
              >
                <item.icon className="w-5 h-5 mb-1" />
                <span className="text-[11px] font-semibold">{item.name}</span>
              </a>
            ))}
          </div>

          <div className="relative flex items-center">
            <input
              type="text"
              readOnly
              value={url}
              className="w-full pl-3 pr-20 py-2 rounded-lg border border-border bg-cream text-xs text-muted select-all focus:outline-none"
            />
            <button
              onClick={handleCopy}
              className="absolute right-1 top-1 bottom-1 px-3 bg-navy text-white hover:bg-navy/90 rounded-md text-xs font-medium flex items-center gap-1 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
