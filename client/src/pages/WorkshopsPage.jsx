import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  Search,
  Filter,
  Sparkles,
  X,
  Loader2,
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
  const view = searchParams.get('view') || 'grid'; // 'grid' | 'list' | 'calendar' | 'timeline'
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

  // Update URL search parameters cleanly
  const updateParam = (key, val) => {
    const next = new URLSearchParams(searchParams);
    if (
      !val ||
      val === 'all' ||
      val === 'All' ||
      (key === 'view' && val === 'grid') ||
      (key === 'sort' && val === 'date-asc')
    ) {
      next.delete(key);
    } else {
      next.set(key, val);
    }
    setSearchParams(next, { replace: true });
  };

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set();
    workshops.forEach((w) => {
      if (w.category) set.add(w.category);
    });
    return ['all', ...Array.from(set)];
  }, [workshops]);

  // Filtered & sorted workshops
  const filteredWorkshops = useMemo(() => {
    return workshops
      .filter((w) => {
        // Search term
        if (searchTerm) {
          const term = searchTerm.toLowerCase();
          const matchTitle = w.title?.toLowerCase().includes(term);
          const matchDesc = w.shortDescription?.toLowerCase().includes(term);
          const matchTags = w.tags?.some((t) => t.toLowerCase().includes(term));
          if (!matchTitle && !matchDesc && !matchTags) return false;
        }

        // Category filter
        if (selectedCategory !== 'all' && w.category !== selectedCategory) {
          return false;
        }

        // Status filter using unified getWorkshopStatus
        const st = getWorkshopStatus(w);
        if (statusFilter === 'upcoming' && st === 'completed') return false;
        if (statusFilter === 'past' && st !== 'completed') return false;
        if (
          statusFilter !== 'all' &&
          statusFilter !== 'upcoming' &&
          statusFilter !== 'past' &&
          st !== statusFilter
        ) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
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
  }, [workshops, searchTerm, selectedCategory, statusFilter, sortBy]);

  const clearFilters = () => {
    setSearchTerm('');
    const next = new URLSearchParams();
    if (view !== 'grid') next.set('view', view);
    setSearchParams(next, { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] pt-20 pb-16 md:pt-24 md:pb-20">
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

      <div className="container max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <FadeUp delay={0}>
            <span className="badge mb-3">
              {view === 'calendar'
                ? 'EXECUTIVE CALENDAR'
                : view === 'timeline'
                ? 'COHORT ROADMAP'
                : 'EXECUTIVE SESSIONS'}
            </span>
          </FadeUp>
          <FadeUp delay={0.1}>
            <h1 className="text-display-md text-navy font-bold mb-4">
              {view === 'calendar'
                ? 'Master Class Calendar'
                : view === 'timeline'
                ? 'Cohort Timeline'
                : 'All Master Classes'}
            </h1>
          </FadeUp>
          <FadeUp delay={0.2}>
            <p className="text-muted text-base max-w-xl mx-auto">
              {view === 'calendar'
                ? 'Interactive schedule of upcoming sessions, multi-city timezones, and one-click calendar sync.'
                : view === 'timeline'
                ? 'Chronological roadmap of live cohorts, syllabus dates, and executive sessions.'
                : 'Real-world workflows and operational leverage taught live by industry leaders.'}
            </p>
          </FadeUp>
        </div>

        {/* Filter & View Control Bar */}
        <div className="bg-white rounded-2xl border border-border p-4 md:p-6 mb-8 shadow-sm">
          <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between mb-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search workshops by topic, skill, or keyword..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-cream text-navy text-sm placeholder:text-muted focus:outline-none focus:border-gold transition-colors"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-navy"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* View Switcher: Grid | List | Calendar | Timeline */}
            <div className="flex items-center gap-1 p-1 bg-cream rounded-xl border border-border shrink-0 self-start lg:self-auto">
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
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-white text-navy shadow-sm border border-border'
                        : 'text-muted hover:text-navy hover:bg-white/60'
                    }`}
                  >
                    <Icon size={13} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Status Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-cream rounded-xl border border-border shrink-0 self-start lg:self-auto">
              <button
                onClick={() => updateParam('status', 'all')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  statusFilter === 'all'
                    ? 'bg-white text-navy shadow-sm border border-border'
                    : 'text-muted hover:text-navy'
                }`}
              >
                All
              </button>
              <button
                onClick={() => updateParam('status', 'upcoming')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  statusFilter === 'upcoming'
                    ? 'bg-white text-navy shadow-sm border border-border'
                    : 'text-muted hover:text-navy'
                }`}
              >
                Upcoming
              </button>
              <button
                onClick={() => updateParam('status', 'past')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  statusFilter === 'past' || statusFilter === 'completed'
                    ? 'bg-white text-navy shadow-sm border border-border'
                    : 'text-muted hover:text-navy'
                }`}
              >
                Past & Resources
              </button>
            </div>

            {/* Sort Select */}
            <div className="shrink-0">
              <select
                value={sortBy}
                onChange={(e) => updateParam('sort', e.target.value)}
                className="px-3.5 py-2.5 rounded-xl border border-border bg-cream text-navy text-xs font-semibold focus:outline-none focus:border-gold cursor-pointer"
              >
                <option value="date-asc">Date: Soonest First</option>
                <option value="date-desc">Date: Latest First</option>
                <option value="seats">Most Popular</option>
              </select>
            </div>
          </div>

          {/* Category Chips */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border">
            <span className="text-xs font-medium text-muted mr-1">Categories:</span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => updateParam('category', cat === 'all' ? null : cat)}
                className={`text-xs px-3 py-1 rounded-full border transition-all ${
                  selectedCategory === cat || (cat === 'all' && (!selectedCategory || selectedCategory === 'all'))
                    ? 'bg-navy text-white border-navy font-semibold'
                    : 'bg-white text-muted border-border hover:border-gold hover:text-navy'
                }`}
              >
                {cat === 'all' ? 'All Topics' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Results Count & Clear */}
        <div className="flex items-center justify-between mb-6 text-xs text-muted">
          <span>
            Showing <strong className="text-navy">{filteredWorkshops.length}</strong> master class
            {filteredWorkshops.length === 1 ? '' : 'es'}
            {view !== 'grid' && (
              <span className="ml-2 font-mono text-[11px] bg-cream px-2 py-0.5 rounded border border-border uppercase">
                {view} mode
              </span>
            )}
          </span>
          {(searchTerm || (selectedCategory && selectedCategory !== 'all') || (statusFilter && statusFilter !== 'all')) && (
            <button
              onClick={clearFilters}
              className="text-gold font-semibold hover:underline flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" /> Reset all filters
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
              <div className="space-y-3">
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
