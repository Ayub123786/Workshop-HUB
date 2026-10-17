import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  X,
  Calendar,
  Clock,
  Users,
  Share2,
  ExternalLink,
  CheckCircle2,
  BookOpen,
  ArrowRight,
  Check,
  Bookmark,
  Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AddToCalendarMenu from '../calendar/AddToCalendarMenu';
import { formatInTimezone, getSavedTimezone } from '../../lib/calendarExport';
import { getWorkshopStatus, getStatusBadgeConfig } from '../../lib/workshopStatus';
import { useBookmarks } from '../../lib/bookmarks';

export default function QuickViewDrawer({ workshop, isOpen, onClose, onReserve }) {
  const [copied, setCopied] = useState(false);
  const { isBookmarked, toggle } = useBookmarks();
  const timezone = getSavedTimezone();

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!workshop) return null;

  const status = getWorkshopStatus(workshop);
  const badge = getStatusBadgeConfig(status);
  const isPast = status === 'completed';
  const isSoldOut = status === 'sold-out';

  const seatsTotal = Number(workshop.seatsTotal ?? 100);
  const seatsBooked = Number(workshop.seatsBooked ?? 0);
  const seatsLeft = Math.max(0, seatsTotal - seatsBooked);
  const fillPercentage = seatsTotal > 0 ? Math.min(100, Math.round((seatsBooked / seatsTotal) * 100)) : 0;

  const formattedStart = formatInTimezone(workshop.startDate, timezone, 'full');

  const handleShare = () => {
    const url = `${window.location.origin}/w/${workshop.slug}`;
    if (navigator.share) {
      navigator.share({ title: workshop.title, url });
    } else {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Drawer Container */}
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="w-screen max-w-lg bg-[#111115] border-l border-white/10 shadow-[0_0_80px_rgba(0,0,0,0.9)] flex flex-col justify-between"
            >
              {/* Drawer Header */}
              <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-[#141418] shrink-0">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full ${badge.className}`}>
                    {badge.isLive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse mr-1 inline-block" />
                    )}
                    {badge.label}
                  </span>
                  {workshop.category && (
                    <span className="text-[10px] font-mono text-white/70 bg-white/[0.05] border border-white/10 px-2.5 py-0.5 rounded-full uppercase">
                      {workshop.category}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => toggle(workshop.slug)}
                    className={`p-2 rounded-full border transition-colors cursor-pointer ${
                      isBookmarked(workshop.slug)
                        ? 'bg-gold text-black border-gold shadow-md shadow-gold/20'
                        : 'border-white/10 text-white/50 hover:text-gold hover:bg-white/[0.08] bg-white/[0.03]'
                    }`}
                    title={isBookmarked(workshop.slug) ? 'Remove bookmark' : 'Save to bookmarks'}
                    aria-label="Bookmark workshop"
                  >
                    <Bookmark size={15} className={isBookmarked(workshop.slug) ? 'fill-current' : ''} />
                  </button>
                  <button
                    onClick={onClose}
                    className="p-2 rounded-full text-white/50 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
                    aria-label="Close drawer"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Drawer Body (Scrollable) */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* 16:10 Banner Image */}
                <div className="aspect-[16/10] rounded-2xl overflow-hidden border border-white/10 bg-black relative">
                  {workshop.bannerImage ? (
                    <img
                      src={workshop.bannerImage}
                      alt={workshop.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/30 text-xs font-mono uppercase">
                      {workshop.category || 'WORKSHOP'}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs font-mono text-white/80">
                    <span>{seatsLeft} SEATS REMAINING</span>
                    <span className="text-gold font-bold">LIVE Q4</span>
                  </div>
                </div>

                {/* Title & Short Description */}
                <div>
                  <h3 className="font-bold text-xl sm:text-2xl text-white leading-snug mb-2">
                    {workshop.title}
                  </h3>
                  {workshop.shortDescription && (
                    <p className="text-xs sm:text-sm text-white/60 leading-relaxed font-sans">
                      {workshop.shortDescription}
                    </p>
                  )}
                </div>

                {/* Date & Time */}
                <div className="glass-strong rounded-2xl p-4 space-y-2 text-xs border border-white/10">
                  <div className="flex items-start gap-2 text-white">
                    <Calendar size={14} className="text-gold mt-0.5 shrink-0" />
                    <div>
                      <span className="font-semibold font-mono block">{formattedStart || 'Date To Be Announced'}</span>
                      <span className="text-[11px] font-mono text-white/40">Adjusted to {timezone}</span>
                    </div>
                  </div>

                  {workshop.timezones?.length > 0 && (
                    <div className="flex items-center gap-2 pt-2 border-t border-white/10 text-[11px] font-mono text-white/50">
                      <Clock size={13} className="text-gold shrink-0" />
                      <span>{workshop.timezones.map((t) => `${t.city} ${t.time}`).join(' · ')}</span>
                    </div>
                  )}
                </div>

                {/* Seats Progress Bar */}
                {!isPast && (
                  <div className="border border-white/10 rounded-2xl p-4 bg-[#141418]">
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="font-mono text-white/70 flex items-center gap-1.5 uppercase text-[11px]">
                        <Users size={13} className="text-gold" />
                        <span>Room Capacity</span>
                      </span>
                      <span className="font-mono text-xs">
                        {isSoldOut ? (
                          <strong className="text-red-400">Sold Out</strong>
                        ) : (
                          <span>
                            <strong className="text-gold">{seatsLeft}</strong> spots remaining
                          </span>
                        )}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          isSoldOut ? 'bg-red-500' : fillPercentage >= 80 ? 'bg-amber-400' : 'bg-gold'
                        }`}
                        style={{ width: `${fillPercentage}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Trainer Highlight */}
                <div className="flex items-center gap-3.5 p-4 bg-[#141418] border border-white/10 rounded-2xl">
                  <img
                    src="/ayub-founder-full.png"
                    alt="Ayub"
                    className="w-12 h-12 rounded-full object-cover border border-gold/40 shrink-0 bg-[#16161e]"
                  />
                  <div>
                    <h4 className="font-bold text-white text-sm">Ayub.</h4>
                    <p className="text-[11px] text-white/50 leading-tight mt-0.5">
                      Due diligence lab for PE/VC funds · Ex-KPMG, ex-BDO Binder
                    </p>
                  </div>
                </div>

                {/* What You'll Build & Learn */}
                <div>
                  <h4 className="text-[11px] font-mono font-bold text-gold uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                    <BookOpen size={13} />
                    <span>What You'll Build & Master</span>
                  </h4>
                  <ul className="space-y-2 text-xs text-white/70">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 size={14} className="text-gold mt-0.5 shrink-0" />
                      <span>Production orchestration architectures for deal flow memo drafting.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 size={14} className="text-gold mt-0.5 shrink-0" />
                      <span>Stress-tested multi-model agents running on actual confidential PE records.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 size={14} className="text-gold mt-0.5 shrink-0" />
                      <span>Live prompt templates, evaluation harnesses, and full session recordings.</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Drawer Footer Actions */}
              <div className="p-4 sm:p-5 border-t border-white/10 bg-[#141418] shrink-0 space-y-2.5">
                <div className="flex items-center gap-2">
                  <AddToCalendarMenu workshop={workshop} />

                  <button
                    onClick={handleShare}
                    className="p-2.5 rounded-full border border-white/10 text-white/70 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
                    title="Share Master Class"
                  >
                    {copied ? <Check size={14} className="text-emerald-400" /> : <Share2 size={14} />}
                  </button>

                  <Link
                    to={`/w/${workshop.slug}${isPast ? '' : '?reserve=true'}`}
                    onClick={onClose}
                    className="flex-1 bg-gold hover:bg-gold-light text-black text-xs font-bold py-2.5 px-4 text-center justify-center rounded-full flex items-center gap-1.5 transition-transform hover:scale-105 active:scale-95 shadow-md shadow-gold/25"
                  >
                    <span>{isPast ? 'Get Resources' : isSoldOut ? 'Join Waitlist' : 'Reserve Your Spot'}</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>

                <div className="text-center pt-1">
                  <Link
                    to={`/w/${workshop.slug}`}
                    onClick={onClose}
                    className="text-[11px] font-mono text-white/40 hover:text-gold hover:underline inline-flex items-center gap-1"
                  >
                    <span>View full curriculum page</span>
                    <ExternalLink size={10} />
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
