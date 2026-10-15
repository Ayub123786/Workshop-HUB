import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  Search,
  ChevronDown,
  LayoutGrid,
  List as ListIcon,
  Calendar as CalendarIcon,
  GitCommit,
  X,
  Filter,
  CheckCircle2,
  Mail,
  Loader2,
  Sparkles,
  ArrowRight,
  Bookmark,
  History,
  Play,
} from 'lucide-react';
import CountUp from 'react-countup';
import api from '../lib/api';
import { useSettings } from '../contexts/SettingsContext';

// Components
import WorkshopCard from '../components/workshop/WorkshopCard';
import WorkshopListCard from '../components/workshop/WorkshopListCard';
import WorkshopTimeline from '../components/workshop/WorkshopTimeline';
import WorkshopCalendar from '../components/calendar/WorkshopCalendar';
import FeaturedBanner from '../components/workshop/FeaturedBanner';
import NextSessionStrip from '../components/workshop/NextSessionStrip';
import QuickViewDrawer from '../components/workshop/QuickViewDrawer';
import PastEventsCoverflow from '../components/home/PastEventsCoverflow';
import FirmsTrustSection from '../components/sections/FirmsTrustSection';
import PlatformFaqSection from '../components/sections/PlatformFaqSection';
import NewsletterSection from '../components/sections/NewsletterSection';
import { WorkshopCardSkeleton, WorkshopListSkeleton } from '../components/workshop/WorkshopCardSkeleton';
import EmptyState from '../components/workshop/EmptyState';
import { FadeUp, StaggerContainer, StaggerItem } from '../components/motion/index.jsx';
import { getWorkshopStatus } from '../lib/workshopStatus';
import { useBookmarks } from '../lib/bookmarks';
import { getRecentlyViewed } from '../lib/recentlyViewed';

const CATEGORIES = [
  'All',
  'Private Equity',
  'Venture Capital',
  'Family Office',
  'Investment Banking',
  'AI & FinTech',
];

export default function HubPage() {
  const { settings } = useSettings();
  const [searchParams, setSearchParams] = useSearchParams();

  const [workshops, setWorkshops] = useState([]);
  const [hubStats, setHubStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Quick View Drawer state
  const [quickViewWorkshop, setQuickViewWorkshop] = useState(null);

  // Bookmarks & Recently Viewed
  const { bookmarkedSlugs, count: bookmarkedCount } = useBookmarks();
  const [recentItems, setRecentItems] = useState(getRecentlyViewed());

  useEffect(() => {
    const handleRecentUpdate = (e) => setRecentItems(e.detail?.items || getRecentlyViewed());
    window.addEventListener('recently_viewed_updated', handleRecentUpdate);
    return () => window.removeEventListener('recently_viewed_updated', handleRecentUpdate);
  }, []);

  // Past session email notify state
  const [pastNotifyEmail, setPastNotifyEmail] = useState('');
  const [pastNotifySuccess, setPastNotifySuccess] = useState(false);
  const [pastNotifySubmitting, setPastNotifySubmitting] = useState(false);

  // Filters from URL query params (with defaults)
  const view = searchParams.get('view') || 'grid'; // 'grid' | 'list' | 'calendar' | 'timeline'
  const search = searchParams.get('q') || '';
  const category = searchParams.get('category') || 'All';
  const statusFilter = searchParams.get('status') || 'all'; // 'all' | 'upcoming' | 'live' | 'past'
  const dateRange = searchParams.get('range') || 'all'; // 'all' | 'this-month' | 'next-month'
  const priceFilter = searchParams.get('price') || 'all'; // 'all' | 'free' | 'paid'
  const sortBy = searchParams.get('sort') || 'soonest'; // 'soonest' | 'newest' | 'popular'
  const onlySaved = searchParams.get('saved') === 'true';

  // Helper to update specific search params while preserving others
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
      setLoading(true);
      const [wRes, sRes] = await Promise.all([
        api.get('/workshops?limit=50'),
        api.get('/workshops/stats/hub').catch(() => null),
      ]);
      setWorkshops(wRes.data?.workshops || []);
      if (sRes?.data?.stats) {
        setHubStats(sRes.data.stats);
      }
    } catch (err) {
      setError('Unable to load master classes. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  // Next upcoming workshop
  const nextWorkshop = useMemo(() => {
    const upcoming = workshops.filter(
      (w) => w.startDate && new Date(w.startDate) > new Date() && getWorkshopStatus(w) !== 'completed'
    );
    upcoming.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
    return upcoming[0] || null;
  }, [workshops]);

  // Featured workshops list
  const featuredList = useMemo(() => {
    const feat = workshops.filter((w) => w.featured && getWorkshopStatus(w) !== 'completed');
    if (feat.length > 0) return feat;
    return nextWorkshop ? [nextWorkshop] : workshops.slice(0, 1);
  }, [workshops, nextWorkshop]);

  // Filtered workshops based on URL search params
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

  // Past completed workshops for Section 5
  const pastWorkshops = useMemo(() => {
    return workshops.filter((w) => getWorkshopStatus(w) === 'completed');
  }, [workshops]);

  // Check active filter count
  const hasActiveFilters =
    Boolean(search) ||
    category !== 'All' ||
    statusFilter !== 'all' ||
    dateRange !== 'all' ||
    priceFilter !== 'all' ||
    sortBy !== 'soonest' ||
    onlySaved;

  const handlePastNotifySubmit = async (e) => {
    e.preventDefault();
    if (!pastNotifyEmail || !pastNotifyEmail.includes('@')) return;
    setPastNotifySubmitting(true);
    try {
      await api.post('/subscribers', {
        email: pastNotifyEmail.trim(),
        source: 'hub_past_sessions',
      });
      setPastNotifySuccess(true);
      setPastNotifyEmail('');
    } catch (e) {
      // Handled
    } finally {
      setPastNotifySubmitting(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>{settings?.platformName || 'Workshop Hub'} — Live Master Classes for PE & VC Deal Teams</title>
        <meta
          name="description"
          content={settings?.hubSubtitle || 'Expert-led live master classes for finance, private equity, and venture capital professionals.'}
        />
      </Helmet>

      {/* ─── 1. HERO with Dedicated Space for Video ─── */}
      <section className="bg-white pt-20 pb-12 sm:pt-24 sm:pb-16 border-b border-[#E8E8E8]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <FadeUp>
            <span className="inline-block text-xs font-semibold tracking-[0.18em] uppercase text-navy/70 border border-[#E8E8E8] px-4 py-1.5 rounded-full mb-5 bg-cream shadow-2xs">
              LIVE EXECUTIVE MASTER CLASSES
            </span>
          </FadeUp>
          <FadeUp delay={0.06}>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-navy mb-4 tracking-tight text-balance leading-[1.12]">
              {settings?.hubHeadline || 'Build What the Best Funds Already Run'}
            </h1>
          </FadeUp>
          <FadeUp delay={0.12}>
            <p className="text-sm sm:text-base text-muted max-w-xl mx-auto mb-6 leading-relaxed">
              {settings?.hubSubtitle || 'Live, expert-led master classes for private equity and venture capital deal teams.'}
            </p>
          </FadeUp>
          <FadeUp delay={0.18}>
            <div className="flex items-center justify-center gap-3 mb-6 flex-wrap">
              <a
                href="#explore"
                className="btn-primary text-xs sm:text-sm py-2.5 px-6 shadow-xs font-semibold"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('explore')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Explore Master Classes ↓
              </a>
            </div>
          </FadeUp>

          {/* Live Stats Row: Database computed counters */}
          {/* Live Stats Row: Database computed counters & Admin configurable */}
          <FadeUp delay={0.28}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 pt-8 border-t border-[#E8E8E8] max-w-4xl mx-auto">
              <div className="text-center">
                <p className="text-2xl sm:text-3xl font-extrabold text-navy font-mono">
                  <CountUp end={settings?.heroStats?.totalWorkshops ?? hubStats?.totalWorkshops ?? 18} duration={2} />+
                </p>
                <p className="text-[11px] font-semibold text-muted uppercase tracking-wider mt-1">
                  Workshops Hosted
                </p>
              </div>

              <div className="text-center">
                <p className="text-2xl sm:text-3xl font-extrabold text-navy font-mono">
                  <CountUp end={settings?.heroStats?.totalAttendees ?? hubStats?.totalAttendees ?? 1480} duration={2.2} separator="," />+
                </p>
                <p className="text-[11px] font-semibold text-muted uppercase tracking-wider mt-1">
                  Professionals Trained
                </p>
              </div>

              <div className="text-center">
                <p className="text-2xl sm:text-3xl font-extrabold text-navy font-mono">
                  <CountUp end={settings?.heroStats?.countries ?? hubStats?.countries ?? 18} duration={1.8} />
                </p>
                <p className="text-[11px] font-semibold text-muted uppercase tracking-wider mt-1">
                  Financial Hubs / Countries
                </p>
              </div>

              <div className="text-center">
                <p className="text-2xl sm:text-3xl font-extrabold text-navy font-mono">
                  $<CountUp end={settings?.heroStats?.aumTrained ?? (parseFloat(settings?.globalTrust?.aumNumber) || hubStats?.aumTrained || 246)} duration={2.2} />B+
                </p>
                <p className="text-[11px] font-semibold text-muted uppercase tracking-wider mt-1">
                  AUM Across Trained Funds
                </p>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ─── 2. FEATURED WORKSHOP (Split Carousel) ─── */}
      {featuredList.length > 0 && (
        <section className="bg-white py-12 sm:py-16 border-b border-[#E8E8E8]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <FadeUp>
              <div className="mb-6">
                <span className="text-[11px] font-bold text-gold uppercase tracking-widest block mb-1">
                  EXECUTIVE FEATURE
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-navy tracking-tight">
                  Flagship Master Class
                </h2>
              </div>
            </FadeUp>
            <FeaturedBanner workshops={featuredList} />
          </div>
        </section>
      )}

      {/* ─── 3. NEXT SESSION COUNTDOWN STRIP ─── */}
      {nextWorkshop && (
        <NextSessionStrip workshop={nextWorkshop} />
      )}

      {/* ─── 4. EXPLORE WORKSHOPS SECTION (With View Switcher) ─── */}
      <section id="explore" className="bg-[#FAF9F6] py-16 sm:py-20 border-b border-[#E8E8E8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header & View Switcher */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
            <div>
              <span className="text-[11px] font-bold text-muted uppercase tracking-widest block mb-1">
                DISCOVER COHORTS
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-navy tracking-tight">
                Explore Master Classes
              </h2>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              {/* Event State Toggle: Upcoming vs Past */}
              <div className="flex items-center bg-white border border-[#E8E8E8] rounded-xl p-1 text-xs shadow-2xs">
                <button
                  onClick={() => updateFilter('status', 'all')}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                    statusFilter !== 'past'
                      ? 'bg-navy text-white shadow-2xs'
                      : 'text-muted hover:text-navy hover:bg-cream'
                  }`}
                >
                  Upcoming Cohorts
                </button>
                <button
                  onClick={() => updateFilter('status', 'past')}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                    statusFilter === 'past'
                      ? 'bg-navy text-white shadow-2xs'
                      : 'text-muted hover:text-navy hover:bg-cream'
                  }`}
                >
                  Past Events & Replays
                </button>
              </div>

              {/* View Switcher: Grid | List | Calendar | Timeline */}
              <div className="flex items-center bg-white border border-[#E8E8E8] rounded-xl p-1 text-xs shadow-2xs shrink-0">
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
                      onClick={() => updateFilter('view', item.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
                        isActive
                          ? 'bg-navy text-white shadow-2xs'
                          : 'text-muted hover:text-navy hover:bg-cream'
                      }`}
                    >
                      <Icon size={13} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Filters Bar: Search, Category, Status, Date Range, Price, Sort */}
          <div className="bg-white border border-[#E8E8E8] rounded-2xl p-4 sm:p-5 mb-6 shadow-2xs space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
              {/* Search */}
              <div className="lg:col-span-4 relative">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  type="text"
                  placeholder="Search by topic, analyst stack..."
                  value={search}
                  onChange={(e) => updateFilter('q', e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-cream border border-[#E8E8E8] rounded-xl text-xs text-navy placeholder:text-muted focus:outline-none focus:border-gold transition-colors"
                />
              </div>

              {/* Status filter */}
              <div className="lg:col-span-2 relative">
                <select
                  value={statusFilter}
                  onChange={(e) => updateFilter('status', e.target.value)}
                  className="w-full px-3 py-2 bg-cream border border-[#E8E8E8] rounded-xl text-xs text-navy focus:outline-none focus:border-gold appearance-none pr-8 font-medium cursor-pointer"
                >
                  <option value="all">Status: All</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="live">Live Now</option>
                  <option value="past">Completed</option>
                </select>
                <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
              </div>

              {/* Date Range filter */}
              <div className="lg:col-span-2 relative">
                <select
                  value={dateRange}
                  onChange={(e) => updateFilter('range', e.target.value)}
                  className="w-full px-3 py-2 bg-cream border border-[#E8E8E8] rounded-xl text-xs text-navy focus:outline-none focus:border-gold appearance-none pr-8 font-medium cursor-pointer"
                >
                  <option value="all">Date: Any Time</option>
                  <option value="this-month">This Month</option>
                  <option value="next-month">Next Month</option>
                </select>
                <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
              </div>

              {/* Price filter */}
              <div className="lg:col-span-2 relative">
                <select
                  value={priceFilter}
                  onChange={(e) => updateFilter('price', e.target.value)}
                  className="w-full px-3 py-2 bg-cream border border-[#E8E8E8] rounded-xl text-xs text-navy focus:outline-none focus:border-gold appearance-none pr-8 font-medium cursor-pointer"
                >
                  <option value="all">Access: All</option>
                  <option value="free">Free Access</option>
                  <option value="paid">Executive Pass</option>
                </select>
                <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
              </div>

              {/* Sort filter */}
              <div className="lg:col-span-2 relative">
                <select
                  value={sortBy}
                  onChange={(e) => updateFilter('sort', e.target.value)}
                  className="w-full px-3 py-2 bg-cream border border-[#E8E8E8] rounded-xl text-xs text-navy focus:outline-none focus:border-gold appearance-none pr-8 font-medium cursor-pointer"
                >
                  <option value="soonest">Sort: Soonest</option>
                  <option value="newest">Sort: Newest</option>
                  <option value="popular">Sort: Most Popular</option>
                </select>
                <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
              </div>
            </div>

            {/* Category Chips Bar */}
            <div className="flex items-center gap-1.5 overflow-x-auto whitespace-nowrap pt-1 no-scrollbar">
              <span className="text-[11px] font-bold text-muted uppercase tracking-wider mr-1 shrink-0">
                Category:
              </span>
              {CATEGORIES.map((cat) => {
                const isSelected = category === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => updateFilter('category', cat)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                      isSelected
                        ? 'bg-navy text-white border-navy shadow-2xs'
                        : 'bg-white border-[#E8E8E8] text-muted hover:text-navy hover:bg-cream'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}

              <div className="h-4 w-[1px] bg-[#E8E8E8] shrink-0 mx-1" />

              <button
                onClick={() => updateFilter('saved', onlySaved ? null : 'true')}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all shrink-0 ${
                  onlySaved
                    ? 'bg-gold text-white border-gold shadow-2xs'
                    : 'bg-white border-[#E8E8E8] text-navy hover:border-gold hover:text-gold'
                }`}
                title="Filter bookmarked master classes"
              >
                <Bookmark size={11} className={onlySaved ? 'fill-current' : ''} />
                <span>Saved ({bookmarkedCount})</span>
              </button>
            </div>

            {/* Active Filter Chips & Results Count */}
            {hasActiveFilters && (
              <div className="flex items-center justify-between gap-2 pt-3 border-t border-[#E8E8E8] flex-wrap text-xs">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-muted font-medium">Active:</span>

                  {search && (
                    <span className="inline-flex items-center gap-1 bg-[#FAF9F6] border border-[#E8E8E8] px-2.5 py-0.5 rounded-full text-navy">
                      <span>"{search}"</span>
                      <X size={11} className="cursor-pointer hover:text-gold" onClick={() => updateFilter('q', '')} />
                    </span>
                  )}

                  {category !== 'All' && (
                    <span className="inline-flex items-center gap-1 bg-[#FAF9F6] border border-[#E8E8E8] px-2.5 py-0.5 rounded-full text-navy">
                      <span>{category}</span>
                      <X size={11} className="cursor-pointer hover:text-gold" onClick={() => updateFilter('category', 'All')} />
                    </span>
                  )}

                  {statusFilter !== 'all' && (
                    <span className="inline-flex items-center gap-1 bg-[#FAF9F6] border border-[#E8E8E8] px-2.5 py-0.5 rounded-full text-navy capitalize">
                      <span>{statusFilter}</span>
                      <X size={11} className="cursor-pointer hover:text-gold" onClick={() => updateFilter('status', 'all')} />
                    </span>
                  )}

                  {onlySaved && (
                    <span className="inline-flex items-center gap-1 bg-[#FAF9F6] border border-gold/40 px-2.5 py-0.5 rounded-full text-navy font-semibold">
                      <Bookmark size={10} className="text-gold fill-current" />
                      <span>Saved only</span>
                      <X size={11} className="cursor-pointer hover:text-gold" onClick={() => updateFilter('saved', null)} />
                    </span>
                  )}

                  <button
                    onClick={clearAllFilters}
                    className="text-xs text-gold font-bold hover:underline pl-1"
                  >
                    Clear all filters
                  </button>
                </div>

                <span className="text-xs font-mono text-muted">
                  Showing <strong>{filteredWorkshops.length}</strong> of {workshops.length} workshops
                </span>
              </div>
            )}
          </div>

          {/* Error Banner */}
          {error && (
            <div className="bg-red-50 border border-red-100 rounded-2xl p-6 text-center max-w-md mx-auto mb-10">
              <p className="text-red-700 text-xs font-semibold mb-2">⚠️ {error}</p>
              <button onClick={loadData} className="btn-primary text-xs py-2 px-4">
                Retry
              </button>
            </div>
          )}

          {/* ─── Render View Mode ─── */}
          {loading ? (
            view === 'list' ? (
              <WorkshopListSkeleton count={4} />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
                <WorkshopCardSkeleton count={6} />
              </div>
            )
          ) : filteredWorkshops.length === 0 ? (
            <EmptyState
              onReset={clearAllFilters}
              categories={CATEGORIES.slice(1)}
              onCategorySelect={(c) => updateFilter('category', c)}
            />
          ) : view === 'grid' ? (
            /* GRID VIEW */
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
            <div className="space-y-3">
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

      {/* ─── RECENTLY VIEWED BY YOU ─── */}
      {recentItems.length >= 2 && (
        <section className="bg-white py-12 border-b border-[#E8E8E8]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <History size={16} className="text-gold" />
                <h3 className="text-base sm:text-lg font-bold text-navy tracking-tight">
                  Recently Viewed by You
                </h3>
              </div>
              <span className="text-[11px] font-mono text-muted">
                From your recent session
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {recentItems.slice(0, 4).map((item) => (
                <Link
                  key={item.slug}
                  to={`/w/${item.slug}`}
                  className="group bg-[#FAF9F6] border border-[#E8E8E8] rounded-xl p-3.5 hover:border-gold transition-colors flex items-center gap-3 shadow-2xs"
                >
                  {item.bannerImage ? (
                    <img
                      src={item.bannerImage}
                      alt={item.title}
                      className="w-12 h-12 rounded-lg object-cover border border-[#E8E8E8] shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-white border border-[#E8E8E8] flex items-center justify-center text-gold shrink-0 font-bold text-xs">
                      DD
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-bold text-gold uppercase tracking-wider block truncate">
                      {item.category || 'Masterclass'}
                    </span>
                    <p className="text-xs font-semibold text-navy truncate group-hover:text-gold transition-colors">
                      {item.title}
                    </p>
                    <span className="text-[10px] text-muted flex items-center gap-1 mt-0.5">
                      <span>Resume</span>
                      <ArrowRight size={10} className="group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── 5. PAST EVENTS COVERFLOW & ARCHIVED PREVIEWS ─── */}
      <PastEventsCoverflow pastWorkshops={pastWorkshops} />

      {/* ─── 6. FIRMS WE'VE TRAINED & TESTIMONIALS ─── */}
      <FirmsTrustSection settings={settings} />

      {/* ─── 7. PLATFORM FAQ ACCORDION ─── */}
      <PlatformFaqSection />

      {/* ─── 8. NEWSLETTER / GET NOTIFIED FORM ─── */}
      <NewsletterSection />

      {/* Quick View Drawer */}
      <QuickViewDrawer
        workshop={quickViewWorkshop}
        isOpen={Boolean(quickViewWorkshop)}
        onClose={() => setQuickViewWorkshop(null)}
      />
    </>
  );
}
