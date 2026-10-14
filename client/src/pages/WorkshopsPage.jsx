import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Search, Filter, Sparkles, X, Loader2 } from 'lucide-react';
import api from '../lib/api';
import WorkshopCard from '../components/workshop/WorkshopCard';
import { WorkshopCardSkeleton } from '../components/workshop/WorkshopCardSkeleton';
import EmptyState from '../components/workshop/EmptyState';
import { FadeUp, StaggerContainer, StaggerItem } from '../components/motion/index.jsx';
import { getWorkshopStatus } from '../lib/workshopStatus';

export default function WorkshopsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [workshops, setWorkshops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || searchParams.get('filter') || 'all');
  const [sortBy, setSortBy] = useState('date-asc');

  useEffect(() => {
    const filterFromUrl = searchParams.get('status') || searchParams.get('filter');
    if (filterFromUrl) setStatusFilter(filterFromUrl);
    const catFromUrl = searchParams.get('category');
    if (catFromUrl) setSelectedCategory(catFromUrl);
  }, [searchParams]);

  useEffect(() => {
    setLoading(true);
    api
      .get('/workshops')
      .then((res) => {
        setWorkshops(res.data.workshops || []);
      })
      .catch((err) => {
        console.error('Failed to load workshops', err);
      })
      .finally(() => setLoading(false));
  }, []);

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
    const now = new Date();
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
        if (statusFilter !== 'all' && statusFilter !== 'upcoming' && statusFilter !== 'past' && st !== statusFilter) return false;

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
    setSelectedCategory('all');
    setStatusFilter('all');
    setSearchParams({});
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] pt-20 pb-16 md:pt-24 md:pb-20">
      <Helmet>
        <title>All Master Classes & Workshops | Workshop Hub</title>
        <meta
          name="description"
          content="Explore our upcoming and on-demand live master classes in deal flow, venture intelligence, and private equity automation."
        />
      </Helmet>

      <div className="container max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <FadeUp delay={0}>
            <span className="badge mb-3">EXECUTIVE SESSIONS</span>
          </FadeUp>
          <FadeUp delay={0.1}>
            <h1 className="text-display-md text-navy font-bold mb-4">
              All Master Classes
            </h1>
          </FadeUp>
          <FadeUp delay={0.2}>
            <p className="text-muted text-base max-w-xl mx-auto">
              Real-world workflows and operational leverage taught live by industry leaders.
            </p>
          </FadeUp>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white rounded-2xl border border-border p-4 md:p-6 mb-10 shadow-sm">
          <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between mb-4">
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
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Status Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-cream rounded-xl border border-border shrink-0 self-start md:self-auto">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  statusFilter === 'all'
                    ? 'bg-white text-navy shadow-sm border border-border'
                    : 'text-muted hover:text-navy'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setStatusFilter('upcoming')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  statusFilter === 'upcoming'
                    ? 'bg-white text-navy shadow-sm border border-border'
                    : 'text-muted hover:text-navy'
                }`}
              >
                Upcoming
              </button>
              <button
                onClick={() => setStatusFilter('past')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  statusFilter === 'past'
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
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3.5 py-2.5 rounded-xl border border-border bg-cream text-navy text-xs font-semibold focus:outline-none focus:border-gold"
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
                onClick={() => setSelectedCategory(cat)}
                className={`text-xs px-3 py-1 rounded-full border transition-all ${
                  selectedCategory === cat
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
          </span>
          {(searchTerm || selectedCategory !== 'all' || statusFilter !== 'all') && (
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <WorkshopCardSkeleton count={6} />
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredWorkshops.length === 0 && (
          <EmptyState
            onReset={clearFilters}
            categories={categories.filter((c) => c !== 'all')}
            onCategorySelect={(cat) => setSelectedCategory(cat)}
          />
        )}

        {/* Workshop Cards Grid */}
        {!loading && filteredWorkshops.length > 0 && (
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWorkshops.map((workshop) => (
              <StaggerItem key={workshop._id}>
                <WorkshopCard workshop={workshop} />
              </StaggerItem>
            ))}
          </StaggerContainer>
        )}
      </div>
    </div>
  );
}
