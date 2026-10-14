import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Search, Filter, ChevronDown, Calendar, TrendingUp, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import api from '../lib/api';
import { useSettings } from '../contexts/SettingsContext';
import WorkshopCard from '../components/workshop/WorkshopCard';
import { FadeUp, StaggerContainer, StaggerItem, TextReveal } from '../components/motion/index.jsx';

// Skeleton card
function CardSkeleton() {
  return (
    <div className="bg-white border border-border rounded-card overflow-hidden">
      <div className="skeleton aspect-[16/9]" />
      <div className="p-5 space-y-3">
        <div className="skeleton h-4 rounded w-3/4" />
        <div className="skeleton h-3 rounded w-full" />
        <div className="skeleton h-3 rounded w-2/3" />
        <div className="skeleton h-8 rounded w-1/3 mt-4" />
      </div>
    </div>
  );
}

// Featured workshop banner
function FeaturedBanner({ workshop }) {
  if (!workshop) return null;
  const seatsLeft = Math.max(0, (workshop.seatsTotal || 100) - (workshop.seatsBooked || 0));

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
    >
      <Link to={`/w/${workshop.slug}`}>
        <div className="relative rounded-card overflow-hidden border border-border group hover:shadow-card-hover transition-shadow duration-300">
          {/* Background image */}
          <div className="aspect-[21/9] md:aspect-[3/1] relative overflow-hidden">
            {workshop.bannerImage ? (
              <img
                src={workshop.bannerImage}
                alt={workshop.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-navy to-navy/80" />
            )}
            {/* Dark overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-navy/80 via-navy/50 to-transparent" />
          </div>

          {/* Content overlay */}
          <div className="absolute inset-0 flex items-end p-8">
            <div className="max-w-xl">
              <div className="flex items-center gap-2 mb-3">
                <span className="bg-gold text-white text-xs font-semibold px-3 py-1 rounded-full">Featured</span>
                <span className="bg-white/20 backdrop-blur-sm text-white text-xs font-medium px-2.5 py-1 rounded-full border border-white/10">
                  {workshop.category}
                </span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 leading-tight">{workshop.title}</h2>
              <p className="text-white/80 text-sm mb-4 line-clamp-2">{workshop.shortDescription}</p>

              <div className="flex items-center gap-4 text-white/70 text-xs mb-5">
                {workshop.startDate && (
                  <span className="flex items-center gap-1">
                    <Calendar size={12} />
                    {new Date(workshop.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                )}
                {workshop.timezones?.length > 0 && (
                  <span>{workshop.timezones.map(t => `${t.city} ${t.time}`).join(' · ')}</span>
                )}
                <span className="flex items-center gap-1">
                  <Users size={12} />
                  {seatsLeft} spots left
                </span>
              </div>

              <span className="btn-primary text-sm">
                Reserve Your Spot →
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

// AUM counter for trust section
function TrustCounter({ number, prefix, label }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  return (
    <div ref={ref} className="text-center">
      <p className="text-4xl md:text-5xl font-bold text-navy mb-2">
        {prefix}
        {inView ? <CountUp end={parseFloat(number)} duration={2.5} /> : '0'}B+
      </p>
      <p className="text-muted text-sm">{label}</p>
    </div>
  );
}

const CATEGORIES = ['All', 'Private Equity', 'Venture Capital', 'Family Office', 'Finance', 'Technology'];

export default function HubPage() {
  const { settings } = useSettings();
  const [workshops, setWorkshops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [filter, setFilter] = useState('all'); // all, upcoming, past
  const [featuredWorkshop, setFeaturedWorkshop] = useState(null);

  useEffect(() => {
    loadWorkshops();
  }, []);

  const loadWorkshops = async () => {
    try {
      const { data } = await api.get('/workshops?limit=50');
      setWorkshops(data.workshops || []);

      // Find featured or first upcoming
      const featured = data.workshops?.find(w => w.featured);
      const upcoming = data.workshops?.find(w => w.startDate && new Date(w.startDate) > new Date());
      setFeaturedWorkshop(featured || upcoming || data.workshops?.[0]);
    } catch (err) {
      setError('Failed to load workshops. Make sure the server is running.');
    } finally {
      setLoading(false);
    }
  };

  // Filter workshops
  const now = new Date();
  const filtered = workshops.filter(w => {
    if (search && !w.title.toLowerCase().includes(search.toLowerCase()) &&
        !w.shortDescription?.toLowerCase().includes(search.toLowerCase())) return false;
    if (category !== 'All' && w.category !== category) return false;
    if (filter === 'upcoming' && w.startDate && new Date(w.startDate) <= now) return false;
    if (filter === 'past' && w.endDate && new Date(w.endDate) >= now) return false;
    return true;
  });

  const upcomingWorkshops = workshops.filter(w => !w.endDate || new Date(w.endDate) > now);
  const pastWorkshops = workshops.filter(w => w.endDate && new Date(w.endDate) < now);

  return (
    <>
      <Helmet>
        <title>{settings?.platformName || 'Workshop Hub'} — Live Master Classes for Finance Professionals</title>
        <meta name="description" content={settings?.hubSubtitle || 'Expert-led live workshops for finance and investment professionals.'} />
      </Helmet>

      {/* ─── Hero ─── */}
      <section className="bg-white section-sm">
        <div className="container text-center">
          <FadeUp>
            <span className="badge mb-6 inline-block">LIVE MASTER CLASSES</span>
          </FadeUp>
          <FadeUp delay={0.1}>
            <h1 className="text-display-xl font-bold text-navy mb-6 text-balance">
              {settings?.hubHeadline || 'Build What the Best Funds Already Run'}
            </h1>
          </FadeUp>
          <FadeUp delay={0.2}>
            <p className="text-lg text-muted max-w-2xl mx-auto mb-8 leading-relaxed">
              {settings?.hubSubtitle || 'Live, expert-led master classes for finance and investment professionals.'}
            </p>
          </FadeUp>
          <FadeUp delay={0.3}>
            <a
              href="#workshops"
              className="btn-outline"
              onClick={(e) => { e.preventDefault(); document.getElementById('workshops')?.scrollIntoView({ behavior: 'smooth' }); }}
            >
              Explore Workshops ↓
            </a>
          </FadeUp>
        </div>
      </section>

      {/* ─── Featured Workshop ─── */}
      {featuredWorkshop && (
        <section className="bg-white pb-section">
          <div className="container">
            <FadeUp>
              <p className="section-label mb-4">FEATURED</p>
            </FadeUp>
            <FeaturedBanner workshop={featuredWorkshop} />
          </div>
        </section>
      )}

      {/* ─── Workshops Grid ─── */}
      <section id="workshops" className="bg-cream section">
        <div className="container">
          {/* Heading */}
          <FadeUp>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
              <div>
                <p className="section-label mb-2">ALL WORKSHOPS</p>
                <h2 className="text-display-sm font-bold text-navy">
                  Upcoming Sessions
                </h2>
              </div>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Search */}
                <div className="relative">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                  <input
                    type="text"
                    placeholder="Search workshops..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="input pl-9 text-sm w-full sm:w-52"
                  />
                </div>

                {/* Category filter */}
                <div className="relative">
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="select text-sm pr-8"
                  >
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
                </div>

                {/* Time filter */}
                <div className="flex rounded-input border border-border overflow-hidden">
                  {[['all', 'All'], ['upcoming', 'Upcoming'], ['past', 'Past']].map(([v, l]) => (
                    <button
                      key={v}
                      onClick={() => setFilter(v)}
                      className={`px-4 py-2 text-sm font-medium transition-colors ${
                        filter === v ? 'bg-navy text-white' : 'bg-white text-muted hover:text-navy'
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </FadeUp>

          {/* Error state */}
          {error && (
            <div className="bg-red-50 border border-red-100 rounded-card p-8 text-center">
              <p className="text-red-600 font-medium mb-2">⚠️ {error}</p>
              <button onClick={loadWorkshops} className="btn-outline text-sm mt-2">Retry</button>
            </div>
          )}

          {/* Loading */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1,2,3,4,5,6].map(i => <CardSkeleton key={i} />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-4xl mb-4">🔍</p>
              <h3 className="font-semibold text-navy text-xl mb-2">No workshops found</h3>
              <p className="text-muted">Try adjusting your search or filters</p>
              <button onClick={() => { setSearch(''); setCategory('All'); setFilter('all'); }} className="btn-outline mt-4 text-sm">
                Clear filters
              </button>
            </div>
          ) : (
            <StaggerContainer stagger={0.08} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map(workshop => (
                <StaggerItem key={workshop._id}>
                  <WorkshopCard workshop={workshop} />
                </StaggerItem>
              ))}
            </StaggerContainer>
          )}
        </div>
      </section>

      {/* ─── Past Workshops ─── */}
      {pastWorkshops.length > 0 && (
        <section className="bg-white section">
          <div className="container">
            <FadeUp>
              <div className="mb-8">
                <p className="section-label mb-2">PAST SESSIONS</p>
                <h2 className="text-display-sm font-bold text-navy">Previous Master Classes</h2>
              </div>
            </FadeUp>
            <StaggerContainer stagger={0.08} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pastWorkshops.map(w => (
                <StaggerItem key={w._id}>
                  <WorkshopCard workshop={w} />
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>
      )}

      {/* ─── Global Trust Section ─── */}
      <section className="bg-cream section">
        <div className="container">
          <FadeUp>
            <div className="text-center mb-12">
              <p className="section-label mb-3">TRUSTED BY PROFESSIONALS</p>
              <h2 className="text-display-sm font-bold text-navy">
                Firms We've Trained
              </h2>
            </div>
          </FadeUp>

          {/* AUM counter */}
          <div className="bg-white border border-border rounded-card p-10 mb-10 max-w-2xl mx-auto text-center">
            <TrustCounter
              number={settings?.globalTrust?.aumNumber || '246'}
              prefix={settings?.globalTrust?.aumPrefix || '$'}
              label={settings?.globalTrust?.aumLabel || 'Billion AUM+ Across Trained Firms'}
            />
          </div>

          {/* Testimonials */}
          {settings?.globalTrust?.testimonials?.length > 0 && (
            <StaggerContainer stagger={0.1} className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-3xl mx-auto">
              {settings.globalTrust.testimonials.slice(0, 4).map((t, i) => (
                <StaggerItem key={i}>
                  <div className="bg-white border border-border rounded-card p-5">
                    <p className="text-sm text-navy leading-relaxed mb-3">"{t.quote}"</p>
                    <div>
                      <p className="font-semibold text-navy text-sm">{t.name}</p>
                      <p className="text-xs text-muted">{t.role} · {t.company}</p>
                    </div>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          )}
        </div>
      </section>
    </>
  );
}
