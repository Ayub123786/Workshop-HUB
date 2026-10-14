import { useState } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
} from 'date-fns';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  Users,
  Edit,
} from 'lucide-react';

export default function AdminWorkshopsCalendar({ workshops = [], onReschedule, onEdit }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const getDayWorkshops = (day) => {
    return workshops.filter((w) => {
      if (!w.startDate) return false;
      const wDate = new Date(w.startDate);
      return isSameDay(wDate, day);
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-border shadow-xs overflow-hidden">
      {/* Calendar Header */}
      <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between flex-wrap gap-3 bg-[#FAFAFA]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-cream border border-border flex items-center justify-center text-gold">
            <CalendarIcon size={18} />
          </div>
          <div>
            <h2 className="text-base font-bold text-navy">
              {format(currentMonth, 'MMMM yyyy')}
            </h2>
            <p className="text-[11px] text-muted">
              {workshops.filter((w) => w.startDate).length} master classes scheduled
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentMonth(new Date())}
            className="px-3 py-1.5 rounded-lg border border-border bg-white text-xs font-semibold text-navy hover:bg-cream transition-colors"
          >
            Today
          </button>
          <div className="flex items-center border border-border rounded-lg bg-white overflow-hidden">
            <button
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className="p-1.5 hover:bg-cream text-navy transition-colors"
              title="Previous Month"
            >
              <ChevronLeft size={16} />
            </button>
            <div className="w-[1px] h-4 bg-border" />
            <button
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="p-1.5 hover:bg-cream text-navy transition-colors"
              title="Next Month"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Days of Week Header */}
      <div className="grid grid-cols-7 border-b border-border bg-[#FBFBFA] text-center text-[11px] font-bold text-muted uppercase tracking-wider py-2.5">
        <span>Sun</span>
        <span>Mon</span>
        <span>Tue</span>
        <span>Wed</span>
        <span>Thu</span>
        <span>Fri</span>
        <span>Sat</span>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-border/60 bg-white">
        {days.map((day) => {
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isToday = isSameDay(day, new Date());
          const dayWorkshops = getDayWorkshops(day);

          return (
            <div
              key={day.toISOString()}
              className={`min-h-[110px] p-2 flex flex-col transition-colors ${
                !isCurrentMonth ? 'bg-[#FAF9F6]/40 text-muted/50' : 'bg-white text-navy'
              } hover:bg-cream/30`}
            >
              {/* Day header */}
              <div className="flex items-center justify-between mb-1.5">
                <span
                  className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full ${
                    isToday
                      ? 'bg-navy text-white font-extrabold shadow-2xs'
                      : isCurrentMonth
                      ? 'text-navy'
                      : 'text-muted/60'
                  }`}
                >
                  {format(day, 'd')}
                </span>
                {dayWorkshops.length > 0 && (
                  <span className="text-[10px] font-mono text-muted">
                    {dayWorkshops.length} {dayWorkshops.length === 1 ? 'event' : 'events'}
                  </span>
                )}
              </div>

              {/* Workshops Cards for this day */}
              <div className="space-y-1.5 flex-1">
                {dayWorkshops.map((w) => {
                  const isPublished = w.status === 'published';
                  const startTime = w.startDate ? format(new Date(w.startDate), 'HH:mm') : '';

                  return (
                    <div
                      key={w._id || w.id}
                      onClick={() => onReschedule && onReschedule(w)}
                      className={`group p-2 rounded-lg border text-left cursor-pointer transition-all ${
                        isPublished
                          ? 'bg-white border-[#E8E8E8] hover:border-gold hover:shadow-xs'
                          : 'bg-[#F9F9F9] border-[#E8E8E8] opacity-80 hover:opacity-100'
                      }`}
                      title="Click to reschedule or adjust status"
                    >
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span
                          className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded ${
                            isPublished
                              ? 'bg-gold/15 text-gold border border-gold/30'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {w.status}
                        </span>
                        {startTime && (
                          <span className="text-[10px] font-mono text-muted flex items-center gap-0.5">
                            <Clock size={9} />
                            <span>{startTime}</span>
                          </span>
                        )}
                      </div>

                      <p className="text-xs font-semibold text-navy truncate group-hover:text-gold transition-colors">
                        {w.title}
                      </p>

                      <div className="flex items-center justify-between text-[10px] text-muted font-mono mt-1 pt-1 border-t border-[#E8E8E8]/60">
                        <span className="flex items-center gap-1">
                          <Users size={10} />
                          <span>{w.seatsBooked || 0}/{w.seatsTotal || 100}</span>
                        </span>
                        <span className="text-gold group-hover:underline text-[9px] font-sans">
                          Reschedule →
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Legend */}
      <div className="p-3 border-t border-border bg-[#FAFAFA] flex items-center justify-between text-xs text-muted">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-gold inline-block" />
            <span>Published</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-gray-400 inline-block" />
            <span>Draft</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-400 inline-block" />
            <span>Archived</span>
          </span>
        </div>
        <span className="text-[11px] font-mono">
          Click any workshop to change scheduled date/time or status
        </span>
      </div>
    </div>
  );
}
