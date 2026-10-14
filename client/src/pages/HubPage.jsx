import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
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
import FirmsTrustSection from '../components/sections/FirmsTrustSection';
import PlatformFaqSection from '../components/sections/PlatformFaqSection';
import NewsletterSection from '../components/sections/NewsletterSection';
import { FadeUp, StaggerContainer, StaggerItem } from '../components/motion/index.jsx';
import { getWorkshopStatus } from '../lib/workshopStatus';

// Skeleton card
function CardSkeleton() {
  return (
    <div className="bg-white border border-[#E8E8E8] rounded-2xl overflow-hidden h-full flex flex-col">
      <div className="skeleton aspect-[16/10]" />
      <div className="p-5 space-y-3 flex-1 flex flex-col">
        <div className="skeleton h-4 rounded w-3/4" />
        <div className="skeleton h-3 rounded w-full" />
        <div className="skeleton h-3 rounded w-2/3" />
        <div className="skeleton h-8 rounded w-1/3 mt-auto pt-4" />
      </div>
    </div>
  );
}

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
  }, [workshops, search, category, statusFilter, dateRange, priceFilter, sortBy]);

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
    sortBy !== 'soonest';

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

      {/* ─── 1. HERO with Live Stats under CTA ─── */}
      <section className="bg-white pt-20 pb-16 sm:pt-24 sm:pb-20 border-b border-[#E8E8E8]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <FadeUp>
            <span className="inline-block text-xs font-semibold tracking-[0.18em] uppercase text-navy/70 border border-[#E8E8E8] px-4 py-1.5 rounded-full mb-6 bg-cream shadow-2xs">
              LIVE EXECUTIVE MASTER CLASSES
            </span>
          </FadeUp>
          <FadeUp delay={0.06}>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-navy mb-6 tracking-tight text-balance leading-[1.12]">
              {settings?.hubHeadline || 'Build What the Best Funds Already Run'}
            </h1>
          </FadeUp>
          <FadeUp delay={0.12}>
            <p className="text-sm sm:text-lg text-muted max-w-2xl mx-auto mb-8 leading-relaxed">
              {settings?.hubSubtitle || 'Live, expert-led master classes for private equity, venture capital, and investment teams.'}
            </p>
          </FadeUp>
          <FadeUp delay={0.18}>
            <div className="flex items-center justify-center gap-3 mb-12">
              <a
                href="#explore"
                className="btn-primary text-xs sm:text-sm py-3 px-7 shadow-xs font-semibold"
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
          <FadeUp delay={0.24}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 pt-10 border-t border-[#E8E8E8] max-w-4xl mx-auto">
              <div className="text-center">
                <p className="text-2xl sm:text-3xl font-extrabold text-navy font-mono">
                  <CountUp end={hubStats?.totalWorkshops || 18} duration={2} />+
                </p>
                <p className="text-[11px] font-semibold text-muted uppercase tracking-wider mt-1">
                  Workshops Hosted
                </p>
              </div>

              <div className="text-center">
                <p className="text-2xl sm:text-3xl font-extrabold text-navy font-mono">
                  <CountUp end={hubStats?.totalAttendees || 1480} duration={2.2} separator="," />+
                </p>
                <p className="text-[11px] font-semibold text-muted uppercase tracking-wider mt-1">
                  Professionals Trained
                </p>
              </div>

              <div className="text-center">
                <p className="text-2xl sm:text-3xl font-extrabold text-navy font-mono">
                  <CountUp end={hubStats?.countries || 18} duration={1.8} />
                </p>
                <p className="text-[11px] font-semibold text-muted uppercase tracking-wider mt-1">
                  Financial Hubs / Countries
                </p>
              </div>

              <div className="text-center">
                <p className="text-2xl sm:text-3xl font-extrabold text-navy font-mono">
                  $<CountUp end={hubStats?.aumTrained || 246} duration={2.2} />B+
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          ) : filteredWorkshops.length === 0 ? (
            <div className="bg-white border border-[#E8E8E8] rounded-2xl p-12 text-center max-w-md mx-auto shadow-2xs">
              <span className="text-4xl block mb-3">🔍</span>
              <h3 className="font-bold text-navy text-base mb-1">No master classes found</h3>
              <p className="text-xs text-muted mb-4">
                Try adjusting your search query, status, or category filters.
              </p>
              <button
                onClick={clearAllFilters}
                className="px-4 py-2 rounded-lg border border-[#E8E8E8] text-xs font-semibold text-navy hover:bg-cream hover:border-gold transition-colors"
              >
                Clear all filters
              </button>
            </div>
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

      {/* ─── 5. PAST SESSIONS SECTION (Resources & Notify Me Capture) ─── */}
      {pastWorkshops.length > 0 && (
        <section className="bg-white py-16 sm:py-20 border-b border-[#E8E8E8]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <FadeUp>
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
                <div>
                  <span className="text-[11px] font-bold text-muted uppercase tracking-widest block mb-1">
                    ARCHIVED LABS
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-bold text-navy tracking-tight">
                    Past Master Classes
                  </h2>
                  <p className="text-xs sm:text-sm text-muted mt-1">
                    Access course recordings, tool summaries, and take-home architectures.
                  </p>
                </div>

                {/* Email Capture for Next Session */}
                <div className="bg-[#FAF9F6] border border-[#E8E8E8] rounded-xl p-3 sm:p-4 max-w-md w-full shrink-0">
                  <span className="text-[10px] font-bold text-navy uppercase tracking-wider block mb-1">
                    Notify me when these rerun
                  </span>
                  {pastNotifySuccess ? (
                    <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-semibold py-1">
                      <CheckCircle2 size={14} className="text-emerald-600" />
                      <span>We will notify you when a rerun is scheduled!</span>
                    </div>
                  ) : (
                    <form onSubmit={handlePastNotifySubmit} className="flex gap-2">
                      <input
                        type="email"
                        value={pastNotifyEmail}
                        onChange={(e) => setPastNotifyEmail(e.target.value)}
                        placeholder="your@fund.com"
                        required
                        className="flex-1 px-3 py-1.5 rounded-lg border border-[#E8E8E8] bg-white text-xs text-navy focus:outline-none focus:border-gold"
                      />
                      <button
                        type="submit"
                        disabled={pastNotifySubmitting}
                        className="btn-primary text-xs py-1.5 px-3 font-semibold shrink-0"
                      >
                        {pastNotifySubmitting ? <Loader2 size={12} className="animate-spin" /> : 'Notify Me'}
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </FadeUp>

            <StaggerContainer
              stagger={0.06}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch"
            >
              {pastWorkshops.map((w) => (
                <StaggerItem key={w._id || w.id} className="h-full">
                  <WorkshopCard workshop={w} onQuickView={setQuickViewWorkshop} />
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>
      )}

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
