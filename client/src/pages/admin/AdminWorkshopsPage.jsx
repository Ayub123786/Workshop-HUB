import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Plus,
  Copy,
  Trash2,
  Edit,
  ExternalLink,
  ClipboardList,
  Search,
  Filter,
  ArrowUpDown,
  Calendar,
  Sparkles,
  Loader2,
  Check,
  X,
  AlertTriangle,
  ChevronUp,
  ChevronDown,
  Image as ImageIcon,
} from 'lucide-react';
import api from '../../lib/api';
import ImageField from '../../components/admin/ImageField';
import ImagePickerModal from '../../components/admin/ImagePickerModal';

export default function AdminWorkshopsPage() {
  const [workshops, setWorkshops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal for new workshop
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Private Equity');
  const [newSeats, setNewSeats] = useState(100);
  const [newDesc, setNewDesc] = useState('');
  const [templateWorkshopId, setTemplateWorkshopId] = useState('');
  const [newBannerImage, setNewBannerImage] = useState('');
  const [quickImageWorkshop, setQuickImageWorkshop] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchWorkshops();
    if (location.pathname.endsWith('/new')) {
      setIsCreateOpen(true);
    }
  }, [location.pathname]);

  const fetchWorkshops = async () => {
    setLoading(true);
    try {
      const res = await api.get('/workshops/admin/all');
      const list = res.data.workshops || [];
      setWorkshops(list);
      // Pre-select master template or first workshop if none selected yet
      if (!templateWorkshopId && list.length > 0) {
        const master = list.find((w) => w.slug === 'pe-deal-flow-automation');
        setTemplateWorkshopId(master?._id || list[0]._id);
      }
    } catch (err) {
      console.error('Failed to fetch workshops', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setCreating(true);

    try {
      const res = await api.post('/workshops', {
        title: newTitle.trim(),
        shortDescription: newDesc.trim(),
        category: newCategory,
        seatsTotal: Number(newSeats) || 100,
        status: 'draft',
        showOnHub: true,
        templateWorkshopId: templateWorkshopId || undefined,
        bannerImage: newBannerImage.trim() || undefined,
      });

      setIsCreateOpen(false);
      setNewTitle('');
      setNewDesc('');
      setNewBannerImage('');
      if (res.data.workshop?._id) {
        navigate(`/admin/workshops/${res.data.workshop._id}/edit`);
      } else {
        fetchWorkshops();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create workshop');
    } finally {
      setCreating(false);
    }
  };

  const handleUpdateWorkshopImage = async (workshopId, newUrl) => {
    try {
      await api.put(`/workshops/${workshopId}`, { bannerImage: newUrl });
      setWorkshops((prev) =>
        prev.map((w) => (w._id === workshopId ? { ...w, bannerImage: newUrl } : w))
      );
      setQuickImageWorkshop(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update workshop image');
    }
  };

  const handleDuplicate = async (id) => {
    setActionLoadingId(id);
    try {
      const res = await api.post(`/workshops/${id}/duplicate`);
      if (res.data.workshop) {
        setWorkshops((prev) => [res.data.workshop, ...prev]);
        alert('Workshop duplicated successfully!');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to duplicate workshop');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"? This cannot be undone.`)) {
      return;
    }
    setActionLoadingId(id);
    try {
      await api.delete(`/workshops/${id}`);
      setWorkshops((prev) => prev.filter((w) => w._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete workshop');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    setActionLoadingId(id);
    try {
      const res = await api.put(`/workshops/${id}`, { status: newStatus });
      setWorkshops((prev) =>
        prev.map((w) => (w._id === id ? { ...w, status: newStatus } : w))
      );
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleToggleFeatured = async (id, currentVal) => {
    setActionLoadingId(id);
    try {
      await api.put(`/workshops/${id}`, { featured: !currentVal });
      setWorkshops((prev) =>
        prev.map((w) => (w._id === id ? { ...w, featured: !currentVal } : w))
      );
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update featured flag');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleMoveOrder = async (index, direction) => {
    const newWorkshops = [...workshops];
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= newWorkshops.length) return;

    const temp = newWorkshops[index];
    newWorkshops[index] = newWorkshops[targetIndex];
    newWorkshops[targetIndex] = temp;

    // Update state immediately for instant feedback
    setWorkshops(newWorkshops);

    // Save orders
    try {
      await Promise.all(
        newWorkshops.map((w, idx) =>
          api.put(`/workshops/${w._id}`, { displayOrder: idx })
        )
      );
    } catch (err) {
      console.error('Failed to save display order', err);
    }
  };

  const filteredWorkshops = workshops.filter((w) => {
    if (statusFilter !== 'all' && w.status !== statusFilter) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        w.title?.toLowerCase().includes(term) ||
        w.slug?.toLowerCase().includes(term) ||
        w.category?.toLowerCase().includes(term)
      );
    }
    return true;
  });

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy">Manage Workshops</h1>
          <p className="text-xs text-muted mt-1">
            Create, edit, duplicate, reorder, and configure landing page content.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsCreateOpen(true)}
            className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" /> Create Workshop
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl border border-border p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by title, slug or category..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-border bg-cream text-navy text-xs focus:outline-none focus:border-gold"
          />
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs text-muted">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-border bg-cream text-navy text-xs font-semibold focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Workshops List */}
      <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <Loader2 className="w-8 h-8 text-gold animate-spin mx-auto mb-3" />
            <p className="text-xs text-muted">Loading workshops...</p>
          </div>
        ) : filteredWorkshops.length === 0 ? (
          <div className="p-12 text-center text-muted text-xs">
            No workshops found. Create a new one or clear search filters.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredWorkshops.map((w, index) => {
              const isBusy = actionLoadingId === w._id;
              return (
                <div
                  key={w._id}
                  className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-cream/40 transition-colors"
                >
                  {/* Left Column: Reorder Arrows & Info */}
                  <div className="flex items-center gap-4 min-w-0">
                    {/* Reorder Buttons */}
                    <div className="flex flex-col gap-1 shrink-0 text-muted">
                      <button
                        onClick={() => handleMoveOrder(index, -1)}
                        disabled={index === 0}
                        title="Move Up"
                        className="p-1 rounded hover:bg-cream hover:text-navy disabled:opacity-30 disabled:hover:bg-transparent"
                      >
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleMoveOrder(index, 1)}
                        disabled={index === filteredWorkshops.length - 1}
                        title="Move Down"
                        className="p-1 rounded hover:bg-cream hover:text-navy disabled:opacity-30 disabled:hover:bg-transparent"
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Banner Image with Quick Edit */}
                    <div
                      onClick={() => setQuickImageWorkshop(w)}
                      className="w-20 h-14 rounded-lg bg-cream-dark overflow-hidden shrink-0 border border-border cursor-pointer relative group shadow-2xs hover:border-gold transition-all"
                      title="Click to set or change workshop cover image"
                    >
                      {w.bannerImage ? (
                        <img
                          src={w.bannerImage}
                          alt=""
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-[10px] font-bold text-muted group-hover:text-gold transition-colors">
                          <ImageIcon className="w-4 h-4 mb-0.5 opacity-60" />
                          <span>+ Image</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-navy/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-semibold">
                        Change
                      </div>
                    </div>

                    {/* Meta info */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <select
                          value={w.status}
                          onChange={(e) => handleStatusChange(w._id, e.target.value)}
                          className="text-xs font-semibold py-0.5 px-2 rounded-full border border-border bg-white cursor-pointer"
                        >
                          <option value="draft">Draft</option>
                          <option value="published">Published</option>
                          <option value="archived">Archived</option>
                        </select>

                        <button
                          onClick={() => handleToggleFeatured(w._id, w.featured)}
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border transition-all ${
                            w.featured
                              ? 'bg-gold/20 text-gold border-gold/40'
                              : 'bg-white text-muted border-border hover:border-gold'
                          }`}
                        >
                          {w.featured ? '★ Featured' : '☆ Make Featured'}
                        </button>

                        <span className="text-xs text-muted capitalize">
                          {w.category || 'General'}
                        </span>
                      </div>

                      <h3 className="text-sm font-bold text-navy truncate">{w.title}</h3>
                      <p className="text-[11px] text-muted flex items-center gap-3 mt-1 flex-wrap">
                        <span className="font-mono">/w/{w.slug}</span>
                        <span>• {w.seatsBooked || 0} / {w.seatsTotal || 100} booked</span>
                        {w.startDate && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-gold" />
                            {new Date(w.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Actions Right */}
                  <div className="flex items-center gap-2 self-end lg:self-center shrink-0">
                    <Link
                      to={`/admin/workshops/${w._id}/edit`}
                      className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5"
                    >
                      <Edit className="w-3.5 h-3.5" /> Edit Sections
                    </Link>

                    <Link
                      to={`/admin/workshops/${w._id}/form`}
                      className="p-2 rounded-lg border border-border hover:bg-cream text-navy transition-colors"
                      title="Form Builder"
                    >
                      <ClipboardList className="w-4 h-4" />
                    </Link>

                    <button
                      onClick={() => handleDuplicate(w._id)}
                      disabled={isBusy}
                      className="p-2 rounded-lg border border-border hover:bg-cream text-navy transition-colors"
                      title="Duplicate Workshop"
                    >
                      <Copy className="w-4 h-4" />
                    </button>

                    <Link
                      to={`/w/${w.slug}`}
                      target="_blank"
                      className="p-2 rounded-lg border border-border hover:bg-cream text-muted hover:text-navy transition-colors"
                      title="View Public Page"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>

                    <button
                      onClick={() => handleDelete(w._id, w.title)}
                      disabled={isBusy}
                      className="p-2 rounded-lg border border-border hover:bg-red-50 text-muted hover:text-red-600 transition-colors"
                      title="Delete Workshop"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl border border-border w-full max-w-md p-6 max-h-[90vh] overflow-y-auto my-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-navy">Create New Workshop</h3>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="p-1 rounded-full text-muted hover:bg-cream"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-navy uppercase tracking-wider mb-1">
                  Workshop Title *
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. M&A Deal Flow Automation Master Class"
                  required
                  className="w-full px-3 py-2 rounded-lg border border-border bg-white text-navy text-xs focus:outline-none focus:border-gold"
                />
              </div>

              {/* Template Source Selection */}
              <div>
                <label className="block text-xs font-semibold text-navy uppercase tracking-wider mb-1 flex items-center justify-between">
                  <span>Template Source (Copy From)</span>
                  <span className="text-[10px] text-gold font-normal">reusable sections</span>
                </label>
                <select
                  value={templateWorkshopId}
                  onChange={(e) => setTemplateWorkshopId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-white text-navy text-xs focus:outline-none focus:border-gold font-medium"
                >
                  {workshops.map((w) => (
                    <option key={w._id} value={w._id}>
                      {w.slug === 'pe-deal-flow-automation'
                        ? '★ PE Deal Flow Automation (Master Template with Ayub)'
                        : `${w.title} (/w/${w.slug})`}
                    </option>
                  ))}
                  <option value="none">Blank Sections (No template copy)</option>
                </select>
                <p className="text-[11px] text-muted mt-1">
                  All landing page sections (Ayub trainer card, curriculum, logos, benefits, and form) will be copied from this template for you to edit.
                </p>
              </div>

              {/* Workshop Cover / Banner Image */}
              <div>
                <ImageField
                  label="Workshop Cover / Banner Image"
                  value={newBannerImage}
                  onChange={setNewBannerImage}
                  slotHint="card-banner"
                  helperText="Thumbnail displayed on Hub cards and event page"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy uppercase tracking-wider mb-1">
                  Category
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-white text-navy text-xs focus:outline-none focus:border-gold"
                >
                  <option value="Private Equity">Private Equity</option>
                  <option value="Venture Capital">Venture Capital</option>
                  <option value="Family Office">Family Office</option>
                  <option value="Investment Banking">Investment Banking</option>
                  <option value="AI & FinTech">AI & FinTech</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy uppercase tracking-wider mb-1">
                  Short Description
                </label>
                <textarea
                  rows={2}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Brief summary for cards and search..."
                  className="w-full px-3 py-2 rounded-lg border border-border bg-white text-navy text-xs focus:outline-none focus:border-gold resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy uppercase tracking-wider mb-1">
                  Total Seats Capacity
                </label>
                <input
                  type="number"
                  value={newSeats}
                  onChange={(e) => setNewSeats(e.target.value)}
                  min={1}
                  max={1000}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-white text-navy text-xs focus:outline-none focus:border-gold"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 rounded-lg border border-border text-xs font-semibold text-muted hover:text-navy"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="btn-primary text-xs py-2 px-4 shadow-xs"
                >
                  {creating ? 'Creating...' : 'Create & Edit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Image Picker Modal for Rows */}
      {quickImageWorkshop && (
        <ImagePickerModal
          isOpen={!!quickImageWorkshop}
          onClose={() => setQuickImageWorkshop(null)}
          onSelect={(url) => handleUpdateWorkshopImage(quickImageWorkshop._id, url)}
          defaultSlot="card-banner"
        />
      )}
    </div>
  );
}
