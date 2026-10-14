/**
 * Unified Workshop Status Logic for Minimal Light Workshop Hub
 *
 * Rules:
 * - After end date = 'completed' (NEVER 'sold-out' or 'upcoming', no waitlist)
 * - Between start & end = 'live'
 * - Before start:
 *    - 0 seats left = 'sold-out' (waitlist eligible)
 *    - <= 20% seats left = 'few-spots'
 *    - otherwise = 'upcoming'
 */

export function getWorkshopStatus(workshop) {
  if (!workshop) return 'upcoming';

  const now = new Date();
  const seatsTotal = Number(workshop.seatsTotal ?? 100);
  const seatsBooked = Number(workshop.seatsBooked ?? 0);
  const seatsLeft = Math.max(0, seatsTotal - seatsBooked);

  const start = workshop.startDate ? new Date(workshop.startDate) : null;
  // If no endDate provided, assume 4 hours session duration from start
  const end = workshop.endDate
    ? new Date(workshop.endDate)
    : start
    ? new Date(start.getTime() + 4 * 60 * 60 * 1000)
    : null;

  // 1. Completed if past end time (or past start if no end defined)
  if (end && now > end) {
    return 'completed';
  }

  // 2. Live if currently happening
  if (start && end && now >= start && now <= end) {
    return 'live';
  }

  // 3. Upcoming events: check capacity
  if (seatsLeft === 0) {
    return 'sold-out';
  }

  if (seatsTotal > 0 && seatsLeft / seatsTotal <= 0.2) {
    return 'few-spots';
  }

  return 'upcoming';
}

/**
 * Returns user-facing badge configuration for Minimal Light design:
 * Solid pill background, high-contrast readable text, no gradients.
 */
export function getStatusBadgeConfig(status) {
  switch (status) {
    case 'live':
      return {
        label: 'Live Now',
        isLive: true,
        className: 'bg-white text-navy border border-red-200 shadow-2xs font-semibold',
      };
    case 'few-spots':
      return {
        label: 'Few Spots Left',
        className: 'bg-amber-500 text-white font-semibold shadow-2xs',
      };
    case 'sold-out':
      return {
        label: 'Sold Out',
        className: 'bg-[#0A0A0A] text-white font-semibold shadow-2xs',
      };
    case 'completed':
      return {
        label: 'Completed',
        className: 'bg-[#737373] text-white font-medium shadow-2xs',
      };
    case 'upcoming':
    default:
      return {
        label: 'Upcoming',
        className: 'bg-gold text-navy font-semibold shadow-2xs',
      };
  }
}
