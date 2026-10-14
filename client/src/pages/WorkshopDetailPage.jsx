import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  ArrowLeft,
  Share2,
  AlertCircle,
  Loader2,
  Calendar,
  Clock,
  Users,
  User,
  CheckCircle2,
  Download,
  Mail,
  ChevronDown,
  Globe,
  ArrowRight,
  ExternalLink,
  Check,
  Copy,
  MessageCircle,
  Bookmark,
} from 'lucide-react';
import api from '../lib/api';
import { useSettings } from '../contexts/SettingsContext';
import { useBookmarks } from '../lib/bookmarks';
import { recordRecentlyViewed } from '../lib/recentlyViewed';

// Section components
import HeroSection from '../components/sections/HeroSection';
import BenefitsSection from '../components/sections/BenefitsSection';
import LogosSection from '../components/sections/LogosSection';
import CommunitySection from '../components/sections/CommunitySection';
import TestimonialsSection from '../components/sections/TestimonialsSection';
import StagesSection from '../components/sections/StagesSection';
import AudienceSection from '../components/sections/AudienceSection';
import TrainerSection from '../components/sections/TrainerSection';
import WorkshopFooter from '../components/sections/WorkshopFooter';

// Modals & Calendar
import RegistrationModal from '../components/workshop/RegistrationModal';
import AddToCalendarMenu from '../components/calendar/AddToCalendarMenu';
import WorkshopCard from '../components/workshop/WorkshopCard';
import { getWorkshopStatus, getStatusBadgeConfig } from '../lib/workshopStatus';
import {
  TIMEZONE_OPTIONS,
  getSavedTimezone,
  setSavedTimezone,
  formatInTimezone,
} from '../lib/calendarExport';

// Share Bar Component
function ShareBar({ title, url }) {
  const [copied, setCopied] = useState(false);
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <button
        onClick={handleCopy}
        className="p-2 rounded-lg border border-[#E8E8E8] text-navy hover:bg-cream transition-colors text-xs inline-flex items-center gap-1"
        title="Copy Link"
      >
        {copied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
        <span>{copied ? 'Copied' : 'Copy'}</span>
      </button>

      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 rounded-lg border border-[#E8E8E8] text-[#0077B5] hover:bg-cream transition-colors"
        title="Share on LinkedIn"
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
        </svg>
      </a>

      <a
        href={`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 rounded-lg border border-[#E8E8E8] text-navy hover:bg-cream transition-colors"
        title="Share on X"
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      </a>

      <a
        href={`https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 rounded-lg border border-[#E8E8E8] text-[#25D366] hover:bg-cream transition-colors"
        title="Share on WhatsApp"
      >
        <MessageCircle size={13} />
      </a>

      <a
        href={`mailto:?subject=${encodedTitle}&body=Check out this live executive masterclass: ${encodedUrl}`}
        className="p-2 rounded-lg border border-[#E8E8E8] text-navy hover:bg-cream transition-colors"
        title="Share via Email"
      >
        <Mail size={13} />
      </a>
    </div>
  );
}

export default function WorkshopDetailPage() {
  const { slug } = useParams();
  const { settings } = useSettings();

  const [workshop, setWorkshop] = useState(null);
  const [sections, setSections] = useState([]);
  const [form, setForm] = useState(null);
  const [relatedWorkshops, setRelatedWorkshops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');
  const [currentTimezone, setCurrentTimezone] = useState(getSavedTimezone);

  // Notify rerun state for completed sessions
  const [notifyEmail, setNotifyEmail] = useState('');
  const [notifySuccess, setNotifySuccess] = useState(false);
  const [notifySubmitting, setNotifySubmitting] = useState(false);

  const { isBookmarked, toggle: toggleBookmark } = useBookmarks();

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    Promise.all([
      api.get(`/workshops/${slug}`),
      api.get('/workshops?limit=6').catch(() => ({ data: { workshops: [] } })),
    ])
      .then(([res, relatedRes]) => {
        if (!isMounted) return;
        const wData = res.data.workshop;
        setWorkshop(wData);
        if (wData) recordRecentlyViewed(wData);
        setSections(res.data.sections || []);
        setForm(res.data.form || null);
        const related = (relatedRes.data?.workshops || []).filter(
          (w) => w.slug !== slug && getWorkshopStatus(w) !== 'completed'
        );
        setRelatedWorkshops(related);
        setLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err.response?.data?.message || 'Master class not found');
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [slug]);

  // Scroll-spy observer for sticky subnav
  useEffect(() => {
    const handleScroll = () => {
      const anchors = ['overview', 'agenda', 'speaker', 'reviews', 'faq'];
      const scrollY = window.scrollY + 140;

      for (let i = anchors.length - 1; i >= 0; i--) {
        const el = document.getElementById(anchors[i]);
        if (el && el.offsetTop <= scrollY) {
          setActiveSection(anchors[i]);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleTimezoneChange = (e) => {
    const tz = e.target.value;
    setCurrentTimezone(tz);
    setSavedTimezone(tz);
  };

  const handleNotifySubmit = async (e) => {
    e.preventDefault();
    if (!notifyEmail || !notifyEmail.includes('@')) return;
    setNotifySubmitting(true);
    try {
      await api.post('/subscribers', {
        email: notifyEmail.trim(),
        source: 'completed_workshop_rerun',
        workshopSlug: slug,
      });
      setNotifySuccess(true);
      setNotifyEmail('');
    } catch (e) {
      // Handled
    } finally {
      setNotifySubmitting(false);
    }
  };

  const handleRegistered = () => {
    setWorkshop((prev) =>
      prev ? { ...prev, seatsBooked: (prev.seatsBooked || 0) + 1 } : prev
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex flex-col items-center justify-center py-28">
        <Loader2 className="w-8 h-8 text-gold animate-spin mb-3" />
        <p className="text-muted text-xs font-semibold">Loading master class...</p>
      </div>
    );
  }

  if (error || !workshop) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex flex-col items-center justify-center py-28 px-4 text-center">
        <div className="w-14 h-14 rounded-full bg-red-50 border border-red-200 text-red-600 flex items-center justify-center mb-4">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-navy mb-2">Master Class Not Found</h2>
        <p className="text-muted text-xs max-w-sm mx-auto mb-6">
          The requested session could not be located or may have been unlisted.
        </p>
        <Link to="/workshops" className="btn-primary text-xs py-2 px-4">
          <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Return to Workshops
        </Link>
      </div>
    );
  }

  const status = getWorkshopStatus(workshop);
  const badge = getStatusBadgeConfig(status);
  const isPast = status === 'completed';
  const isSoldOut = status === 'sold-out';

  const seatsTotal = Number(workshop.seatsTotal ?? 100);
  const seatsBooked = Number(workshop.seatsBooked ?? 0);
  const seatsLeft = Math.max(0, seatsTotal - seatsBooked);
  const fillPercentage = seatsTotal > 0 ? Math.min(100, Math.round((seatsBooked / seatsTotal) * 100)) : 0;

  const currentUrl = `${window.location.origin}/w/${workshop.slug}`;
  const startDateFormatted = formatInTimezone(workshop.startDate, currentTimezone, 'full');

  // JSON-LD Structured Event Schema
  const eventSchema = {
    '@context': 'https://schema.org',
    '@type': 'EducationEvent',
    name: workshop.title,
    description: workshop.shortDescription || workshop.title,
    startDate: workshop.startDate || new Date().toISOString(),
    endDate: workshop.endDate || workshop.startDate || new Date().toISOString(),
    eventAttendanceMode: 'https://schema.org/OnlineEventAttendanceMode',
    eventStatus: isPast
      ? 'https://schema.org/EventMovedOnline'
      : 'https://schema.org/EventScheduled',
    location: {
      '@type': 'VirtualLocation',
      url: currentUrl,
    },
    image: [workshop.bannerImage || `${window.location.origin}/Logo.png`],
    organizer: {
      '@type': 'Organization',
      name: settings?.platformName || 'Workshop Hub',
      url: window.location.origin,
    },
    offers: {
      '@type': 'Offer',
      price: workshop.price || 0,
      priceCurrency: 'USD',
      availability: isSoldOut
        ? 'https://schema.org/SoldOut'
        : 'https://schema.org/InStock',
      url: currentUrl,
      validFrom: workshop.createdAt || new Date().toISOString(),
    },
    performer: {
      '@type': 'Person',
      name: 'Ayub',
      jobTitle: 'Founder & Principal, Due Diligence Lab',
    },
  };

  // Sort sections by order
  const sortedSections = [...sections]
    .filter((s) => s.visible !== false)
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  const navAnchors = [
    { id: 'overview', label: 'Overview' },
    { id: 'agenda', label: 'Curriculum & Agenda' },
    { id: 'speaker', label: 'Trainer' },
    { id: 'reviews', label: 'Testimonials' },
    { id: 'faq', label: 'FAQ' },
  ];

  const scrollToAnchor = (id) => {
    const el = document.getElementById(id);
    if (el) {
      const top = el.getBoundingClientRect().top + window.pageYOffset - 120;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* ─── SEO Metadata & JSON-LD Event Schema ─── */}
      <Helmet>
        <title>{workshop.title} | Executive Master Class</title>
        <meta name="description" content={workshop.shortDescription || workshop.title} />
        <meta property="og:title" content={workshop.title} />
        <meta property="og:description" content={workshop.shortDescription || workshop.title} />
        {workshop.bannerImage && <meta property="og:image" content={workshop.bannerImage} />}
        <meta property="og:type" content="event" />
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json">{JSON.stringify(eventSchema)}</script>
      </Helmet>

      {/* ─── Sticky Sub-Navigation with Scroll-Spy Highlighting ─── */}
      <div className="sticky top-16 z-30 bg-white/95 backdrop-blur-md border-b border-[#E8E8E8] py-2.5 px-4 sm:px-6 shadow-2xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Breadcrumb back */}
          <Link
            to="/workshops"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-navy transition-colors shrink-0"
          >
            <ArrowLeft size={13} />
            <span className="hidden sm:inline">All Master Classes</span>
          </Link>

          {/* Anchor Links with Scroll-Spy Gold Underline */}
          <div className="hidden md:flex items-center gap-1 overflow-x-auto whitespace-nowrap">
            {navAnchors.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => scrollToAnchor(item.id)}
                  className={`text-xs px-3 py-1.5 rounded-lg transition-colors relative ${
                    isActive
                      ? 'text-navy font-bold'
                      : 'text-muted hover:text-navy hover:bg-cream'
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-3 right-3 h-[2px] bg-gold rounded-full" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Right Action: Share & CTA */}
          <div className="flex items-center gap-2">
            <ShareBar title={workshop.title} url={currentUrl} />

            <button
              onClick={() => setIsRegisterOpen(true)}
              className="btn-primary text-xs py-1.5 px-4 font-semibold shrink-0"
            >
              {isPast ? 'Get Resources' : isSoldOut ? 'Join Waitlist' : 'Reserve Spot'}
            </button>
          </div>
        </div>
      </div>

      {/* ─── Main Content Container with Desktop Floating Registration Card ─── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* LEFT COLUMN: Main Dynamic Sections (8 cols) */}
          <div className="lg:col-span-8 space-y-12 min-w-0">
            {/* Overview Section */}
            <div id="overview">
              {sortedSections.map((section) => {
                switch (section.type) {
                  case 'hero':
                    return (
                      <HeroSection
                        key={section._id || 'hero'}
                        content={section.content}
                        workshop={workshop}
                        onRegister={() => setIsRegisterOpen(true)}
                      />
                    );
                  case 'benefits':
                    return <BenefitsSection key={section._id} content={section.content} />;
                  case 'logos':
                    return <LogosSection key={section._id} content={section.content} />;
                  case 'community':
                    return <CommunitySection key={section._id} content={section.content} />;
                  default:
                    return null;
                }
              })}
            </div>

            {/* Agenda & Curriculum Section Anchor */}
            <div id="agenda" className="scroll-mt-32">
              {sortedSections
                .filter((s) => s.type === 'stages')
                .map((section) => (
                  <StagesSection key={section._id} content={section.content} />
                ))}

              {/* Prerequisites & Requirements Block */}
              <div className="mt-8 bg-[#FAF9F6] border border-[#E8E8E8] rounded-2xl p-6 sm:p-8">
                <span className="text-[10px] font-bold text-gold uppercase tracking-widest block mb-1">
                  EXECUTIVE LAB PREREQUISITES
                </span>
                <h3 className="text-lg font-bold text-navy mb-4">
                  Who Should Attend & Requirements
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-muted">
                  <div className="bg-white border border-[#E8E8E8] rounded-xl p-4">
                    <strong className="text-navy block mb-1">Who It's For</strong>
                    <span>Private Equity partners, Principals, VC deal sponsors, and senior investment analysts.</span>
                  </div>
                  <div className="bg-white border border-[#E8E8E8] rounded-xl p-4">
                    <strong className="text-navy block mb-1">Technical Level</strong>
                    <span>No engineering or deep programming background required; focuses on agent stacks & prompt orchestration.</span>
                  </div>
                  <div className="bg-white border border-[#E8E8E8] rounded-xl p-4">
                    <strong className="text-navy block mb-1">Take-Home Deliverables</strong>
                    <span>Production agent architectures, prompt harness blueprints, and permanent session video archives.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Trainer Section Anchor */}
            <div id="speaker" className="scroll-mt-32">
              {sortedSections
                .filter((s) => s.type === 'trainer')
                .map((section) => (
                  <TrainerSection key={section._id} content={section.content} />
                ))}
            </div>

            {/* Reviews Section Anchor */}
            <div id="reviews" className="scroll-mt-32">
              {sortedSections
                .filter((s) => s.type === 'testimonials')
                .map((section) => (
                  <TestimonialsSection key={section._id} content={section.content} />
                ))}
            </div>

            {/* Audience Section */}
            {sortedSections
              .filter((s) => s.type === 'audience')
              .map((section) => (
                <AudienceSection
                  key={section._id}
                  content={section.content}
                  onRegister={() => setIsRegisterOpen(true)}
                />
              ))}

            {/* FAQ Section Anchor */}
            <div id="faq" className="scroll-mt-32">
              <PlatformFaqSection />
            </div>

            {/* Completed Workshop State: Resources & Rerun Notification Form */}
            {isPast && (
              <div className="bg-[#FAF9F6] border border-[#E8E8E8] rounded-2xl p-8 text-center space-y-4">
                <span className="text-[10px] font-bold text-gold uppercase tracking-widest block">
                  ARCHIVED MASTER CLASS
                </span>
                <h3 className="text-xl font-bold text-navy">
                  Looking to catch the next run of this session?
                </h3>
                <p className="text-xs text-muted max-w-md mx-auto leading-relaxed">
                  Enter your email below. Our team notifies alumni and verified sponsors as soon as a new cohort date is scheduled.
                </p>

                {notifySuccess ? (
                  <div className="bg-emerald-50 border border-emerald-200/80 rounded-xl p-3 text-xs text-emerald-800 font-semibold max-w-sm mx-auto">
                    ✓ You're on the priority notify list!
                  </div>
                ) : (
                  <form onSubmit={handleNotifySubmit} className="max-w-sm mx-auto flex gap-2">
                    <input
                      type="email"
                      value={notifyEmail}
                      onChange={(e) => setNotifyEmail(e.target.value)}
                      placeholder="your@firm.com"
                      required
                      className="flex-1 px-3 py-2 rounded-xl border border-[#E8E8E8] bg-white text-xs text-navy focus:outline-none focus:border-gold"
                    />
                    <button
                      type="submit"
                      disabled={notifySubmitting}
                      className="btn-primary text-xs py-2 px-4 font-semibold shrink-0"
                    >
                      {notifySubmitting ? 'Submitting...' : 'Notify Me'}
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Desktop Floating Registration Card (4 cols) */}
          <div className="hidden lg:block lg:col-span-4 sticky top-28 space-y-4">
            <div className="bg-white border border-[#E8E8E8] rounded-2xl p-6 shadow-card space-y-5">
              {/* Badge & Category */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] px-2.5 py-0.5 rounded-full ${badge.className}`}>
                    {badge.label}
                  </span>
                  <button
                    onClick={() => toggleBookmark(workshop.slug)}
                    className={`w-6 h-6 rounded-full border flex items-center justify-center transition-colors shadow-2xs ${
                      isBookmarked(workshop.slug)
                        ? 'bg-gold text-white border-gold'
                        : 'border-[#E8E8E8] text-muted hover:text-gold bg-[#FAFAFA]'
                    }`}
                    title={isBookmarked(workshop.slug) ? 'Remove bookmark' : 'Save to bookmarks'}
                    aria-label="Save workshop"
                  >
                    <Bookmark size={11} className={isBookmarked(workshop.slug) ? 'fill-current' : ''} />
                  </button>
                </div>
                <span className="text-xs font-semibold text-gold font-mono">
                  {workshop.price && workshop.price > 0 ? `$${workshop.price}` : 'Executive Access (Free)'}
                </span>
              </div>

              {/* Date & Timezone with Converter Dropdown */}
              <div className="space-y-2 pt-2 border-t border-[#E8E8E8]">
                <div className="flex items-start gap-2">
                  <Calendar size={14} className="text-gold mt-0.5 shrink-0" />
                  <div className="text-xs">
                    <strong className="text-navy block leading-snug">{startDateFormatted}</strong>
                    <div className="flex items-center gap-1 mt-1 text-muted">
                      <Globe size={11} className="text-gold shrink-0" />
                      <select
                        value={currentTimezone}
                        onChange={handleTimezoneChange}
                        className="bg-transparent border-none text-[11px] font-medium text-navy cursor-pointer focus:outline-none p-0"
                      >
                        {TIMEZONE_OPTIONS.map((opt) => (
                          <option key={opt.id} value={opt.tz}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {workshop.timezones?.length > 0 && (
                  <div className="flex items-center gap-1.5 text-[11px] text-muted pl-6">
                    <Clock size={11} className="text-navy/60 shrink-0" />
                    <span>{workshop.timezones.map((t) => `${t.city} ${t.time}`).join(' · ')}</span>
                  </div>
                )}
              </div>

              {/* Seats Progress */}
              {!isPast && (
                <div className="pt-2 border-t border-[#E8E8E8]">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-muted flex items-center gap-1">
                      <Users size={12} className="text-navy/70" />
                      <span>Capacity</span>
                    </span>
                    <span className="font-mono text-xs">
                      {isSoldOut ? (
                        <strong className="text-navy">Sold Out</strong>
                      ) : (
                        <span>
                          <strong className="text-navy">{seatsLeft}</strong> spots remaining
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-[#F0F0F0] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        isSoldOut ? 'bg-navy' : fillPercentage >= 80 ? 'bg-amber-500' : 'bg-gold'
                      }`}
                      style={{ width: `${fillPercentage}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Main CTA */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={() => setIsRegisterOpen(true)}
                  className="w-full btn-primary text-sm py-3 justify-center font-semibold shadow-xs"
                >
                  {isPast ? 'Request Recording' : isSoldOut ? 'Join Verified Waitlist' : 'Reserve Your Spot'}
                </button>

                <div className="flex items-center justify-between pt-1">
                  <AddToCalendarMenu workshop={workshop} buttonClassName="text-xs text-navy hover:text-gold flex items-center gap-1 font-semibold" />
                  <span className="text-[11px] text-muted">No credit card required</span>
                </div>
              </div>

              {/* Share Box */}
              <div className="pt-3 border-t border-[#E8E8E8]">
                <span className="text-[10px] font-bold text-muted uppercase tracking-wider block mb-2">
                  Share with Deal Team
                </span>
                <ShareBar title={workshop.title} url={currentUrl} />
              </div>
            </div>
          </div>
        </div>

        {/* ─── Related Workshops Carousel at the Bottom ─── */}
        {relatedWorkshops.length > 0 && (
          <div className="mt-20 pt-12 border-t border-[#E8E8E8]">
            <div className="flex items-center justify-between mb-8">
              <div>
                <span className="text-[11px] font-bold text-gold uppercase tracking-widest block mb-1">
                  MORE IN THIS SERIES
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-navy tracking-tight">
                  Related Master Classes & Labs
                </h3>
              </div>
              <Link
                to="/workshops"
                className="text-xs font-semibold text-navy hover:text-gold transition-colors flex items-center gap-1"
              >
                <span>View all ({relatedWorkshops.length + 1})</span>
                <ArrowRight size={13} />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedWorkshops.slice(0, 3).map((w) => (
                <WorkshopCard key={w._id || w.id} workshop={w} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ─── Mobile Sticky Bottom CTA Bar ─── */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E8E8E8] p-3 shadow-card-hover flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-bold text-navy truncate leading-tight">{workshop.title}</p>
          <p className="text-[10px] text-muted font-mono">
            {isPast ? 'Completed' : isSoldOut ? 'Capacity reached' : `${seatsLeft} spots left`}
          </p>
        </div>
        <button
          onClick={() => setIsRegisterOpen(true)}
          className="btn-primary text-xs py-2 px-4 shrink-0 font-semibold"
        >
          {isPast ? 'Resources' : isSoldOut ? 'Waitlist' : 'Reserve Spot'}
        </button>
      </div>

      {/* Footer */}
      {sortedSections
        .filter((s) => s.type === 'footer')
        .map((section) => (
          <WorkshopFooter key={section._id} content={section.content} />
        ))}

      {/* Registration Modal */}
      <RegistrationModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        workshop={workshop}
        form={form}
        onRegistered={handleRegistered}
      />
    </div>
  );
}
