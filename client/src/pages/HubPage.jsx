import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  Search,
  ChevronDown,
  LayoutGrid,
  List as ListIcon,
  Calendar as CalendarIcon,
  GitCommit,
  X,
  Sparkles,
  Bookmark,
  Orbit,
  ArrowRight,
} from 'lucide-react';
import api from '../lib/api';
import { useSettings } from '../contexts/SettingsContext';
import { getWorkshopStatus } from '../lib/workshopStatus';
import { useBookmarks } from '../lib/bookmarks';

// High-Energy Gen Z Sections
import HeroGenZ from '../components/home/HeroGenZ';
import FeaturedBanner from '../components/workshop/FeaturedBanner';
import NextSessionStrip from '../components/workshop/NextSessionStrip';
import WorkshopOrbitView from '../components/workshop/WorkshopOrbitView';
import WorkshopCard from '../components/workshop/WorkshopCard';
import WorkshopListCard from '../components/workshop/WorkshopListCard';
import WorkshopTimeline from '../components/workshop/WorkshopTimeline';
import WorkshopCalendar from '../components/calendar/WorkshopCalendar';
import VerifiedAttendeesCarousel from '../components/home/VerifiedAttendeesCarousel';
import FirmsTrustSection from '../components/sections/FirmsTrustSection';
import PastEventsCoverflow from '../components/home/PastEventsCoverflow';
import PlatformFaqSection from '../components/sections/PlatformFaqSection';
import FinalCtaSection from '../components/home/FinalCtaSection';
import QuickViewDrawer from '../components/workshop/QuickViewDrawer';
import EmptyState from '../components/workshop/EmptyState';
import { WorkshopCardSkeleton, WorkshopListSkeleton } from '../components/workshop/WorkshopCardSkeleton';
import { StaggerContainer, StaggerItem } from '../components/motion/index.jsx';

const CATEGORIES = [
  'All',
  'Private Equity',
  'Venture Capital',
  'Family Office',
  'Investment Banking',
];

export default function HubPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { settings } = useSettings();

  const [workshops, setWorkshops] = useState([]);
  const [hubStats, setHubStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quickViewWorkshop, setQuickViewWorkshop] = useState(null);

  const { isBookmarked, bookmarkedSlugs } = useBookmarks();
  const bookmarkedCount = bookmarkedSlugs?.length || 0;

  // Active filter state from URL
  const view = searchParams.get('view') || 'grid';
  const category = searchParams.get('category') || 'All';
  const search = searchParams.get('q') || '';
  const statusFilter = searchParams.get('status') || 'all';
  const dateRange = searchParams.get('range') || 'all';
  const priceFilter = searchParams.get('price') || 'all';
  const sortBy = searchParams.get('sort') || 'soonest';
  const onlySaved = searchParams.get('saved') === 'true';

  const hasActiveFilters =
    category !== 'All' ||
    search !== '' ||
    statusFilter !== 'all' ||
    dateRange !== 'all' ||
    priceFilter !== 'all' ||
    onlySaved;

  const updateFilter = (key, val) => {
    const next = new URLSearchParams(searchParams);
    if (!val || val === 'all' || val === 'All' || (key === 'view' && val === 'grid') || (key === 'sort' && val === 'soonest')) {
      next.delete(key);
    } else {
      next.set(key, val);
    }
    setSearchParams(next, { replace: true });
  };

  const clearAllFilters = () => {
    const next = new URLSearchParams();
    if (view !== 'grid') next.set('view', view);
    setSearchParams(next, { replace: true });
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      if (!sessionStorage.getItem('hub_workshops_cache')) {
        setLoading(true);
      }
      const [wRes, sRes] = await Promise.all([
        api.get('/workshops?limit=50'),
        api.get('/workshops/stats/hub').catch(() => null),
      ]);
      const list = wRes.data?.workshops || [];
      setWorkshops(list);
      try {
        sessionStorage.setItem('hub_workshops_cache', JSON.stringify(list));
      } catch {}
      if (sRes?.data?.stats) {
        setHubStats(sRes.data.stats);
        try {
          sessionStorage.setItem('hub_stats_cache', JSON.stringify(sRes.data.stats));
        } catch {}
      }
    } catch (err) {
      if (workshops.length === 0) {
        setError('Unable to load master classes. Please refresh the page.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Next upcoming flagship workshop
  const nextWorkshop = useMemo(() => {
    const upcoming = workshops.filter(
      (w) => w.startDate && new Date(w.startDate) > new Date() && getWorkshopStatus(w) !== 'completed'
    );
    upcoming.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
    return upcoming[0] || null;
  }, [workshops]);

  // Featured workshops list (guaranteed 2-4 cohorts for automatic rotation)
  const featuredList = useMemo(() => {
    const feat = workshops.filter((w) => w.featured && getWorkshopStatus(w) !== 'completed');
    if (feat.length >= 2) return feat;
    
    // If fewer than 2 explicitly featured, backfill with upcoming cohorts so carousel has multiple flagship cohorts to auto-switch between
    const upcoming = workshops.filter((w) => getWorkshopStatus(w) !== 'completed');
    const combined = [...feat];
    for (const w of upcoming) {
      if (!combined.some((c) => (c._id && c._id === w._id) || c.slug === w.slug)) {
        combined.push(w);
      }
      if (combined.length >= 4) break;
    }
    if (combined.length > 0) return combined;
    return nextWorkshop ? [nextWorkshop] : workshops.slice(0, 3);
  }, [workshops, nextWorkshop]);

  // Filtered workshops
  const filteredWorkshops = useMemo(() => {
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();

    return workshops
      .filter((w) => {
        const computedStatus = getWorkshopStatus(w);

        // Search text
        if (search) {
          const q = search.toLowerCase();
          const matchTitle = w.title?.toLowerCase().includes(q);
          const matchDesc = w.shortDescription?.toLowerCase().includes(q);
          const matchCat = w.category?.toLowerCase().includes(q);
          if (!matchTitle && !matchDesc && !matchCat) return false;
        }

        // Category
        if (category !== 'All' && w.category !== category) return false;

        // Status
        if (statusFilter === 'upcoming' && computedStatus === 'completed') return false;
        if (statusFilter === 'past' && computedStatus !== 'completed') return false;
        if (statusFilter === 'live' && computedStatus !== 'live') return false;

        // Date range
        if (dateRange !== 'all' && w.startDate) {
          const d = new Date(w.startDate);
          if (dateRange === 'this-month') {
            if (d.getMonth() !== thisMonth || d.getFullYear() !== thisYear) return false;
          } else if (dateRange === 'next-month') {
            const nextM = (thisMonth + 1) % 12;
            const nextY = thisMonth === 11 ? thisYear + 1 : thisYear;
            if (d.getMonth() !== nextM || d.getFullYear() !== nextY) return false;
          }
        }

        // Price
        if (priceFilter === 'free' && w.price && w.price > 0) return false;
        if (priceFilter === 'paid' && (!w.price || w.price === 0)) return false;

        // Saved Bookmarks filter
        if (onlySaved && !bookmarkedSlugs.includes(w.slug)) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'soonest') {
          return new Date(a.startDate || 0) - new Date(b.startDate || 0);
        }
        if (sortBy === 'newest') {
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        }
        if (sortBy === 'popular') {
          return (b.seatsBooked || 0) - (a.seatsBooked || 0);
        }
        return 0;
      });
  }, [workshops, search, category, statusFilter, dateRange, priceFilter, sortBy, onlySaved, bookmarkedSlugs]);

  // Past completed workshops for coverflow
  const pastWorkshops = useMemo(() => {
    return workshops.filter((w) => getWorkshopStatus(w) === 'completed');
  }, [workshops]);

  const handleReserveSpot = () => {
    if (nextWorkshop) {
      navigate(`/w/${nextWorkshop.slug}?reserve=true`);
    } else {
      document.getElementById('explore')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <Helmet>
        <title>{settings?.platformName || 'WORKSHOP HUB'} — Live Master Classes for Deal Teams</title>
        <meta
          name="description"
          content="Live, expert-led master classes for private equity and venture capital deal teams."
        />
      </Helmet>

      {/* ─── 1. HERO SECTION (Full-Screen Giant Typography + Parallax Cluster) ─── */}
      <HeroGenZ
        nextWorkshop={nextWorkshop}
        stats={hubStats || {}}
        onReserveSpot={handleReserveSpot}
      />

      {/* ─── FLAGSHIP COHORT (Cinematic Bento Card) ─── */}
      {featuredList.length > 0 && (
        <section className="bg-[#0a0a0a] py-16 sm:py-24 border-b border-white/[0.08] relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold shadow-[0_0_8px_rgba(201,162,77,0.8)]" />
                  <span className="font-mono text-xs uppercase tracking-widest text-gold font-bold">
                    00 / FLAGSHIP
                  </span>
                </div>
                <h2 className="text-3xl sm:text-5xl font-extrabold text-white font-bebas uppercase tracking-tight">
                  NEXT LIVE COHORT
                </h2>
              </div>
            </div>
            <FeaturedBanner workshops={featuredList} />
          </div>
        </section>
      )}

      {/* ─── NEXT SESSION STICKY STRIP ─── */}
      {nextWorkshop && <NextSessionStrip workshop={nextWorkshop} />}

      {/* ─── 01 / EXPLORE MASTER CLASSES (Orbit View / Grid View Toggle) ─── */}
      <section id="explore" className="bg-[#0a0a0a] py-20 sm:py-28 border-b border-white/[0.08] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          {/* Section Header & View Toggle (Orbit / Grid / List / Calendar / Timeline) */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-gold shadow-[0_0_8px_rgba(201,162,77,0.8)]" />
                <span className="font-mono text-xs uppercase tracking-widest text-gold font-bold">
                  01 / EXPLORE
                </span>
              </div>
              <h2 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white font-bebas uppercase tracking-tight">
                MASTER CLASSES & LABS
              </h2>
            </div>

            {/* Orbit / Grid View Switcher (Bhavya Portfolio Pattern) */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center p-1 rounded-2xl glass border border-white/10 shadow-lg">
                <button
                  onClick={() => updateFilter('view', 'grid')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-medium transition-all duration-300 cursor-pointer ${
                    view === 'grid'
                      ? 'bg-gold text-[#0a0a0a] font-bold shadow-gold-glow'
                      : 'text-white/50 hover:text-white'
                  }`}
                >
                  <LayoutGrid size={14} />
                  <span>Grid View</span>
                </button>

                <button
                  onClick={() => updateFilter('view', 'orbit')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-medium transition-all duration-300 cursor-pointer ${
                    view === 'orbit'
                      ? 'bg-gold text-[#0a0a0a] font-bold shadow-gold-glow'
                      : 'text-white/50 hover:text-white'
                  }`}
                >
                  <Orbit size={14} />
                  <span>3D Orbit</span>
                </button>

                <button
                  onClick={() => updateFilter('view', 'list')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-mono font-medium transition-all duration-300 cursor-pointer ${
                    view === 'list'
                      ? 'bg-gold text-[#0a0a0a] font-bold shadow-gold-glow'
                      : 'text-white/50 hover:text-white'
                  }`}
                  title="List View"
                >
                  <ListIcon size={14} />
                </button>

                <button
                  onClick={() => updateFilter('view', 'calendar')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-mono font-medium transition-all duration-300 cursor-pointer ${
                    view === 'calendar'
                      ? 'bg-gold text-[#0a0a0a] font-bold shadow-gold-glow'
                      : 'text-white/50 hover:text-white'
                  }`}
                  title="Calendar View"
                >
                  <CalendarIcon size={14} />
                </button>

                <button
                  onClick={() => updateFilter('view', 'timeline')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-mono font-medium transition-all duration-300 cursor-pointer ${
                    view === 'timeline'
                      ? 'bg-gold text-[#0a0a0a] font-bold shadow-gold-glow'
                      : 'text-white/50 hover:text-white'
                  }`}
                  title="Timeline View"
                >
                  <GitCommit size={14} />
                </button>
              </div>

              <span className="font-mono text-xs text-white/40 uppercase tracking-wider hidden sm:inline">
                {filteredWorkshops.length} COHORTS
              </span>
            </div>
          </div>

          {/* Dark Glass Filter Bar */}
          <div className="rounded-3xl glass-strong border border-white/10 p-5 sm:p-6 mb-8 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
              {/* Search input */}
              <div className="lg:col-span-5 relative">
                <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type="text"
                  placeholder="Filter by title, due diligence topic..."
                  value={search}
                  onChange={(e) => updateFilter('q', e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white/[0.04] border border-white/10 rounded-2xl text-xs font-sans text-white placeholder:text-white/40 focus:outline-none focus:border-gold/60 transition-colors"
                />
              </div>

              {/* Status filter */}
              <div className="lg:col-span-3 relative">
                <select
                  value={statusFilter}
                  onChange={(e) => updateFilter('status', e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#141418] border border-white/10 rounded-2xl text-xs font-mono uppercase text-white/80 focus:outline-none focus:border-gold appearance-none pr-8 cursor-pointer"
                >
                  <option value="all">Status: All</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="live">Live Now</option>
                  <option value="past">Completed</option>
                </select>
                <ChevronDown size={13} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
              </div>

              {/* Sort filter */}
              <div className="lg:col-span-4 relative">
                <select
                  value={sortBy}
                  onChange={(e) => updateFilter('sort', e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#141418] border border-white/10 rounded-2xl text-xs font-mono uppercase text-white/80 focus:outline-none focus:border-gold appearance-none pr-8 cursor-pointer"
                >
                  <option value="soonest">Sort: Soonest Live</option>
                  <option value="newest">Sort: Newly Listed</option>
                  <option value="popular">Sort: Most Booked</option>
                </select>
                <ChevronDown size={13} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
              </div>
            </div>

            {/* Category Chips Bar with Active Gold Glow */}
            <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap pt-2 no-scrollbar">
              <span className="text-[11px] font-mono text-white/40 uppercase tracking-widest mr-1 shrink-0">
                CATEGORY:
              </span>
              {CATEGORIES.map((cat) => {
                const isSelected = category === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => updateFilter('category', cat)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-gold text-[#0a0a0a] font-bold shadow-gold-glow'
                        : 'bg-white/[0.03] border border-white/10 text-white/60 hover:text-white hover:border-white/20'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}

              <div className="h-4 w-[1px] bg-white/10 shrink-0 mx-2" />

              <button
                onClick={() => updateFilter('saved', onlySaved ? null : 'true')}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider transition-all shrink-0 cursor-pointer ${
                  onlySaved
                    ? 'bg-gold text-[#0a0a0a] font-bold shadow-gold-glow'
                    : 'bg-white/[0.03] border border-white/10 text-white/60 hover:text-white'
                }`}
              >
                <Bookmark size={11} className={onlySaved ? 'fill-current' : ''} />
                <span>Saved ({bookmarkedCount})</span>
              </button>
            </div>

            {/* Active Filter Chips & Clear */}
            {hasActiveFilters && (
              <div className="flex items-center justify-between gap-3 pt-3 border-t border-white/10 flex-wrap text-xs font-mono">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-white/40">Active:</span>
                  {search && (
                    <span className="sticker sticker-gold text-[10px]">
                      <span>"{search}"</span>
                      <X size={10} className="cursor-pointer hover:text-white" onClick={() => updateFilter('q', '')} />
                    </span>
                  )}
                  {category !== 'All' && (
                    <span className="sticker sticker-gold text-[10px]">
                      <span>{category}</span>
                      <X size={10} className="cursor-pointer hover:text-white" onClick={() => updateFilter('category', 'All')} />
                    </span>
                  )}
                  <button
                    onClick={clearAllFilters}
                    className="text-xs text-gold font-bold hover:underline pl-1 cursor-pointer"
                  >
                    Reset all filters
                  </button>
                </div>
                <span className="text-white/40">
                  Showing <strong>{filteredWorkshops.length}</strong> cohorts
                </span>
              </div>
            )}
          </div>

          {/* ─── Render View Modes ─── */}
          {loading ? (
            view === 'list' ? (
              <WorkshopListSkeleton count={4} />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <WorkshopCardSkeleton count={6} />
              </div>
            )
          ) : filteredWorkshops.length === 0 ? (
            <EmptyState
              onReset={clearAllFilters}
              categories={CATEGORIES.slice(1)}
              onCategorySelect={(c) => updateFilter('category', c)}
            />
          ) : view === 'orbit' ? (
            /* 3D ORBIT VIEW (Matching Bhavya Portfolio Pattern) */
            <WorkshopOrbitView
              workshops={filteredWorkshops}
              onSelectWorkshop={(w) => navigate(`/w/${w.slug}`)}
            />
          ) : view === 'grid' ? (
            /* BENTO GRID VIEW */
            <StaggerContainer
              stagger={0.06}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch"
            >
              {filteredWorkshops.map((w) => (
                <StaggerItem key={w._id || w.id} className="h-full">
                  <WorkshopCard workshop={w} onQuickView={setQuickViewWorkshop} />
                </StaggerItem>
              ))}
            </StaggerContainer>
          ) : view === 'list' ? (
            /* LIST VIEW */
            <div className="space-y-4">
              {filteredWorkshops.map((w) => (
                <WorkshopListCard
                  key={w._id || w.id}
                  workshop={w}
                  onQuickView={setQuickViewWorkshop}
                />
              ))}
            </div>
          ) : view === 'calendar' ? (
            /* CALENDAR VIEW */
            <WorkshopCalendar
              workshops={filteredWorkshops}
              onQuickView={setQuickViewWorkshop}
            />
          ) : (
            /* TIMELINE VIEW */
            <WorkshopTimeline
              workshops={filteredWorkshops}
              onQuickView={setQuickViewWorkshop}
            />
          )}
        </div>
      </section>

      {/* ─── 02 / VAULT (Cinematic Coverflow Past Events Reel) ─── */}
      <PastEventsCoverflow pastWorkshops={pastWorkshops} />

      {/* ─── 03 / VERIFIED ATTENDEE EXPERIENCES (3D Trading Card Carousel) ─── */}
      <VerifiedAttendeesCarousel />

      {/* ─── 04 / CAPITAL ALLOCATORS ($246B+ Counter & Opposing Infinite Marquees) ─── */}
      <FirmsTrustSection settings={settings} />

      {/* ─── 05 / CLARITY (Numbered FAQ Accordion with Rotating +) ─── */}
      <PlatformFaqSection />

      {/* ─── FINAL CTA: "SEE YOU IN THE ROOM." ─── */}
      <FinalCtaSection onReserveSpot={handleReserveSpot} />

      {/* Quick View Drawer */}
      <QuickViewDrawer
        workshop={quickViewWorkshop}
        isOpen={Boolean(quickViewWorkshop)}
        onClose={() => setQuickViewWorkshop(null)}
      />
    </>
  );
}
