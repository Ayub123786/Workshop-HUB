import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  X,
  Calendar,
  Clock,
  Users,
  User,
  Share2,
  ExternalLink,
  CheckCircle2,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AddToCalendarMenu from '../calendar/AddToCalendarMenu';
import { formatInTimezone, getSavedTimezone } from '../../lib/calendarExport';
import { getWorkshopStatus, getStatusBadgeConfig } from '../../lib/workshopStatus';

export default function QuickViewDrawer({ workshop, isOpen, onClose, onReserve }) {
  const [copied, setCopied] = useState(false);
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
            className="absolute inset-0 bg-navy/50 backdrop-blur-xs"
          />

          {/* Drawer Container */}
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="w-screen max-w-lg bg-white border-l border-[#E8E8E8] shadow-card-hover flex flex-col justify-between"
            >
              {/* Drawer Header */}
              <div className="px-6 py-4 border-b border-[#E8E8E8] flex items-center justify-between bg-[#FAF9F6] shrink-0">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] px-2.5 py-0.5 rounded-full ${badge.className}`}>
                    {badge.isLive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse mr-1 inline-block" />
                    )}
                    {badge.label}
                  </span>
                  {workshop.category && (
                    <span className="text-[10px] font-medium text-navy bg-white border border-[#E8E8E8] px-2.5 py-0.5 rounded-full">
                      {workshop.category}
                    </span>
                  )}
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg text-muted hover:text-navy hover:bg-white transition-colors"
                  aria-label="Close drawer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Drawer Body (Scrollable) */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* 16:10 Banner Image */}
                <div className="aspect-[16/10] rounded-xl overflow-hidden border border-[#E8E8E8] bg-cream-dark">
                  {workshop.bannerImage ? (
                    <img
                      src={workshop.bannerImage}
                      alt={workshop.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted text-xs font-mono uppercase">
                      {workshop.category || 'Workshop'}
                    </div>
                  )}
                </div>

                {/* Title & Short Description */}
                <div>
                  <h3 className="text-xl font-bold text-navy leading-snug mb-2">
                    {workshop.title}
                  </h3>
                  {workshop.shortDescription && (
                    <p className="text-xs sm:text-sm text-muted leading-relaxed">
                      {workshop.shortDescription}
                    </p>
                  )}
                </div>

                {/* Date & Time in User's Timezone */}
                <div className="bg-[#FAF9F6] border border-[#E8E8E8] rounded-xl p-4 space-y-2 text-xs">
                  <div className="flex items-start gap-2 text-navy">
                    <Calendar size={14} className="text-gold mt-0.5 shrink-0" />
                    <div>
                      <span className="font-semibold block">{formattedStart || 'Date To Be Announced'}</span>
                      <span className="text-[11px] text-muted">Converted to your selected timezone</span>
                    </div>
                  </div>

                  {workshop.timezones?.length > 0 && (
                    <div className="flex items-center gap-2 pt-2 border-t border-[#E8E8E8]/60 text-[11px] text-muted">
                      <Clock size={13} className="text-navy/60 shrink-0" />
                      <span>{workshop.timezones.map((t) => `${t.city} ${t.time}`).join(' · ')}</span>
                    </div>
                  )}
                </div>

                {/* Seats Progress */}
                {!isPast && (
                  <div className="border border-[#E8E8E8] rounded-xl p-4 bg-white">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-semibold text-navy flex items-center gap-1.5">
                        <Users size={14} className="text-gold" />
                        <span>Seat Capacity</span>
                      </span>
                      <span className="font-mono text-xs">
                        {isSoldOut ? (
                          <strong className="text-navy">Sold Out</strong>
                        ) : (
                          <span>
                            <strong className="text-navy">{seatsLeft}</strong> spots remaining
                          </span>
                        )}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-[#F0F0F0] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          isSoldOut ? 'bg-navy' : fillPercentage >= 80 ? 'bg-amber-500' : 'bg-gold'
                        }`}
                        style={{ width: `${fillPercentage}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Trainer Highlight */}
                <div className="flex items-center gap-3 p-3.5 bg-cream border border-[#E8E8E8] rounded-xl">
                  <img
                    src="/ayub-founder-full.jpg"
                    alt="Ayub"
                    className="w-12 h-12 rounded-full object-cover border border-[#E8E8E8] shrink-0"
                  />
                  <div>
                    <h4 className="font-bold text-navy text-xs sm:text-sm">Ayub.</h4>
                    <p className="text-[11px] text-muted leading-tight">
                      Due diligence lab for PE/VC funds · Ex-KPMG, ex-BDO Binder
                    </p>
                  </div>
                </div>

                {/* Key Takeaways / What You'll Learn */}
                <div>
                  <h4 className="text-xs font-bold text-navy uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <BookOpen size={13} className="text-gold" />
                    <span>What You'll Build & Learn</span>
                  </h4>
                  <ul className="space-y-1.5 text-xs text-muted">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 size={13} className="text-emerald-600 mt-0.5 shrink-0" />
                      <span>Production orchestration architectures for deal flow memo drafting.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 size={13} className="text-emerald-600 mt-0.5 shrink-0" />
                      <span>Stress-tested multi-model agents running on actual confidential PE records.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 size={13} className="text-emerald-600 mt-0.5 shrink-0" />
                      <span>Live prompt templates, evaluation harnesses, and full session recordings.</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Drawer Footer Actions */}
              <div className="p-4 sm:p-5 border-t border-[#E8E8E8] bg-white shrink-0 space-y-2">
                <div className="flex items-center gap-2">
                  <AddToCalendarMenu workshop={workshop} />

                  <button
                    onClick={handleShare}
                    className="p-2 rounded-lg border border-[#E8E8E8] text-navy hover:bg-cream transition-colors"
                    title="Share Master Class"
                  >
                    {copied ? <Check size={14} className="text-emerald-600" /> : <Share2 size={14} />}
                  </button>

                  <Link
                    to={`/w/${workshop.slug}`}
                    onClick={onClose}
                    className="flex-1 btn-primary text-xs py-2.5 px-3 text-center justify-center font-semibold flex items-center gap-1"
                  >
                    <span>{isPast ? 'Get Resources' : isSoldOut ? 'Join Waitlist' : 'Reserve Your Spot'}</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>

                <div className="text-center pt-1">
                  <Link
                    to={`/w/${workshop.slug}`}
                    onClick={onClose}
                    className="text-[11px] font-medium text-muted hover:text-navy hover:underline inline-flex items-center gap-1"
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
