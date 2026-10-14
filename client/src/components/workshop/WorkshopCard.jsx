import { Calendar, Clock, Users, Bookmark } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getWorkshopStatus, getStatusBadgeConfig } from '../../lib/workshopStatus';
import { useBookmarks } from '../../lib/bookmarks';

export default function WorkshopCard({ workshop, onQuickView }) {
  if (!workshop) return null;

  const { isBookmarked, toggle } = useBookmarks();
  const saved = isBookmarked(workshop.slug);

  const status = getWorkshopStatus(workshop);
  const badgeConfig = getStatusBadgeConfig(status);

  const seatsTotal = Number(workshop.seatsTotal ?? 100);
  const seatsBooked = Number(workshop.seatsBooked ?? 0);
  const seatsLeft = Math.max(0, seatsTotal - seatsBooked);
  const fillPercentage = seatsTotal > 0 ? Math.min(100, Math.round((seatsBooked / seatsTotal) * 100)) : 0;

  const isPast = status === 'completed';
  const isSoldOut = status === 'sold-out';

  const startDate = workshop.startDate
    ? new Date(workshop.startDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : null;

  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      className="h-full flex flex-col"
    >
      <div className="h-full flex flex-col bg-white border border-[#E8E8E8] rounded-2xl overflow-hidden hover:border-[#C8A24F]/60 transition-colors duration-200 group shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)]">
        {/* Banner Image with Fixed 16:10 Ratio */}
        <div className="relative aspect-[16/10] overflow-hidden bg-cream-dark shrink-0">
          {workshop.bannerImage ? (
            <img
              src={workshop.bannerImage}
              alt={workshop.title}
              className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-[#F5F5F3] flex items-center justify-center text-muted">
              <span className="text-xs font-mono tracking-widest text-[#9CA3AF] uppercase">
                {workshop.category || 'Workshop'}
              </span>
            </div>
          )}

          {/* Category Chip (Top-Left): White pill with thin border */}
          {workshop.category && (
            <div className="absolute top-3 left-3 z-10">
              <span className="inline-flex items-center bg-white/95 backdrop-blur-xs text-navy text-[11px] font-medium px-2.5 py-0.5 rounded-full border border-[#E8E8E8] shadow-2xs">
                {workshop.category}
              </span>
            </div>
          )}

          {/* Status Badge & Bookmark (Top-Right) */}
          <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5">
            <span
              className={`inline-flex items-center text-[11px] px-2.5 py-0.5 rounded-full ${badgeConfig.className}`}
            >
              {badgeConfig.isLive && (
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse mr-1.5 inline-block" />
              )}
              {badgeConfig.label}
            </span>

            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggle(workshop.slug);
              }}
              aria-label={saved ? 'Remove bookmark' : 'Bookmark workshop'}
              className={`w-6 h-6 rounded-full border flex items-center justify-center transition-colors shadow-2xs ${
                saved
                  ? 'bg-gold text-white border-gold'
                  : 'bg-white/95 backdrop-blur-xs text-navy/70 border-[#E8E8E8] hover:text-gold hover:border-gold'
              }`}
              title={saved ? 'Saved to bookmarks' : 'Save workshop'}
            >
              <Bookmark size={11} className={saved ? 'fill-current' : ''} />
            </button>
          </div>
        </div>

        {/* Card Body - Flex Column with equal height */}
        <div className="p-5 flex-1 flex flex-col min-h-0">
          {/* Title */}
          <Link to={`/w/${workshop.slug}`}>
            <h3 className="font-semibold text-navy text-base leading-snug mb-2 line-clamp-2 group-hover:text-gold transition-colors duration-150">
              {workshop.title}
            </h3>
          </Link>

          {/* Short Description */}
          {workshop.shortDescription && (
            <p className="text-xs text-muted leading-relaxed mb-4 line-clamp-2">
              {workshop.shortDescription}
            </p>
          )}

          {/* Date, Timezones, Speaker Meta */}
          <div className="space-y-1.5 mb-4 text-xs text-muted">
            {startDate && (
              <div className="flex items-center gap-2">
                <Calendar size={13} className="shrink-0 text-navy/70" />
                <span>{startDate}</span>
              </div>
            )}
            {workshop.timezones?.length > 0 && (
              <div className="flex items-center gap-2">
                <Clock size={13} className="shrink-0 text-navy/70" />
                <span className="truncate">
                  {workshop.timezones.map((t) => `${t.city} ${t.time}`).join(' · ')}
                </span>
              </div>
            )}
          </div>

          {/* Seats Progress Bar (Only for upcoming / active sessions) */}
          {!isPast && (
            <div className="mb-4 pt-1">
              <div className="flex items-center justify-between text-[11px] text-muted mb-1.5">
                <span className="flex items-center gap-1 font-medium">
                  <Users size={12} className="shrink-0 text-navy/70" />
                  {isSoldOut ? (
                    <span className="text-[#0A0A0A] font-semibold">Capacity reached (Sold Out)</span>
                  ) : (
                    <span>
                      <strong className="text-navy font-semibold">{seatsLeft}</strong> {seatsLeft === 1 ? 'spot' : 'spots'} left
                    </span>
                  )}
                </span>
                <span className="font-mono text-[10px] text-muted">
                  {seatsBooked}/{seatsTotal}
                </span>
              </div>
              <div className="w-full h-1.5 bg-[#F0F0F0] rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isSoldOut
                      ? 'bg-navy'
                      : fillPercentage >= 80
                      ? 'bg-amber-500'
                      : 'bg-gold'
                  }`}
                  style={{ width: `${fillPercentage}%` }}
                />
              </div>
            </div>
          )}

          {/* Card CTA Footer - Pinned to bottom */}
          <div className="mt-auto pt-4 border-t border-[#E8E8E8] flex items-center justify-between gap-2">
            {isPast ? (
              <Link
                to={`/w/${workshop.slug}`}
                className="w-full text-center py-2 px-3 rounded-lg border border-[#E8E8E8] text-xs font-semibold text-navy hover:border-gold hover:text-gold transition-colors"
              >
                View Resources & Recording →
              </Link>
            ) : isSoldOut ? (
              <Link
                to={`/w/${workshop.slug}#waitlist`}
                className="w-full text-center py-2 px-3 rounded-lg border border-navy bg-navy text-white text-xs font-semibold hover:bg-black transition-colors"
              >
                Join Waitlist →
              </Link>
            ) : (
              <div className="w-full flex items-center gap-2">
                {onQuickView && (
                  <button
                    type="button"
                    onClick={() => onQuickView(workshop)}
                    className="flex-1 py-2 px-2.5 rounded-lg border border-[#E8E8E8] text-xs font-semibold text-navy hover:bg-cream transition-colors"
                  >
                    Quick View
                  </button>
                )}
                <Link
                  to={`/w/${workshop.slug}`}
                  className="flex-1 btn-primary text-xs py-2 px-3 text-center justify-center font-semibold"
                >
                  Reserve Spot
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
