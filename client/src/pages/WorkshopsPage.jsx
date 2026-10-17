import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  Search,
  Sparkles,
  X,
  LayoutGrid,
  List as ListIcon,
  Calendar as CalendarIcon,
  GitCommit,
} from 'lucide-react';
import api from '../lib/api';
import WorkshopCard from '../components/workshop/WorkshopCard';
import WorkshopListCard from '../components/workshop/WorkshopListCard';
import WorkshopTimeline from '../components/workshop/WorkshopTimeline';
import WorkshopCalendar from '../components/calendar/WorkshopCalendar';
import QuickViewDrawer from '../components/workshop/QuickViewDrawer';
import { WorkshopCardSkeleton, WorkshopListSkeleton } from '../components/workshop/WorkshopCardSkeleton';
import EmptyState from '../components/workshop/EmptyState';
import { FadeUp, StaggerContainer, StaggerItem } from '../components/motion/index.jsx';
import { getWorkshopStatus } from '../lib/workshopStatus';

export default function WorkshopsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [workshops, setWorkshops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [quickViewWorkshop, setQuickViewWorkshop] = useState(null);

  // Active filters and views
  const view = searchParams.get('view') || 'grid';
  const selectedCategory = searchParams.get('category') || 'all';
  const statusFilter = searchParams.get('status') || searchParams.get('filter') || 'all';
  const sortBy = searchParams.get('sort') || 'date-asc';

  useEffect(() => {
    setLoading(true);
    api
      .get('/workshops?limit=50')
      .then((res) => {
        setWorkshops(res.data.workshops || []);
      })
      .catch((err) => {
        console.error('Failed to load workshops', err);
      })
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(() => {
    const set = new Set();
    workshops.forEach((w) => {
      if (w.category) set.add(w.category);
    });
    return ['all', ...Array.from(set)];
  }, [workshops]);

  const updateParam = (key, val) => {
    const next = new URLSearchParams(searchParams);
    if (!val || val === 'all') {
      next.delete(key);
    } else {
      next.set(key, val);
    }
    setSearchParams(next);
  };

  const filteredWorkshops = useMemo(() => {
    let list = [...workshops];

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      list = list.filter(
        (w) =>
          w.title?.toLowerCase().includes(q) ||
          w.shortDescription?.toLowerCase().includes(q) ||
          w.category?.toLowerCase().includes(q)
      );
    }

    if (selectedCategory && selectedCategory !== 'all') {
      list = list.filter((w) => w.category === selectedCategory);
    }

    if (statusFilter && statusFilter !== 'all') {
      list = list.filter((w) => {
        const status = getWorkshopStatus(w);
        if (statusFilter === 'upcoming') {
          return status === 'upcoming' || status === 'live' || status === 'registration-open' || status === 'few-seats-left' || status === 'sold-out';
        }
        if (statusFilter === 'past' || statusFilter === 'completed') {
          return status === 'completed';
        }
        return true;
      });
    }

    list.sort((a, b) => {
      if (sortBy === 'date-asc') {
        return new Date(a.startDate || 0) - new Date(b.startDate || 0);
      }
      if (sortBy === 'date-desc') {
        return new Date(b.startDate || 0) - new Date(a.startDate || 0);
      }
      if (sortBy === 'seats') {
        return (b.seatsBooked || 0) - (a.seatsBooked || 0);
      }
      return 0;
    });

    return list;
  }, [workshops, searchTerm, selectedCategory, statusFilter, sortBy]);

  const clearFilters = () => {
    setSearchTerm('');
    setSearchParams({});
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#F5F5F0] pt-24 pb-24 md:pt-32 md:pb-32">
      <Helmet>
        <title>
          {view === 'calendar'
            ? 'Executive Calendar | Master Classes'
            : view === 'timeline'
            ? 'Cohort Timeline | Master Classes'
            : 'All Master Classes & Workshops | Workshop Hub'}
        </title>
        <meta
          name="description"
          content="Explore our upcoming and on-demand live master classes in deal flow, venture intelligence, and private equity automation."
        />
      </Helmet>

      {/* Ambient background glows */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gold/5 blur-[140px] pointer-events-none rounded-full" />

      <div className="container max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <FadeUp delay={0}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 border border-gold/20 text-gold font-mono text-[11px] uppercase tracking-widest font-bold mb-4">
              <Sparkles size={11} />
              <span>
                {view === 'calendar'
                  ? 'EXECUTIVE CALENDAR'
                  : view === 'timeline'
                  ? 'COHORT ROADMAP'
                  : 'ALL MASTERCLASSES'}
              </span>
            </div>
          </FadeUp>
          <FadeUp delay={0.1}>
            <h1 className="font-display text-4xl sm:text-6xl md:text-7xl uppercase tracking-tight text-white mb-4">
              CURATED <span className="text-stroke text-transparent">ARSENAL.</span>
            </h1>
          </FadeUp>
          <FadeUp delay={0.2}>
            <p className="text-white/50 text-sm sm:text-base max-w-xl mx-auto">
              Real-world workflows and financial leverage taught live by industry practitioners. Zero fluff.
            </p>
          </FadeUp>
        </div>

        {/* Filter & View Control Bar */}
        <div className="glass-strong bg-[#141418] rounded-3xl border border-white/10 p-5 md:p-7 mb-10 shadow-[0_20px_50px_rgba(0,0,0,0.85)]">
          <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between mb-5">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-white/40 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search masterclasses by skill, topic, or firm..."
                className="w-full pl-11 pr-10 py-3 rounded-full border border-white/10 bg-[#18181f] text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-gold transition-colors font-sans"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white p-1"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* View Switcher: Grid | List | Calendar | Timeline */}
            <div className="flex items-center gap-1 p-1 bg-[#18181f] rounded-full border border-white/10 shrink-0 self-start lg:self-auto">
              {[
                { id: 'grid', label: 'Grid', icon: LayoutGrid },
                { id: 'list', label: 'List', icon: ListIcon },
                { id: 'calendar', label: 'Calendar', icon: CalendarIcon },
                { id: 'timeline', label: 'Timeline', icon: GitCommit },
              ].map((item) => {
                const Icon = item.icon;
                const isActive = view === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => updateParam('view', item.id)}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-mono font-bold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-gold text-black shadow-md shadow-gold/25'
                        : 'text-white/40 hover:text-white hover:bg-white/[0.06]'
                    }`}
                  >
                    <Icon size={13} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Status Tabs */}
            <div className="flex items-center gap-1 p-1 bg-[#18181f] rounded-full border border-white/10 shrink-0 self-start lg:self-auto">
              <button
                onClick={() => updateParam('status', 'all')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-mono font-bold transition-all cursor-pointer ${
                  statusFilter === 'all'
                    ? 'bg-gold text-black shadow-md shadow-gold/25'
                    : 'text-white/40 hover:text-white'
                }`}
              >
                ALL
              </button>
              <button
                onClick={() => updateParam('status', 'upcoming')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-mono font-bold transition-all cursor-pointer ${
                  statusFilter === 'upcoming'
                    ? 'bg-gold text-black shadow-md shadow-gold/25'
                    : 'text-white/40 hover:text-white'
                }`}
              >
                UPCOMING
              </button>
              <button
                onClick={() => updateParam('status', 'past')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-mono font-bold transition-all cursor-pointer ${
                  statusFilter === 'past' || statusFilter === 'completed'
                    ? 'bg-gold text-black shadow-md shadow-gold/25'
                    : 'text-white/40 hover:text-white'
                }`}
              >
                RECORDINGS
              </button>
            </div>

            {/* Sort Select */}
            <div className="shrink-0">
              <select
                value={sortBy}
                onChange={(e) => updateParam('sort', e.target.value)}
                className="px-4 py-2.5 rounded-full border border-white/10 bg-[#18181f] text-white text-xs font-mono font-bold focus:outline-none focus:border-gold cursor-pointer"
              >
                <option value="date-asc" className="bg-[#18181f] text-white">Date: Soonest First</option>
                <option value="date-desc" className="bg-[#18181f] text-white">Date: Latest First</option>
                <option value="seats" className="bg-[#18181f] text-white">Most Popular</option>
              </select>
            </div>
          </div>

          {/* Category Chips */}
          <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-white/10">
            <span className="text-[10px] font-mono font-bold text-white/40 uppercase tracking-widest mr-1">
              TOPICS:
            </span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => updateParam('category', cat === 'all' ? null : cat)}
                className={`text-xs px-3.5 py-1.5 rounded-full border font-mono transition-all cursor-pointer ${
                  selectedCategory === cat || (cat === 'all' && (!selectedCategory || selectedCategory === 'all'))
                    ? 'bg-gold text-black border-gold font-bold shadow-md shadow-gold/20'
                    : 'bg-white/[0.03] text-white/50 border-white/10 hover:border-gold/50 hover:text-white'
                }`}
              >
                {cat === 'all' ? 'All Master Classes' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Results Count & Clear */}
        <div className="flex items-center justify-between mb-8 text-xs font-mono text-white/40">
          <span>
            SHOWING <strong className="text-gold">{filteredWorkshops.length}</strong> MASTER CLASSES
          </span>
          {(searchTerm || (selectedCategory && selectedCategory !== 'all') || (statusFilter && statusFilter !== 'all')) && (
            <button
              onClick={clearFilters}
              className="text-gold font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" /> RESET FILTERS
            </button>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          view === 'list' ? (
            <WorkshopListSkeleton count={4} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <WorkshopCardSkeleton count={6} />
            </div>
          )
        )}

        {/* Empty State */}
        {!loading && filteredWorkshops.length === 0 && (
          <EmptyState
            onReset={clearFilters}
            categories={categories.filter((c) => c !== 'all')}
            onCategorySelect={(cat) => updateParam('category', cat)}
          />
        )}

        {/* Dynamic Views: Grid | List | Calendar | Timeline */}
        {!loading && filteredWorkshops.length > 0 && (
          <>
            {view === 'grid' && (
              <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
                {filteredWorkshops.map((workshop) => (
                  <StaggerItem key={workshop._id || workshop.id} className="h-full">
                    <WorkshopCard workshop={workshop} onQuickView={setQuickViewWorkshop} />
                  </StaggerItem>
                ))}
              </StaggerContainer>
            )}

            {view === 'list' && (
              <div className="space-y-4">
                {filteredWorkshops.map((workshop) => (
                  <WorkshopListCard
                    key={workshop._id || workshop.id}
                    workshop={workshop}
                    onQuickView={setQuickViewWorkshop}
                  />
                ))}
              </div>
            )}

            {view === 'calendar' && (
              <WorkshopCalendar
                workshops={filteredWorkshops}
                onQuickView={setQuickViewWorkshop}
              />
            )}

            {view === 'timeline' && (
              <WorkshopTimeline
                workshops={filteredWorkshops}
                onQuickView={setQuickViewWorkshop}
              />
            )}
          </>
        )}

        {/* Quick View Drawer */}
        <QuickViewDrawer
          workshop={quickViewWorkshop}
          isOpen={Boolean(quickViewWorkshop)}
          onClose={() => setQuickViewWorkshop(null)}
        />
      </div>
    </div>
  );
}
