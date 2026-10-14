import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Search, ChevronDown } from 'lucide-react';
import api from '../lib/api';
import { useSettings } from '../contexts/SettingsContext';
import WorkshopCard from '../components/workshop/WorkshopCard';
import FeaturedBanner from '../components/workshop/FeaturedBanner';
import FirmsTrustSection from '../components/sections/FirmsTrustSection';
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

const CATEGORIES = ['All', 'Private Equity', 'Venture Capital', 'Family Office', 'Investment Banking', 'AI & FinTech'];

export default function HubPage() {
  const { settings } = useSettings();
  const [workshops, setWorkshops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [filter, setFilter] = useState('all'); // all, upcoming, past

  useEffect(() => {
    loadWorkshops();
  }, []);

  const loadWorkshops = async () => {
    try {
      const { data } = await api.get('/workshops?limit=50');
      setWorkshops(data.workshops || []);
    } catch (err) {
      setError('Failed to load workshops. Make sure the server is running.');
    } finally {
      setLoading(false);
    }
  };

  // Filter workshops using unified getWorkshopStatus
  const filtered = workshops.filter((w) => {
    const computedStatus = getWorkshopStatus(w);
    if (
      search &&
      !w.title.toLowerCase().includes(search.toLowerCase()) &&
      !w.shortDescription?.toLowerCase().includes(search.toLowerCase())
    ) {
      return false;
    }
    if (category !== 'All' && w.category !== category) return false;
    if (filter === 'upcoming' && computedStatus === 'completed') return false;
    if (filter === 'past' && computedStatus !== 'completed') return false;
    return true;
  });

  const featuredList = workshops.filter((w) => w.featured && getWorkshopStatus(w) !== 'completed');
  const fallbackFeatured = workshops.find((w) => getWorkshopStatus(w) !== 'completed') || workshops[0];
  const featuredToDisplay = featuredList.length > 0 ? featuredList : fallbackFeatured ? [fallbackFeatured] : [];

  const pastWorkshops = workshops.filter((w) => getWorkshopStatus(w) === 'completed');

  return (
    <>
      <Helmet>
        <title>{settings?.platformName || 'Workshop Hub'} — Live Master Classes for Finance Professionals</title>
        <meta
          name="description"
          content={settings?.hubSubtitle || 'Expert-led live workshops for finance and investment professionals.'}
        />
      </Helmet>

      {/* ─── Hero with 80px Top Padding to clear Sticky Navbar ─── */}
      <section className="bg-white pt-20 pb-16 sm:pt-24 sm:pb-20 border-b border-[#E8E8E8]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <FadeUp>
            <span className="inline-block text-xs font-semibold tracking-[0.18em] uppercase text-navy/70 border border-[#E8E8E8] px-4 py-1.5 rounded-full mb-6 bg-cream shadow-2xs">
              LIVE MASTER CLASSES
            </span>
          </FadeUp>
          <FadeUp delay={0.08}>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-navy mb-6 tracking-tight text-balance leading-[1.12]">
              {settings?.hubHeadline || 'Build What the Best Funds Already Run'}
            </h1>
          </FadeUp>
          <FadeUp delay={0.16}>
            <p className="text-sm sm:text-lg text-muted max-w-2xl mx-auto mb-8 leading-relaxed">
              {settings?.hubSubtitle || 'Live, expert-led master classes for private equity, venture capital, and investment teams.'}
            </p>
          </FadeUp>
          <FadeUp delay={0.24}>
            <div className="flex items-center justify-center gap-3">
              <a
                href="#workshops"
                className="btn-primary text-xs sm:text-sm py-3 px-6 shadow-xs font-semibold"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('workshops')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Explore Workshops ↓
              </a>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ─── Featured Workshop (Split Layout Carousel) ─── */}
      {featuredToDisplay.length > 0 && (
        <section className="bg-white py-12 sm:py-16 border-b border-[#E8E8E8]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <FadeUp>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <span className="text-[11px] font-bold text-gold uppercase tracking-widest block mb-1">
                    FEATURED MASTERCLASS
                  </span>
                  <h2 className="text-xl sm:text-2xl font-bold text-navy tracking-tight">
                    Flagship Executive Session
                  </h2>
                </div>
              </div>
            </FadeUp>
            <FeaturedBanner workshops={featuredToDisplay} />
          </div>
        </section>
      )}

      {/* ─── Workshops Grid ─── */}
      <section id="workshops" className="bg-[#FAF9F6] py-16 sm:py-20 border-b border-[#E8E8E8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header & Search/Filters */}
          <FadeUp>
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
              <div>
                <span className="text-[11px] font-bold text-muted uppercase tracking-widest block mb-1">
                  CURRENT & UPCOMING
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold text-navy tracking-tight">
                  Master Classes & Labs
                </h2>
              </div>

              {/* Filter controls */}
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Search */}
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                  <input
                    type="text"
                    placeholder="Search masterclasses..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full sm:w-60 pl-9 pr-3 py-2 bg-white border border-[#E8E8E8] rounded-xl text-xs text-navy placeholder:text-muted focus:outline-none focus:border-gold transition-colors"
                  />
                </div>

                {/* Category select */}
                <div className="relative">
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full sm:w-44 px-3 py-2 bg-white border border-[#E8E8E8] rounded-xl text-xs text-navy focus:outline-none focus:border-gold appearance-none pr-8 font-medium cursor-pointer"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
                </div>

                {/* Status Segment Control */}
                <div className="flex bg-white rounded-xl border border-[#E8E8E8] p-1 text-xs">
                  {[
                    ['all', 'All'],
                    ['upcoming', 'Upcoming'],
                    ['past', 'Past'],
                  ].map(([val, label]) => (
                    <button
                      key={val}
                      onClick={() => setFilter(val)}
                      className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                        filter === val
                          ? 'bg-navy text-white shadow-2xs font-semibold'
                          : 'text-muted hover:text-navy'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </FadeUp>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-100 rounded-2xl p-8 text-center max-w-md mx-auto mb-10">
              <p className="text-red-700 text-sm font-semibold mb-2">⚠️ {error}</p>
              <button onClick={loadWorkshops} className="btn-primary text-xs py-2 px-4 mt-2">
                Retry Connection
              </button>
            </div>
          )}

          {/* Grid Rows: Equal height grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white border border-[#E8E8E8] rounded-2xl p-12 text-center max-w-md mx-auto shadow-2xs">
              <span className="text-4xl block mb-3">🔍</span>
              <h3 className="font-bold text-navy text-base mb-1">No matching workshops</h3>
              <p className="text-xs text-muted mb-4">
                Try searching for another keyword or clear current filters.
              </p>
              <button
                onClick={() => {
                  setSearch('');
                  setCategory('All');
                  setFilter('all');
                }}
                className="px-4 py-2 rounded-lg border border-[#E8E8E8] text-xs font-semibold text-navy hover:bg-cream hover:border-gold transition-colors"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <StaggerContainer
              stagger={0.06}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch"
            >
              {filtered.map((workshop) => (
                <StaggerItem key={workshop._id || workshop.id} className="h-full">
                  <WorkshopCard workshop={workshop} />
                </StaggerItem>
              ))}
            </StaggerContainer>
          )}
        </div>
      </section>

      {/* ─── Past Workshops (Only if filter is 'all' and past workshops exist) ─── */}
      {filter === 'all' && pastWorkshops.length > 0 && (
        <section className="bg-white py-16 sm:py-20 border-b border-[#E8E8E8]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <FadeUp>
              <div className="mb-10">
                <span className="text-[11px] font-bold text-muted uppercase tracking-widest block mb-1">
                  ARCHIVED SESSIONS
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold text-navy tracking-tight">
                  Past Master Classes & Recordings
                </h2>
                <p className="text-xs sm:text-sm text-muted mt-1">
                  Access course outlines, tool summaries, and request session recordings.
                </p>
              </div>
            </FadeUp>

            <StaggerContainer
              stagger={0.06}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch"
            >
              {pastWorkshops.map((w) => (
                <StaggerItem key={w._id || w.id} className="h-full">
                  <WorkshopCard workshop={w} />
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>
      )}

      {/* ─── Global Trust Section (AUM counter, Marquee, 2-column verified testimonials) ─── */}
      <FirmsTrustSection settings={settings} />
    </>
  );
}
