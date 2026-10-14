/**
 * Calendar Link Generation & Timezone Helpers (RFC 5545 compliant)
 */

export const TIMEZONE_OPTIONS = [
  { id: 'local', label: 'My Time Zone', tz: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC' },
  { id: 'dubai', label: 'Dubai (GST)', tz: 'Asia/Dubai' },
  { id: 'newyork', label: 'New York (EST)', tz: 'America/New_York' },
  { id: 'london', label: 'London (GMT)', tz: 'Europe/London' },
];

export function getSavedTimezone() {
  const saved = localStorage.getItem('workshop_hub_tz');
  if (saved) return saved;
  return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Dubai';
}

export function setSavedTimezone(tz) {
  localStorage.setItem('workshop_hub_tz', tz);
}

export function formatInTimezone(dateInput, tz, formatStyle = 'short') {
  if (!dateInput) return '';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return '';

  try {
    if (formatStyle === 'time-only') {
      return new Intl.DateTimeFormat('en-US', {
        timeZone: tz,
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }).format(date);
    }

    if (formatStyle === 'full') {
      return new Intl.DateTimeFormat('en-US', {
        timeZone: tz,
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }).format(date);
    }

    return new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  } catch (e) {
    return date.toLocaleString();
  }
}

// Convert Date to UTC format YYYYMMDDTHHMMSSZ for ICS & Google Calendar
function toUtcString(d) {
  const date = new Date(d);
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

export function getGoogleCalendarUrl(workshop) {
  if (!workshop?.startDate) return '#';
  const start = new Date(workshop.startDate);
  const end = workshop.endDate
    ? new Date(workshop.endDate)
    : new Date(start.getTime() + 4 * 60 * 60 * 1000);

  const title = encodeURIComponent(workshop.title || 'Master Class');
  const details = encodeURIComponent(
    `${workshop.shortDescription || ''}\n\nJoin executive session: ${window.location.origin}/w/${workshop.slug}`
  );
  const location = encodeURIComponent('Live Interactive Stream & Lab');

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${toUtcString(
    start
  )}/${toUtcString(end)}&details=${details}&location=${location}`;
}

export function getOutlookCalendarUrl(workshop) {
  if (!workshop?.startDate) return '#';
  const start = new Date(workshop.startDate);
  const end = workshop.endDate
    ? new Date(workshop.endDate)
    : new Date(start.getTime() + 4 * 60 * 60 * 1000);

  const subject = encodeURIComponent(workshop.title || 'Master Class');
  const body = encodeURIComponent(
    `${workshop.shortDescription || ''}\n\nSession link: ${window.location.origin}/w/${workshop.slug}`
  );

  return `https://outlook.live.com/calendar/0/deeplink/compose?path=/calendar/action/compose&rru=addevent&subject=${subject}&startdt=${start.toISOString()}&enddt=${end.toISOString()}&body=${body}&location=Online`;
}

export function downloadIcsFile(workshop) {
  if (!workshop?.startDate) return;
  const start = new Date(workshop.startDate);
  const end = workshop.endDate
    ? new Date(workshop.endDate)
    : new Date(start.getTime() + 4 * 60 * 60 * 1000);

  const uid = `${workshop.slug || workshop.id || Date.now()}@workshop-hub`;
  const now = toUtcString(new Date());

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Workshop Hub//Executive Master Classes//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${now}`,
    `DTSTART:${toUtcString(start)}`,
    `DTEND:${toUtcString(end)}`,
    `SUMMARY:${workshop.title || 'Workshop Master Class'}`,
    `DESCRIPTION:${(workshop.shortDescription || '').replace(/\n/g, '\\n')}\\n\\nCurriculum Link: ${window.location.origin}/w/${workshop.slug}`,
    'LOCATION:Live Online Lab',
    'STATUS:CONFIRMED',
    'BEGIN:VALARM',
    'TRIGGER:-PT1H',
    'ACTION:DISPLAY',
    'DESCRIPTION:Reminder: Master Class starts in 1 hour',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${workshop.slug || 'masterclass'}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
