import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Share2, AlertCircle, Loader2 } from 'lucide-react';
import api from '../lib/api';

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

// Modals
import RegistrationModal from '../components/workshop/RegistrationModal';
import ShareModal from '../components/workshop/ShareModal';

export default function WorkshopDetailPage() {
  const { slug } = useParams();
  const [workshop, setWorkshop] = useState(null);
  const [sections, setSections] = useState([]);
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    api
      .get(`/workshops/${slug}`)
      .then((res) => {
        if (!isMounted) return;
        setWorkshop(res.data.workshop);
        setSections(res.data.sections || []);
        setForm(res.data.form || null);
        setLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err.response?.data?.message || 'Workshop not found');
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [slug]);

  const handleRegistered = (regResult) => {
    // Increment local booked count
    setWorkshop((prev) =>
      prev ? { ...prev, seatsBooked: (prev.seatsBooked || 0) + 1 } : prev
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center py-24">
        <Loader2 className="w-10 h-10 text-gold animate-spin mb-4" />
        <p className="text-muted text-sm font-medium">Loading workshop master class...</p>
      </div>
    );
  }

  if (error || !workshop) {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center py-24 px-4 text-center">
        <div className="w-16 h-16 rounded-full bg-red-50 border border-red-200 text-red-600 flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-navy mb-2">Workshop Not Found</h2>
        <p className="text-muted text-sm max-w-md mx-auto mb-6">
          The master class you are looking for does not exist or may have been unlisted.
        </p>
        <Link to="/workshops" className="btn-primary">
          <ArrowLeft className="w-4 h-4 mr-2" /> Browse All Workshops
        </Link>
      </div>
    );
  }

  // Calculate status
  const now = new Date();
  const seatsTotal = workshop.seatsTotal || 100;
  const seatsBooked = workshop.seatsBooked || 0;
  const isSoldOut = seatsBooked >= seatsTotal;
  const isPast = workshop.endDate && now > new Date(workshop.endDate);
  const isLive =
    workshop.startDate &&
    workshop.endDate &&
    now >= new Date(workshop.startDate) &&
    now <= new Date(workshop.endDate);

  // Status-aware CTA label & handler
  let ctaLabel = 'Reserve Your Spot';
  if (isSoldOut) ctaLabel = 'Join Waitlist';
  else if (isPast) ctaLabel = 'Get Resources';
  else if (isLive) ctaLabel = 'Join Live Session';

  const handleOpenRegister = () => {
    setIsRegisterOpen(true);
  };

  // Sort sections by order
  const sortedSections = [...sections]
    .filter((s) => s.visible !== false)
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  // Custom theme styles if defined
  const themeStyle = workshop.theme
    ? {
        '--color-gold': workshop.theme.gold || '#C8A24F',
        '--color-cream': workshop.theme.cream || '#FAF8F5',
        '--color-navy': workshop.theme.navy || '#0B1528',
      }
    : {};

  const seoTitle = workshop.seo?.title || `${workshop.title} | Workshop Hub`;
  const seoDesc =
    workshop.seo?.description ||
    workshop.shortDescription ||
    'Executive-led master class on Workshop Hub.';
  const ogImg = workshop.seo?.ogImage || workshop.bannerImage;

  return (
    <div className="min-h-screen bg-white" style={themeStyle}>
      <Helmet>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDesc} />
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDesc} />
        {ogImg && <meta property="og:image" content={ogImg} />}
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={seoTitle} />
        <meta name="twitter:description" content={seoDesc} />
        {ogImg && <meta name="twitter:image" content={ogImg} />}
      </Helmet>

      {/* Workshop Sub-Navbar / Breadcrumb & Share bar */}
      <div className="sticky top-16 z-30 bg-white/95 backdrop-blur-md border-b border-border py-3 px-4 sm:px-6">
        <div className="container max-w-6xl mx-auto flex items-center justify-between">
          <Link
            to="/workshops"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-navy transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to all workshops
          </Link>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsShareOpen(true)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-navy hover:text-gold px-3 py-1.5 rounded-full border border-border bg-white hover:border-gold transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" /> Share
            </button>

            <button
              onClick={handleOpenRegister}
              className="btn-primary text-xs py-1.5 px-4 shadow-none"
            >
              {ctaLabel}
            </button>
          </div>
        </div>
      </div>

      {/* Render Dynamic Sections */}
      <main>
        {sortedSections.map((section) => {
          switch (section.type) {
            case 'hero':
              return (
                <HeroSection
                  key={section._id || 'hero'}
                  content={{
                    ...section.content,
                    ctaLabel: isSoldOut ? 'Join Waitlist' : isPast ? 'Get Resources' : section.content?.ctaLabel,
                  }}
                  workshop={workshop}
                  onRegister={handleOpenRegister}
                />
              );

            case 'benefits':
              return (
                <BenefitsSection
                  key={section._id || 'benefits'}
                  content={section.content}
                />
              );

            case 'logos':
              return (
                <LogosSection
                  key={section._id || 'logos'}
                  content={section.content}
                />
              );

            case 'community':
              return (
                <CommunitySection
                  key={section._id || 'community'}
                  content={section.content}
                />
              );

            case 'testimonials':
              return (
                <TestimonialsSection
                  key={section._id || 'testimonials'}
                  content={section.content}
                />
              );

            case 'stages':
              return (
                <StagesSection
                  key={section._id || 'stages'}
                  content={section.content}
                />
              );

            case 'audience':
              return (
                <AudienceSection
                  key={section._id || 'audience'}
                  content={{
                    ...section.content,
                    ctaLabel: isSoldOut ? 'Join Waitlist' : isPast ? 'Get Resources' : section.content?.ctaLabel,
                  }}
                  onRegister={handleOpenRegister}
                />
              );

            case 'trainer':
              return (
                <TrainerSection
                  key={section._id || 'trainer'}
                  content={section.content}
                />
              );

            case 'footer':
              return (
                <WorkshopFooter
                  key={section._id || 'footer'}
                  content={section.content}
                />
              );

            default:
              return null;
          }
        })}
      </main>

      {/* Modals */}
      <RegistrationModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        workshop={workshop}
        form={form}
        onRegistered={handleRegistered}
      />

      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        workshop={workshop}
      />
    </div>
  );
}
