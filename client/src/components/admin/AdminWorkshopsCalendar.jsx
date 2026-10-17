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
    <div className="bg-[#121218] rounded-2xl border border-white/10 shadow-xl overflow-hidden">
      {/* Calendar Header */}
      <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between flex-wrap gap-3 bg-[#161622]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gold/10 border border-gold/30 flex items-center justify-center text-gold shadow-sm">
            <CalendarIcon size={18} />
          </div>
          <div>
            <h2 className="text-base font-display uppercase tracking-wider text-white">
              {format(currentMonth, 'MMMM yyyy')}
            </h2>
            <p className="text-[11px] font-mono text-[#8A8A85]">
              {workshops.filter((w) => w.startDate).length} master classes scheduled
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentMonth(new Date())}
            className="px-3 py-1.5 rounded-lg border border-white/10 bg-[#1e1e2c] text-xs font-mono uppercase tracking-wider text-white hover:border-gold hover:text-gold transition-colors"
          >
            Today
          </button>
          <div className="flex items-center border border-white/10 rounded-lg bg-[#1e1e2c] overflow-hidden">
            <button
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className="p-1.5 hover:bg-white/10 text-[#8A8A85] hover:text-white transition-colors"
              title="Previous Month"
            >
              <ChevronLeft size={16} />
            </button>
            <div className="w-[1px] h-4 bg-white/10" />
            <button
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="p-1.5 hover:bg-white/10 text-[#8A8A85] hover:text-white transition-colors"
              title="Next Month"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Days of Week Header */}
      <div className="grid grid-cols-7 border-b border-white/10 bg-[#101016] text-center text-[10px] font-mono font-bold text-[#8A8A85] uppercase tracking-wider py-2.5">
        <span>Sun</span>
        <span>Mon</span>
        <span>Tue</span>
        <span>Wed</span>
        <span>Thu</span>
        <span>Fri</span>
        <span>Sat</span>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-white/5 bg-[#121218]">
        {days.map((day) => {
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isToday = isSameDay(day, new Date());
          const dayWorkshops = getDayWorkshops(day);

          return (
            <div
              key={day.toISOString()}
              className={`min-h-[110px] p-2 flex flex-col transition-colors ${
                !isCurrentMonth ? 'bg-black/40 text-white/20' : 'bg-[#121218] text-white'
              } hover:bg-white/[0.02]`}
            >
              {/* Day header */}
              <div className="flex items-center justify-between mb-1.5">
                <span
                  className={`text-xs font-mono font-bold w-6 h-6 flex items-center justify-center rounded-full ${
                    isToday
                      ? 'bg-gold text-black font-extrabold shadow-md shadow-gold/20'
                      : isCurrentMonth
                      ? 'text-white'
                      : 'text-white/25'
                  }`}
                >
                  {format(day, 'd')}
                </span>
                {dayWorkshops.length > 0 && (
                  <span className="text-[10px] font-mono text-gold">
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
                      className={`group p-2 rounded-xl border text-left cursor-pointer transition-all ${
                        isPublished
                          ? 'bg-[#181824] border-white/10 hover:border-gold hover:shadow-lg hover:shadow-black'
                          : 'bg-[#14141c] border-white/5 opacity-70 hover:opacity-100'
                      }`}
                      title="Click to reschedule or adjust status"
                    >
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span
                          className={`text-[9px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                            isPublished
                              ? 'bg-gold/15 text-gold border border-gold/30'
                              : 'bg-white/10 text-white/60'
                          }`}
                        >
                          {w.status}
                        </span>
                        {startTime && (
                          <span className="text-[10px] font-mono text-[#8A8A85] flex items-center gap-0.5">
                            <Clock size={9} />
                            <span>{startTime}</span>
                          </span>
                        )}
                      </div>

                      <p className="text-xs font-semibold text-white truncate group-hover:text-gold transition-colors">
                        {w.title}
                      </p>

                      <div className="flex items-center justify-between text-[10px] text-[#8A8A85] font-mono mt-1.5 pt-1.5 border-t border-white/5">
                        <span className="flex items-center gap-1">
                          <Users size={10} className="text-gold" />
                          <span>{w.seatsBooked || 0}/{w.seatsTotal || 100}</span>
                        </span>
                        <span className="text-gold group-hover:underline text-[9px] font-mono">
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
      <div className="p-3 border-t border-white/10 bg-[#161622] flex items-center justify-between text-xs text-[#8A8A85] flex-wrap gap-2">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-gold inline-block" />
            <span className="text-white/80 font-mono text-[11px]">Published</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-white/30 inline-block" />
            <span className="text-white/60 font-mono text-[11px]">Draft</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-400 inline-block" />
            <span className="text-red-400 font-mono text-[11px]">Archived</span>
          </span>
        </div>
        <span className="text-[11px] font-mono text-[#8A8A85]">
          Click any workshop to change scheduled date/time or status
        </span>
      </div>
    </div>
  );
}
