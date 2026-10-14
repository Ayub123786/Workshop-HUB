import { Calendar, Clock, MapPin, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

function getStatusLabel(workshop) {
  const now = new Date();
  if (workshop.seatsBooked >= workshop.seatsTotal) return 'sold-out';
  if (workshop.startDate && now < new Date(workshop.startDate)) return 'upcoming';
  if (workshop.startDate && workshop.endDate) {
    const start = new Date(workshop.startDate);
    const end = new Date(workshop.endDate);
    if (now >= start && now <= end) return 'live';
    if (now > end) return 'completed';
  }
  return workshop.status;
}

function StatusBadge({ status }) {
  const labels = {
    upcoming: 'Upcoming',
    live: '🔴 Live Now',
    completed: 'Completed',
    'sold-out': 'Sold Out',
    draft: 'Draft',
    published: 'Published',
  };
  return (
    <span className={`status-${status}`}>
      {labels[status] || status}
    </span>
  );
}

export default function WorkshopCard({ workshop }) {
  const status = getStatusLabel(workshop);
  const seatsLeft = Math.max(0, workshop.seatsTotal - workshop.seatsBooked);
  const isPast = status === 'completed';
  const isSoldOut = status === 'sold-out';

  const startDate = workshop.startDate
    ? new Date(workshop.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : null;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Link to={`/w/${workshop.slug}`} className="block bg-white border border-border rounded-card overflow-hidden group hover:shadow-card-hover transition-shadow duration-200">
        {/* Banner Image */}
        <div className="relative aspect-[16/9] overflow-hidden bg-cream-dark">
          {workshop.bannerImage ? (
            <img
              src={workshop.bannerImage}
              alt={workshop.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-cream-dark to-border flex items-center justify-center">
              <span className="text-4xl">📚</span>
            </div>
          )}

          {/* Status overlay badge */}
          <div className="absolute top-3 right-3">
            <StatusBadge status={status} />
          </div>

          {/* Category chip */}
          {workshop.category && (
            <div className="absolute top-3 left-3">
              <span className="bg-white/90 backdrop-blur-sm text-navy text-xs font-medium px-2.5 py-1 rounded-full border border-border">
                {workshop.category}
              </span>
            </div>
          )}
        </div>

        {/* Card Body */}
        <div className="p-5">
          <h3 className="font-semibold text-navy text-base leading-snug mb-2 line-clamp-2 group-hover:text-gold transition-colors duration-200">
            {workshop.title}
          </h3>

          {workshop.shortDescription && (
            <p className="text-sm text-muted leading-relaxed mb-4 line-clamp-2">
              {workshop.shortDescription}
            </p>
          )}

          {/* Meta */}
          <div className="flex flex-col gap-1.5 mb-4">
            {startDate && (
              <div className="flex items-center gap-2 text-xs text-muted">
                <Calendar size={13} className="shrink-0" />
                <span>{startDate}</span>
              </div>
            )}
            {workshop.timezones?.length > 0 && (
              <div className="flex items-center gap-2 text-xs text-muted">
                <Clock size={13} className="shrink-0" />
                <span>{workshop.timezones.map(t => `${t.city} ${t.time}`).join(' · ')}</span>
              </div>
            )}
            {!isSoldOut && !isPast && (
              <div className="flex items-center gap-2 text-xs text-muted">
                <Users size={13} className="shrink-0" />
                <span>{seatsLeft} {seatsLeft === 1 ? 'seat' : 'seats'} left</span>
              </div>
            )}
          </div>

          {/* CTA */}
          <div className="pt-3 border-t border-border">
            {isPast ? (
              <span className="text-sm font-medium text-gold">
                Get Resources →
              </span>
            ) : isSoldOut ? (
              <span className="text-sm font-medium text-muted">
                Sold Out — Join Waitlist →
              </span>
            ) : (
              <span className="text-sm font-medium text-navy group-hover:text-gold transition-colors">
                View Details →
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
