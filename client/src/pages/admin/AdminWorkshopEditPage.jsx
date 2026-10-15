import { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import {
  Save,
  ArrowLeft,
  Eye,
  EyeOff,
  ChevronUp,
  ChevronDown,
  Trash2,
  Plus,
  ExternalLink,
  Layers,
  Palette,
  Sparkles,
  Search,
  Check,
  Loader2,
  Settings,
  Sliders,
  Copy,
  BookOpen,
  Video,
  HelpCircle,
  FileText,
  CheckCircle2,
  User,
} from 'lucide-react';
import api from '../../lib/api';

// Public section components for live preview
import HeroSection from '../../components/sections/HeroSection';
import BenefitsSection from '../../components/sections/BenefitsSection';
import LogosSection from '../../components/sections/LogosSection';
import CommunitySection from '../../components/sections/CommunitySection';
import TestimonialsSection from '../../components/sections/TestimonialsSection';
import StagesSection from '../../components/sections/StagesSection';
import AudienceSection from '../../components/sections/AudienceSection';
import TrainerSection from '../../components/sections/TrainerSection';
import WorkshopFooter from '../../components/sections/WorkshopFooter';
import WorkshopCard from '../../components/workshop/WorkshopCard';
import ImageField from '../../components/admin/ImageField';

export default function AdminWorkshopEditPage() {
  const { id } = useParams();
  const [workshop, setWorkshop] = useState(null);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [searchParams] = useSearchParams();

  // Tabs (support direct URL jump e.g. ?tab=curriculum)
  const initialTab = searchParams.get('tab') || 'sections';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [selectedSectionIndex, setSelectedSectionIndex] = useState(0);
  const [previewMode, setPreviewMode] = useState('split'); // 'split' | 'editor' | 'preview'

  useEffect(() => {
    fetchWorkshopData();
  }, [id]);

  const fetchWorkshopData = async () => {
    setLoading(true);
    try {
      // First get all workshops to find the slug, or fetch directly
      const wRes = await api.get('/workshops/admin/all');
      const found = wRes.data.workshops?.find((w) => w._id === id);
      if (!found) throw new Error('Workshop not found');

      // Fetch sections for this workshop
      const sRes = await api.get(`/sections/${id}`);
      setWorkshop(found);
      setSections(sRes.data.sections || []);
    } catch (err) {
      console.error('Failed to load workshop editor', err);
    } finally {
      setLoading(false);
    }
  };

  // Save all changes
  const handleSave = async () => {
    setSaving(true);
    setSaveSuccess(false);
    try {
      // Save workshop details
      await api.put(`/workshops/${id}`, workshop);

      // Save all sections
      await Promise.all(
        sections.map((section, idx) =>
          api.put(`/sections/${section._id}`, {
            ...section,
            order: idx,
          })
        )
      );

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  // Section reordering
  const handleMoveSection = (index, dir) => {
    const target = index + dir;
    if (target < 0 || target >= sections.length) return;
    const newSecs = [...sections];
    const temp = newSecs[index];
    newSecs[index] = newSecs[target];
    newSecs[target] = temp;
    setSections(newSecs);
    setSelectedSectionIndex(target);
  };

  // Toggle visibility
  const handleToggleVisible = (index) => {
    const newSecs = [...sections];
    newSecs[index] = { ...newSecs[index], visible: !newSecs[index].visible };
    setSections(newSecs);
  };

  // Update section content
  const handleUpdateContent = (field, value) => {
    const newSecs = [...sections];
    const sec = { ...newSecs[selectedSectionIndex] };
    sec.content = { ...sec.content, [field]: value };
    newSecs[selectedSectionIndex] = sec;
    setSections(newSecs);
  };

  // Update section animation
  const handleUpdateAnimation = (field, value) => {
    const newSecs = [...sections];
    const sec = { ...newSecs[selectedSectionIndex] };
    sec.animation = { ...sec.animation, [field]: value };
    newSecs[selectedSectionIndex] = sec;
    setSections(newSecs);
  };

  if (loading) {
    return (
      <div className="p-12 flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-gold animate-spin mb-3" />
        <p className="text-xs text-muted">Loading workshop editor & sections...</p>
      </div>
    );
  }

  if (!workshop) {
    return <div className="p-8 text-center text-sm text-muted">Workshop not found</div>;
  }

  const currentSection = sections[selectedSectionIndex];

  return (
    <div className="flex-1 flex flex-col h-full min-h-0 bg-[#F8F9FA] overflow-hidden">
      {/* Top Header Bar */}
      <div className="bg-white border-b border-border px-6 py-3 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-4">
          <Link
            to="/admin/workshops"
            className="p-1.5 rounded-lg text-muted hover:text-navy hover:bg-cream"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-sm font-bold text-navy truncate max-w-sm md:max-w-md">
              {workshop.title}
            </h1>
            <p className="text-[11px] text-muted font-mono">
              /w/{workshop.slug} · <span className="capitalize">{workshop.status}</span>
            </p>
          </div>
        </div>

        {/* View toggle & Save button */}
        <div className="flex items-center gap-3">
          {/* Preview layout mode buttons */}
          <div className="hidden lg:flex items-center bg-cream rounded-xl p-1 border border-border text-xs">
            <button
              onClick={() => setPreviewMode('editor')}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                previewMode === 'editor' ? 'bg-white text-navy shadow-sm' : 'text-muted'
              }`}
            >
              Editor Only
            </button>
            <button
              onClick={() => setPreviewMode('split')}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                previewMode === 'split' ? 'bg-white text-navy shadow-sm' : 'text-muted'
              }`}
            >
              Split View
            </button>
            <button
              onClick={() => setPreviewMode('preview')}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                previewMode === 'preview' ? 'bg-white text-navy shadow-sm' : 'text-muted'
              }`}
            >
              Live Preview
            </button>
          </div>

          <Link
            to={`/w/${workshop.slug}`}
            target="_blank"
            className="p-2 rounded-lg border border-border text-muted hover:text-navy hover:bg-cream"
            title="Open Public Page"
          >
            <ExternalLink className="w-4 h-4" />
          </Link>

          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5"
          >
            {saving ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : saveSuccess ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            {saving ? 'Saving...' : saveSuccess ? 'Saved!' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Editor Main Content Area */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* LEFT PANE: Editor Controls */}
        <div
          className={`h-full flex flex-col bg-white border-r border-border overflow-y-auto min-h-0 shrink-0 ${
            previewMode === 'preview' ? 'hidden' : previewMode === 'editor' ? 'w-full' : 'w-full lg:w-[480px] xl:w-[540px]'
          }`}
        >
          {/* Sub-tabs: Sections / Details / Theme / Hub Card */}
          <div className="sticky top-0 z-10 flex border-b border-border bg-cream px-4 pt-2 gap-2 text-xs font-semibold shrink-0 overflow-x-auto whitespace-nowrap shadow-xs">
            <button
              onClick={() => setActiveTab('sections')}
              className={`pb-2 px-3 border-b-2 transition-all flex items-center gap-1.5 shrink-0 ${
                activeTab === 'sections'
                  ? 'border-navy text-navy font-bold'
                  : 'border-transparent text-muted hover:text-navy'
              }`}
            >
              <Layers className="w-3.5 h-3.5" /> Sections ({sections.length})
            </button>
            <button
              onClick={() => setActiveTab('curriculum')}
              className={`pb-2 px-3 border-b-2 transition-all flex items-center gap-1.5 shrink-0 ${
                activeTab === 'curriculum'
                  ? 'border-navy text-navy font-bold'
                  : 'border-transparent text-muted hover:text-navy'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" /> Curriculum & Extended
            </button>
            <button
              onClick={() => setActiveTab('details')}
              className={`pb-2 px-3 border-b-2 transition-all flex items-center gap-1.5 shrink-0 ${
                activeTab === 'details'
                  ? 'border-navy text-navy font-bold'
                  : 'border-transparent text-muted hover:text-navy'
              }`}
            >
              <Settings className="w-3.5 h-3.5" /> General & SEO
            </button>
            <button
              onClick={() => setActiveTab('theme')}
              className={`pb-2 px-3 border-b-2 transition-all flex items-center gap-1.5 shrink-0 ${
                activeTab === 'theme'
                  ? 'border-navy text-navy font-bold'
                  : 'border-transparent text-muted hover:text-navy'
              }`}
            >
              <Palette className="w-3.5 h-3.5" /> Theme & Animation
            </button>
            <button
              onClick={() => setActiveTab('cardPreview')}
              className={`pb-2 px-3 border-b-2 transition-all flex items-center gap-1.5 shrink-0 ${
                activeTab === 'cardPreview'
                  ? 'border-navy text-navy font-bold'
                  : 'border-transparent text-muted hover:text-navy'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-gold" /> Hub Card
            </button>
          </div>

          {/* TAB 1: SECTIONS */}
          {activeTab === 'sections' && (
            <div className="p-4 space-y-4 pb-28">
              {/* Section Selector Pills */}
              <div>
                <p className="text-[11px] font-bold text-muted uppercase tracking-wider mb-2">
                  Sections Layout (Order & Visibility)
                </p>
                <div className="space-y-1.5">
                  {sections.map((sec, idx) => (
                    <div
                      key={sec._id || idx}
                      onClick={() => setSelectedSectionIndex(idx)}
                      className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer text-xs transition-all ${
                        selectedSectionIndex === idx
                          ? 'border-gold bg-gold/5 font-bold text-navy shadow-xs'
                          : 'border-border bg-white text-muted hover:bg-cream'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-5 text-center font-mono text-[11px] text-muted">
                          {idx + 1}
                        </span>
                        <span className="capitalize font-semibold text-navy">
                          {sec.type} Section
                        </span>
                        {!sec.visible && (
                          <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.2 rounded font-normal">
                            Hidden
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleToggleVisible(idx)}
                          title={sec.visible ? 'Hide section' : 'Show section'}
                          className="p-1 rounded text-muted hover:text-navy"
                        >
                          {sec.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5 text-red-500" />}
                        </button>
                        <button
                          onClick={() => handleMoveSection(idx, -1)}
                          disabled={idx === 0}
                          title="Move up"
                          className="p-1 rounded text-muted hover:text-navy disabled:opacity-20"
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleMoveSection(idx, 1)}
                          disabled={idx === sections.length - 1}
                          title="Move down"
                          className="p-1 rounded text-muted hover:text-navy disabled:opacity-20"
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Selected Section Content Editor */}
              {currentSection && (
                <div className="border-t border-border pt-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-navy">
                      Editing: <span className="text-gold capitalize">{currentSection.type}</span>
                    </h3>
                  </div>

                  {/* Animation Settings for this Section */}
                  <div className="bg-cream rounded-xl p-3 border border-border space-y-2">
                    <p className="text-[11px] font-bold text-navy flex items-center gap-1">
                      <Sliders className="w-3 h-3 text-gold" /> Section Animation Controls
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <label className="text-[10px] text-muted block mb-1">Entrance</label>
                        <select
                          value={currentSection.animation?.entrance || 'fade-up'}
                          onChange={(e) => handleUpdateAnimation('entrance', e.target.value)}
                          className="w-full px-2 py-1.5 rounded-lg border border-border bg-white text-xs"
                        >
                          <option value="none">None</option>
                          <option value="fade-up">Fade Up</option>
                          <option value="fade-in">Fade In</option>
                          <option value="slide-left">Slide Left</option>
                          <option value="slide-right">Slide Right</option>
                          <option value="zoom-in">Zoom In</option>
                          <option value="text-reveal">Text Reveal</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] text-muted block mb-1">Speed</label>
                        <select
                          value={currentSection.animation?.speed || 'normal'}
                          onChange={(e) => handleUpdateAnimation('speed', e.target.value)}
                          className="w-full px-2 py-1.5 rounded-lg border border-border bg-white text-xs"
                        >
                          <option value="slow">Slow</option>
                          <option value="normal">Normal</option>
                          <option value="fast">Fast</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* DYNAMIC FIELDS PER SECTION TYPE */}
                  <div className="space-y-3">
                    {/* Common fields: title / heading */}
                    {(currentSection.content?.title !== undefined || currentSection.type === 'hero') && (
                      <div>
                        <label className="block text-xs font-semibold text-navy mb-1">
                          {currentSection.type === 'hero' ? 'Hero Title' : 'Title'}
                        </label>
                        <input
                          type="text"
                          value={currentSection.content?.title || ''}
                          onChange={(e) => handleUpdateContent('title', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-border bg-white text-navy text-xs focus:border-gold"
                        />
                      </div>
                    )}

                    {currentSection.content?.badge !== undefined && (
                      <div>
                        <label className="block text-xs font-semibold text-navy mb-1">Badge Text</label>
                        <input
                          type="text"
                          value={currentSection.content?.badge || ''}
                          onChange={(e) => handleUpdateContent('badge', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-border bg-white text-navy text-xs focus:border-gold"
                        />
                      </div>
                    )}

                    {currentSection.content?.heading !== undefined && (
                      <div>
                        <label className="block text-xs font-semibold text-navy mb-1">Heading</label>
                        <input
                          type="text"
                          value={currentSection.content?.heading || ''}
                          onChange={(e) => handleUpdateContent('heading', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-border bg-white text-navy text-xs focus:border-gold"
                        />
                      </div>
                    )}

                    {currentSection.content?.subtitle !== undefined && (
                      <div>
                        <label className="block text-xs font-semibold text-navy mb-1">Subtitle</label>
                        <textarea
                          rows={2}
                          value={currentSection.content?.subtitle || ''}
                          onChange={(e) => handleUpdateContent('subtitle', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-border bg-white text-navy text-xs focus:border-gold resize-none"
                        />
                      </div>
                    )}

                    {currentSection.content?.description !== undefined && (
                      <div>
                        <label className="block text-xs font-semibold text-navy mb-1">Description</label>
                        <textarea
                          rows={2}
                          value={currentSection.content?.description || ''}
                          onChange={(e) => handleUpdateContent('description', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-border bg-white text-navy text-xs focus:border-gold resize-none"
                        />
                      </div>
                    )}

                    {currentSection.content?.ctaLabel !== undefined && (
                      <div>
                        <label className="block text-xs font-semibold text-navy mb-1">Button CTA Label</label>
                        <input
                          type="text"
                          value={currentSection.content?.ctaLabel || ''}
                          onChange={(e) => handleUpdateContent('ctaLabel', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-border bg-white text-navy text-xs focus:border-gold"
                        />
                      </div>
                    )}

                    {(currentSection.content?.bannerImage !== undefined || currentSection.type === 'hero') && (
                      <ImageField
                        label="Hero Banner / Graphic Image"
                        value={currentSection.content?.bannerImage || ''}
                        onChange={(url) => handleUpdateContent('bannerImage', url)}
                        slotHint="hero-banner"
                        helperText="Hero illustration, platform preview, or product screenshot (16:9 recommended)"
                      />
                    )}

                    {(currentSection.content?.image !== undefined || currentSection.type === 'logos' || currentSection.type === 'community') && (
                      <ImageField
                        label={currentSection.type === 'community' ? 'Community Photo' : currentSection.type === 'logos' ? 'Logos Wall Image' : 'Section Image'}
                        value={currentSection.content?.image || ''}
                        onChange={(url) => handleUpdateContent('image', url)}
                        slotHint={currentSection.type === 'community' ? 'community-image' : 'logos-graphic'}
                        helperText={currentSection.type === 'community' ? 'Community photo (16:9 recommended)' : 'Featured visual graphic'}
                      />
                    )}

                    {/* TRAINER SECTION SPECIFIC */}
                    {currentSection.type === 'trainer' && (
                      <div className="space-y-4 pt-2">
                        <div>
                          <label className="block text-xs font-semibold text-navy mb-1">Section Label</label>
                          <input
                            type="text"
                            value={currentSection.content?.label || 'YOUR TRAINER'}
                            onChange={(e) => handleUpdateContent('label', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-border bg-white text-navy text-xs focus:border-gold"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-navy mb-1">Trainer Name</label>
                          <input
                            type="text"
                            value={currentSection.content?.name || 'Ayub.'}
                            onChange={(e) => handleUpdateContent('name', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-border bg-white text-navy text-xs focus:border-gold"
                          />
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-semibold text-navy uppercase tracking-wider">Trainer Portrait</span>
                            <button
                              type="button"
                              onClick={() => handleUpdateContent('portrait', '/ayub-founder-full.jpg')}
                              className="text-[10px] text-gold font-bold hover:underline"
                            >
                              Reset to Ayub Master Photo
                            </button>
                          </div>
                          <ImageField
                            label=""
                            value={currentSection.content?.portrait || '/ayub-founder-full.jpg'}
                            onChange={(url) => handleUpdateContent('portrait', url)}
                            slotHint="trainer-portrait"
                            helperText="High resolution portrait (recommended 3:4 aspect ratio)"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-navy mb-1">Quote / Card Caption</label>
                          <textarea
                            rows={2}
                            value={currentSection.content?.portraitCaption || "The future isn't firm versus firm. It's firm versus agent stack."}
                            onChange={(e) => handleUpdateContent('portraitCaption', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-border bg-white text-navy text-xs focus:border-gold resize-none"
                          />
                        </div>

                        {/* Bio Paragraphs */}
                        <div className="pt-2 border-t border-border">
                          <div className="flex items-center justify-between mb-2">
                            <label className="block text-xs font-semibold text-navy">
                              Bio Paragraphs ({(currentSection.content?.bio || []).length})
                            </label>
                            <button
                              type="button"
                              onClick={() => {
                                const currentBio = Array.isArray(currentSection.content?.bio) && currentSection.content.bio.length > 0
                                  ? currentSection.content.bio
                                  : [
                                      'Fifteen years in finance, now building multi model agentic systems for private equity and venture capital firms focused on due diligence.',
                                      'Trained in audit and advisory at KPMG and BDO Binder International, then founded and sold a technology company. That mix is the point. Most AI training for investment teams is run by people who have never signed off on a set of numbers, and most valuation training is run by people who have never built an agent. This session sits in the middle.',
                                      'Runs a due diligence lab for PE and VC firms, where every engine is stress tested against real deal documents before it reaches a client.',
                                    ];
                                handleUpdateContent('bio', [...currentBio, 'New bio paragraph...']);
                              }}
                              className="text-gold text-xs font-bold hover:underline flex items-center gap-1"
                            >
                              <Plus className="w-3 h-3" /> Add Paragraph
                            </button>
                          </div>
                          <div className="space-y-2">
                            {(Array.isArray(currentSection.content?.bio) && currentSection.content.bio.length > 0
                              ? currentSection.content.bio
                              : [
                                  'Fifteen years in finance, now building multi model agentic systems for private equity and venture capital firms focused on due diligence.',
                                  'Trained in audit and advisory at KPMG and BDO Binder International, then founded and sold a technology company. That mix is the point. Most AI training for investment teams is run by people who have never signed off on a set of numbers, and most valuation training is run by people who have never built an agent. This session sits in the middle.',
                                  'Runs a due diligence lab for PE and VC firms, where every engine is stress tested against real deal documents before it reaches a client.',
                                ]
                            ).map((para, pIdx, arr) => (
                              <div key={pIdx} className="flex gap-2 items-start">
                                <textarea
                                  rows={2}
                                  value={para}
                                  onChange={(e) => {
                                    const newBio = [...arr];
                                    newBio[pIdx] = e.target.value;
                                    handleUpdateContent('bio', newBio);
                                  }}
                                  className="flex-1 px-2.5 py-1.5 rounded-lg border border-border bg-white text-navy text-xs resize-none focus:border-gold"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newBio = arr.filter((_, idx) => idx !== pIdx);
                                    handleUpdateContent('bio', newBio);
                                  }}
                                  className="text-red-500 hover:text-red-700 p-1.5 rounded"
                                  title="Delete paragraph"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Key Credentials Table */}
                        <div className="pt-2 border-t border-border">
                          <div className="flex items-center justify-between mb-2">
                            <label className="block text-xs font-semibold text-navy">
                              Credentials / Highlights Table ({(currentSection.content?.keyValues || []).length})
                            </label>
                            <button
                              type="button"
                              onClick={() => {
                                const currentKVs = Array.isArray(currentSection.content?.keyValues) && currentSection.content.keyValues.length > 0
                                  ? currentSection.content.keyValues
                                  : [
                                      { label: 'AUDIT', value: 'Ex KPMG, ex BDO Binder International' },
                                      { label: 'FOUNDER', value: 'Built and exited a technology company' },
                                      { label: 'NOW', value: 'Due diligence lab for PE and VC firms' },
                                      { label: 'FOCUS', value: 'Multi model agentic orchestration for deal teams' },
                                    ];
                                handleUpdateContent('keyValues', [...currentKVs, { label: 'HIGHLIGHT', value: 'Achievement or role description' }]);
                              }}
                              className="text-gold text-xs font-bold hover:underline flex items-center gap-1"
                            >
                              <Plus className="w-3 h-3" /> Add Credential
                            </button>
                          </div>
                          <div className="space-y-2">
                            {(Array.isArray(currentSection.content?.keyValues) && currentSection.content.keyValues.length > 0
                              ? currentSection.content.keyValues
                              : [
                                  { label: 'AUDIT', value: 'Ex KPMG, ex BDO Binder International' },
                                  { label: 'FOUNDER', value: 'Built and exited a technology company' },
                                  { label: 'NOW', value: 'Due diligence lab for PE and VC firms' },
                                  { label: 'FOCUS', value: 'Multi model agentic orchestration for deal teams' },
                                ]
                            ).map((kv, kIdx, arr) => (
                              <div key={kIdx} className="flex gap-2 items-center bg-cream p-2 rounded-lg border border-border">
                                <input
                                  type="text"
                                  value={kv.label}
                                  placeholder="LABEL"
                                  onChange={(e) => {
                                    const newKVs = [...arr];
                                    newKVs[kIdx] = { ...newKVs[kIdx], label: e.target.value.toUpperCase() };
                                    handleUpdateContent('keyValues', newKVs);
                                  }}
                                  className="w-24 px-2 py-1 rounded border border-border bg-white text-navy font-bold text-xs uppercase"
                                />
                                <input
                                  type="text"
                                  value={kv.value}
                                  placeholder="Credential value"
                                  onChange={(e) => {
                                    const newKVs = [...arr];
                                    newKVs[kIdx] = { ...newKVs[kIdx], value: e.target.value };
                                    handleUpdateContent('keyValues', newKVs);
                                  }}
                                  className="flex-1 px-2 py-1 rounded border border-border bg-white text-navy text-xs"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newKVs = arr.filter((_, idx) => idx !== kIdx);
                                    handleUpdateContent('keyValues', newKVs);
                                  }}
                                  className="text-red-500 hover:text-red-700 p-1 rounded"
                                  title="Delete credential"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* REPEATABLE ITEMS (Stages / Benefits / Testimonials / Chips) */}
                    {Array.isArray(currentSection.content?.items) && (
                      <div className="pt-2">
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-xs font-semibold text-navy">
                            List Items ({currentSection.content.items.length})
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              const newItems = [
                                ...(currentSection.content.items || []),
                                {
                                  title: 'New Item',
                                  description: 'Description of item',
                                  duration: '30 mins',
                                  tag: 'Saved 2 hrs',
                                },
                              ];
                              handleUpdateContent('items', newItems);
                            }}
                            className="text-gold text-xs font-bold hover:underline flex items-center gap-1"
                          >
                            <Plus className="w-3 h-3" /> Add Item
                          </button>
                        </div>

                        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                          {currentSection.content.items.map((item, itemIdx) => (
                            <div
                              key={itemIdx}
                              className="p-2.5 rounded-xl border border-border bg-cream space-y-2 text-xs"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-navy">#{itemIdx + 1} {item.title || item.name}</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newItems = currentSection.content.items.filter((_, i) => i !== itemIdx);
                                    handleUpdateContent('items', newItems);
                                  }}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              <input
                                type="text"
                                value={item.title || item.name || ''}
                                placeholder="Title / Name"
                                onChange={(e) => {
                                  const newItems = [...currentSection.content.items];
                                  newItems[itemIdx] = { ...newItems[itemIdx], title: e.target.value, name: e.target.value };
                                  handleUpdateContent('items', newItems);
                                }}
                                className="w-full px-2 py-1 rounded border border-border bg-white text-xs"
                              />

                              <textarea
                                rows={2}
                                value={item.description || item.quote || ''}
                                placeholder="Description / Quote"
                                onChange={(e) => {
                                  const newItems = [...currentSection.content.items];
                                  newItems[itemIdx] = { ...newItems[itemIdx], description: e.target.value, quote: e.target.value };
                                  handleUpdateContent('items', newItems);
                                }}
                                className="w-full px-2 py-1 rounded border border-border bg-white text-xs resize-none"
                              />

                              {currentSection.type === 'testimonials' && (
                                <div className="space-y-2 pt-1 border-t border-border">
                                  <div className="grid grid-cols-2 gap-2">
                                    <input
                                      type="text"
                                      value={item.role || ''}
                                      placeholder="Role (e.g. Partner, Principal)"
                                      onChange={(e) => {
                                        const newItems = [...currentSection.content.items];
                                        newItems[itemIdx] = { ...newItems[itemIdx], role: e.target.value };
                                        handleUpdateContent('items', newItems);
                                      }}
                                      className="w-full px-2 py-1 rounded border border-border bg-white text-xs"
                                    />
                                    <input
                                      type="text"
                                      value={item.company || ''}
                                      placeholder="Company (e.g. Blackstone)"
                                      onChange={(e) => {
                                        const newItems = [...currentSection.content.items];
                                        newItems[itemIdx] = { ...newItems[itemIdx], company: e.target.value };
                                        handleUpdateContent('items', newItems);
                                      }}
                                      className="w-full px-2 py-1 rounded border border-border bg-white text-xs"
                                    />
                                  </div>
                                  <ImageField
                                    label="Attendee Avatar"
                                    value={item.avatar || ''}
                                    onChange={(url) => {
                                      const newItems = [...currentSection.content.items];
                                      newItems[itemIdx] = { ...newItems[itemIdx], avatar: url };
                                      handleUpdateContent('items', newItems);
                                    }}
                                    slotHint="general"
                                    helperText="Square headshot (1:1)"
                                  />
                                </div>
                              )}

                              {item.duration !== undefined && (
                                <div className="grid grid-cols-2 gap-2">
                                  <input
                                    type="text"
                                    value={item.duration || ''}
                                    placeholder="Duration (e.g. 15 min)"
                                    onChange={(e) => {
                                      const newItems = [...currentSection.content.items];
                                      newItems[itemIdx] = { ...newItems[itemIdx], duration: e.target.value };
                                      handleUpdateContent('items', newItems);
                                    }}
                                    className="w-full px-2 py-1 rounded border border-border bg-white text-xs"
                                  />
                                  <input
                                    type="text"
                                    value={item.tag || ''}
                                    placeholder="Gold Tag (e.g. 4 hrs saved)"
                                    onChange={(e) => {
                                      const newItems = [...currentSection.content.items];
                                      newItems[itemIdx] = { ...newItems[itemIdx], tag: e.target.value };
                                      handleUpdateContent('items', newItems);
                                    }}
                                    className="w-full px-2 py-1 rounded border border-border bg-white text-xs"
                                  />
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: GENERAL & SEO */}
          {activeTab === 'details' && (
            <div className="p-4 space-y-4 pb-28">
              <div>
                <label className="block text-xs font-semibold text-navy uppercase mb-1">Title</label>
                <input
                  type="text"
                  value={workshop.title || ''}
                  onChange={(e) => setWorkshop({ ...workshop, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-white text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy uppercase mb-1">Slug</label>
                <input
                  type="text"
                  value={workshop.slug || ''}
                  onChange={(e) => setWorkshop({ ...workshop, slug: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-white text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy uppercase mb-1">Category</label>
                <input
                  type="text"
                  value={workshop.category || ''}
                  onChange={(e) => setWorkshop({ ...workshop, category: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-white text-xs"
                />
              </div>

              <ImageField
                label="Workshop Cover / Banner Image"
                value={workshop.bannerImage || ''}
                onChange={(url) => setWorkshop({ ...workshop, bannerImage: url })}
                slotHint="card-banner"
                helperText="Primary cover image for Hub cards and event header"
              />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-navy uppercase mb-1">Start Date</label>
                  <input
                    type="date"
                    value={workshop.startDate ? workshop.startDate.substring(0, 10) : ''}
                    onChange={(e) => setWorkshop({ ...workshop, startDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-navy uppercase mb-1">End Date</label>
                  <input
                    type="date"
                    value={workshop.endDate ? workshop.endDate.substring(0, 10) : ''}
                    onChange={(e) => setWorkshop({ ...workshop, endDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-white text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-navy uppercase mb-1">Seats Total</label>
                  <input
                    type="number"
                    value={workshop.seatsTotal || 100}
                    onChange={(e) => setWorkshop({ ...workshop, seatsTotal: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-navy uppercase mb-1">Seats Booked</label>
                  <input
                    type="number"
                    value={workshop.seatsBooked || 0}
                    onChange={(e) => setWorkshop({ ...workshop, seatsBooked: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-white text-xs"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-border space-y-2">
                <p className="text-xs font-bold text-navy uppercase">SEO Meta Tags</p>
                <div>
                  <label className="text-[11px] text-muted block mb-1">SEO Title</label>
                  <input
                    type="text"
                    value={workshop.seo?.title || ''}
                    placeholder={`${workshop.title} | Workshop Hub`}
                    onChange={(e) => setWorkshop({ ...workshop, seo: { ...workshop.seo, title: e.target.value } })}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-white text-xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-muted block mb-1">SEO Meta Description</label>
                  <textarea
                    rows={2}
                    value={workshop.seo?.description || ''}
                    onChange={(e) => setWorkshop({ ...workshop, seo: { ...workshop.seo, description: e.target.value } })}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-white text-xs resize-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB: CURRICULUM & EXTENDED SCHEMA */}
          {activeTab === 'curriculum' && (
            <div className="p-4 space-y-6 pb-28">
              {/* Header Info */}
              <div className="p-3 bg-cream rounded-xl border border-border">
                <div className="flex items-center gap-2 mb-1">
                  <BookOpen className="w-4 h-4 text-gold" />
                  <p className="text-xs font-bold text-navy">Curriculum, Speakers, Agenda & Deliverables</p>
                </div>
                <p className="text-[11px] text-muted leading-relaxed">
                  These extended fields power the public Event Detail page tabs, agenda schedule, instructor cards, FAQs, and executive prerequisites.
                </p>
              </div>

              {/* Price & Recording Link */}
              <div className="p-4 bg-white rounded-xl border border-border space-y-3">
                <p className="text-xs font-bold text-navy uppercase tracking-wider">Tuition & Recording</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-navy mb-1">Tuition Price (USD)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-xs font-mono">$</span>
                      <input
                        type="number"
                        min={0}
                        value={workshop.price ?? 0}
                        onChange={(e) => setWorkshop({ ...workshop, price: Number(e.target.value) })}
                        className="w-full pl-7 pr-3 py-2 rounded-lg border border-border bg-white text-xs font-mono focus:border-gold"
                        placeholder="0"
                      />
                    </div>
                    <p className="text-[10px] text-muted mt-1">Set to 0 for Free / Executive Access</p>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-navy mb-1">Session Replay or Trailer URL</label>
                    <div className="relative">
                      <Video className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                      <input
                        type="url"
                        value={workshop.videoUrl || workshop.recordingUrl || ''}
                        onChange={(e) => setWorkshop({ ...workshop, videoUrl: e.target.value, recordingUrl: e.target.value })}
                        className="w-full pl-8 pr-3 py-2 rounded-lg border border-border bg-white text-xs focus:border-gold"
                        placeholder="https://vimeo.com/... or MP4 link"
                      />
                    </div>
                    <p className="text-[10px] text-muted mt-1">Powers the fullscreen video player on event detail page & past events</p>
                  </div>
                </div>
              </div>

              {/* Executive Prerequisites & Attendee Profile */}
              <div className="p-4 bg-white rounded-xl border border-border space-y-3">
                <p className="text-xs font-bold text-navy uppercase tracking-wider">
                  Executive Lab Prerequisites & Audience Profile
                </p>
                <p className="text-[11px] text-muted">
                  Displayed on the Event Page under Curriculum & Prerequisites.
                </p>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-navy mb-1">Who It's For</label>
                    <textarea
                      rows={2}
                      value={workshop.prerequisites?.whoItsFor ?? 'Private Equity partners, Principals, VC deal sponsors, and senior investment analysts.'}
                      placeholder="Private Equity partners, Principals, VC deal sponsors, and senior investment analysts."
                      onChange={(e) =>
                        setWorkshop({
                          ...workshop,
                          prerequisites: {
                            ...(workshop.prerequisites || {}),
                            whoItsFor: e.target.value,
                          },
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg border border-border bg-white text-navy text-xs focus:border-gold resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-navy mb-1">Technical Level Required</label>
                    <textarea
                      rows={2}
                      value={workshop.prerequisites?.technicalLevel ?? 'No engineering or deep programming background required; focuses on agent stacks & prompt orchestration.'}
                      placeholder="No engineering or deep programming background required; focuses on agent stacks & prompt orchestration."
                      onChange={(e) =>
                        setWorkshop({
                          ...workshop,
                          prerequisites: {
                            ...(workshop.prerequisites || {}),
                            technicalLevel: e.target.value,
                          },
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg border border-border bg-white text-navy text-xs focus:border-gold resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-navy mb-1">Take-Home Deliverables</label>
                    <textarea
                      rows={2}
                      value={workshop.prerequisites?.deliverables ?? 'Production agent architectures, prompt harness blueprints, and permanent session video archives.'}
                      placeholder="Production agent architectures, prompt harness blueprints, and permanent session video archives."
                      onChange={(e) =>
                        setWorkshop({
                          ...workshop,
                          prerequisites: {
                            ...(workshop.prerequisites || {}),
                            deliverables: e.target.value,
                          },
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg border border-border bg-white text-navy text-xs focus:border-gold resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Learning Outcomes */}
              <div className="p-4 bg-white rounded-xl border border-border space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-navy uppercase tracking-wider">
                      Learning Outcomes ({((workshop.learningOutcomes || []).length)})
                    </p>
                    <p className="text-[11px] text-muted">Core competencies attendees master</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const list = [...(workshop.learningOutcomes || [])];
                      setWorkshop({ ...workshop, learningOutcomes: [...list, ''] });
                    }}
                    className="text-xs text-gold font-bold hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Add Outcome
                  </button>
                </div>

                <div className="space-y-2">
                  {(workshop.learningOutcomes || []).map((outcome, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="w-5 text-[11px] font-mono text-muted text-right">#{idx + 1}</span>
                      <input
                        type="text"
                        value={outcome}
                        onChange={(e) => {
                          const list = [...(workshop.learningOutcomes || [])];
                          list[idx] = e.target.value;
                          setWorkshop({ ...workshop, learningOutcomes: list });
                        }}
                        placeholder="e.g. Architect multi-agent deal sourcing workflows"
                        className="flex-1 px-3 py-1.5 rounded-lg border border-border bg-white text-navy text-xs focus:border-gold"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const list = (workshop.learningOutcomes || []).filter((_, i) => i !== idx);
                          setWorkshop({ ...workshop, learningOutcomes: list });
                        }}
                        className="text-red-500 hover:text-red-700 p-1"
                        title="Remove"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  {(!workshop.learningOutcomes || workshop.learningOutcomes.length === 0) && (
                    <p className="text-xs text-muted italic py-1">No learning outcomes added yet.</p>
                  )}
                </div>
              </div>

              {/* Requirements & Prerequisites */}
              <div className="p-4 bg-white rounded-xl border border-border space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-navy uppercase tracking-wider">
                      Prerequisites & Requirements ({((workshop.requirements || []).length)})
                    </p>
                    <p className="text-[11px] text-muted">Technical or domain preparation needed</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const list = [...(workshop.requirements || [])];
                      setWorkshop({ ...workshop, requirements: [...list, ''] });
                    }}
                    className="text-xs text-gold font-bold hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Add Requirement
                  </button>
                </div>

                <div className="space-y-2">
                  {(workshop.requirements || []).map((req, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="w-5 text-[11px] font-mono text-muted text-right">#{idx + 1}</span>
                      <input
                        type="text"
                        value={req}
                        onChange={(e) => {
                          const list = [...(workshop.requirements || [])];
                          list[idx] = e.target.value;
                          setWorkshop({ ...workshop, requirements: list });
                        }}
                        placeholder="e.g. Familiarity with private equity deal documentation or LBO models"
                        className="flex-1 px-3 py-1.5 rounded-lg border border-border bg-white text-navy text-xs focus:border-gold"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const list = (workshop.requirements || []).filter((_, i) => i !== idx);
                          setWorkshop({ ...workshop, requirements: list });
                        }}
                        className="text-red-500 hover:text-red-700 p-1"
                        title="Remove"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  {(!workshop.requirements || workshop.requirements.length === 0) && (
                    <p className="text-xs text-muted italic py-1">No requirements specified yet.</p>
                  )}
                </div>
              </div>

              {/* Agenda / Session Schedule */}
              <div className="p-4 bg-white rounded-xl border border-border space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-navy uppercase tracking-wider">
                      Curriculum Agenda ({((workshop.agenda || []).length)})
                    </p>
                    <p className="text-[11px] text-muted">Modules and timetable breakdown</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const list = [...(workshop.agenda || [])];
                      setWorkshop({
                        ...workshop,
                        agenda: [
                          ...list,
                          {
                            time: '09:00 - 10:00',
                            title: 'New Agenda Session',
                            description: 'Module breakdown and exercises',
                          },
                        ],
                      });
                    }}
                    className="text-xs text-gold font-bold hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Add Module
                  </button>
                </div>

                <div className="space-y-3">
                  {(workshop.agenda || []).map((item, idx) => (
                    <div key={idx} className="p-3 bg-cream rounded-xl border border-border space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-navy">Module #{idx + 1}</span>
                        <button
                          type="button"
                          onClick={() => {
                            const list = (workshop.agenda || []).filter((_, i) => i !== idx);
                            setWorkshop({ ...workshop, agenda: list });
                          }}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <input
                          type="text"
                          value={item.time || ''}
                          placeholder="Time / Slot (e.g. 09:00 - 10:15)"
                          onChange={(e) => {
                            const list = [...(workshop.agenda || [])];
                            list[idx] = { ...list[idx], time: e.target.value };
                            setWorkshop({ ...workshop, agenda: list });
                          }}
                          className="px-2.5 py-1.5 rounded-lg border border-border bg-white text-navy font-mono text-xs focus:border-gold"
                        />
                        <input
                          type="text"
                          value={item.title || ''}
                          placeholder="Session Title"
                          onChange={(e) => {
                            const list = [...(workshop.agenda || [])];
                            list[idx] = { ...list[idx], title: e.target.value };
                            setWorkshop({ ...workshop, agenda: list });
                          }}
                          className="sm:col-span-2 px-2.5 py-1.5 rounded-lg border border-border bg-white text-navy font-semibold text-xs focus:border-gold"
                        />
                      </div>
                      <textarea
                        rows={2}
                        value={item.description || ''}
                        placeholder="Session description, key topics covered, or live demo details..."
                        onChange={(e) => {
                          const list = [...(workshop.agenda || [])];
                          list[idx] = { ...list[idx], description: e.target.value };
                          setWorkshop({ ...workshop, agenda: list });
                        }}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-white text-navy text-xs resize-none focus:border-gold"
                      />
                    </div>
                  ))}
                  {(!workshop.agenda || workshop.agenda.length === 0) && (
                    <p className="text-xs text-muted italic py-1">No agenda items added yet.</p>
                  )}
                </div>
              </div>

              {/* Speakers / Instructors */}
              <div className="p-4 bg-white rounded-xl border border-border space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-navy uppercase tracking-wider">
                      Instructors & Speakers ({((workshop.speakers || []).length)})
                    </p>
                    <p className="text-[11px] text-muted">Profiles featured on event page</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {(!workshop.speakers || workshop.speakers.length === 0) && (
                      <button
                        type="button"
                        onClick={() => {
                          setWorkshop({
                            ...workshop,
                            speakers: [
                              {
                                name: 'Ayub.',
                                title: 'Founder & Principal, Due Diligence Lab',
                                bio: 'Ex-KPMG & BDO Binder International. Built and exited tech companies. Specializes in multi-model agentic AI orchestration for institutional deal teams.',
                                photoUrl: '/ayub-founder-full.jpg',
                              },
                            ],
                          });
                        }}
                        className="text-[11px] text-navy font-bold hover:underline bg-cream border border-border px-2 py-1 rounded-md"
                      >
                        Preset: Ayub
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        const list = [...(workshop.speakers || [])];
                        setWorkshop({
                          ...workshop,
                          speakers: [
                            ...list,
                            {
                              name: '',
                              title: '',
                              bio: '',
                              photoUrl: '/ayub-founder-full.jpg',
                            },
                          ],
                        });
                      }}
                      className="text-xs text-gold font-bold hover:underline flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> Add Speaker
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {(workshop.speakers || []).map((speaker, idx) => (
                    <div key={idx} className="p-3 bg-cream rounded-xl border border-border space-y-3 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-navy">Speaker #{idx + 1}: {speaker.name || 'Unnamed'}</span>
                        <button
                          type="button"
                          onClick={() => {
                            const list = (workshop.speakers || []).filter((_, i) => i !== idx);
                            setWorkshop({ ...workshop, speakers: list });
                          }}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] text-muted mb-1 font-semibold">Name</label>
                          <input
                            type="text"
                            value={speaker.name || ''}
                            placeholder="e.g. Ayub."
                            onChange={(e) => {
                              const list = [...(workshop.speakers || [])];
                              list[idx] = { ...list[idx], name: e.target.value };
                              setWorkshop({ ...workshop, speakers: list });
                            }}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-white text-navy font-semibold text-xs focus:border-gold"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-muted mb-1 font-semibold">Title / Credentials</label>
                          <input
                            type="text"
                            value={speaker.title || ''}
                            placeholder="e.g. Ex-KPMG, Founder Due Diligence Lab"
                            onChange={(e) => {
                              const list = [...(workshop.speakers || [])];
                              list[idx] = { ...list[idx], title: e.target.value };
                              setWorkshop({ ...workshop, speakers: list });
                            }}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-white text-navy text-xs focus:border-gold"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] text-muted mb-1 font-semibold">Bio</label>
                        <textarea
                          rows={2}
                          value={speaker.bio || ''}
                          placeholder="Short background and expertise overview..."
                          onChange={(e) => {
                            const list = [...(workshop.speakers || [])];
                            list[idx] = { ...list[idx], bio: e.target.value };
                            setWorkshop({ ...workshop, speakers: list });
                          }}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-white text-navy text-xs resize-none focus:border-gold"
                        />
                      </div>

                      <ImageField
                        label="Speaker Portrait Photo"
                        value={speaker.photoUrl || '/ayub-founder-full.jpg'}
                        onChange={(url) => {
                          const list = [...(workshop.speakers || [])];
                          list[idx] = { ...list[idx], photoUrl: url };
                          setWorkshop({ ...workshop, speakers: list });
                        }}
                        slotHint="trainer-portrait"
                        helperText="Portrait headshot (3:4 aspect ratio recommended)"
                      />
                    </div>
                  ))}
                  {(!workshop.speakers || workshop.speakers.length === 0) && (
                    <p className="text-xs text-muted italic py-1">No speakers configured yet.</p>
                  )}
                </div>
              </div>

              {/* FAQs */}
              <div className="p-4 bg-white rounded-xl border border-border space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-navy uppercase tracking-wider">
                      Frequently Asked Questions ({((workshop.faqs || []).length)})
                    </p>
                    <p className="text-[11px] text-muted">Workshop specific Q&A</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const list = [...(workshop.faqs || [])];
                      setWorkshop({
                        ...workshop,
                        faqs: [
                          ...list,
                          {
                            question: 'What deal tools or software are required for this session?',
                            answer: 'All systems are provided live in-browser. We provide staging environments for hands-on exercises.',
                          },
                        ],
                      });
                    }}
                    className="text-xs text-gold font-bold hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Add FAQ
                  </button>
                </div>

                <div className="space-y-3">
                  {(workshop.faqs || []).map((faq, idx) => (
                    <div key={idx} className="p-3 bg-cream rounded-xl border border-border space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-navy">Question #{idx + 1}</span>
                        <button
                          type="button"
                          onClick={() => {
                            const list = (workshop.faqs || []).filter((_, i) => i !== idx);
                            setWorkshop({ ...workshop, faqs: list });
                          }}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <input
                        type="text"
                        value={faq.question || ''}
                        placeholder="Question title"
                        onChange={(e) => {
                          const list = [...(workshop.faqs || [])];
                          list[idx] = { ...list[idx], question: e.target.value };
                          setWorkshop({ ...workshop, faqs: list });
                        }}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-white text-navy font-semibold text-xs focus:border-gold"
                      />
                      <textarea
                        rows={2}
                        value={faq.answer || ''}
                        placeholder="Answer explanation..."
                        onChange={(e) => {
                          const list = [...(workshop.faqs || [])];
                          list[idx] = { ...list[idx], answer: e.target.value };
                          setWorkshop({ ...workshop, faqs: list });
                        }}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-white text-navy text-xs resize-none focus:border-gold"
                      />
                    </div>
                  ))}
                  {(!workshop.faqs || workshop.faqs.length === 0) && (
                    <p className="text-xs text-muted italic py-1">No workshop-specific FAQs added yet.</p>
                  )}
                </div>
              </div>

              {/* Resources & Deliverables */}
              <div className="p-4 bg-white rounded-xl border border-border space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-navy uppercase tracking-wider">
                      Resources & Deliverables ({((workshop.resources || []).length)})
                    </p>
                    <p className="text-[11px] text-muted">Downloads, financial models, slides, or repo links</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const list = [...(workshop.resources || [])];
                      setWorkshop({
                        ...workshop,
                        resources: [
                          ...list,
                          {
                            title: 'Deal Flow Architecture Deck',
                            url: 'https://hub.dealflow.ai/resources/architecture-deck.pdf',
                            type: 'PDF',
                          },
                        ],
                      });
                    }}
                    className="text-xs text-gold font-bold hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Add Resource
                  </button>
                </div>

                <div className="space-y-3">
                  {(workshop.resources || []).map((resItem, idx) => (
                    <div key={idx} className="p-3 bg-cream rounded-xl border border-border space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-navy">Resource #{idx + 1}</span>
                        <button
                          type="button"
                          onClick={() => {
                            const list = (workshop.resources || []).filter((_, i) => i !== idx);
                            setWorkshop({ ...workshop, resources: list });
                          }}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <input
                          type="text"
                          value={resItem.title || ''}
                          placeholder="Resource Title (e.g. LBO Framework Template)"
                          onChange={(e) => {
                            const list = [...(workshop.resources || [])];
                            list[idx] = { ...list[idx], title: e.target.value };
                            setWorkshop({ ...workshop, resources: list });
                          }}
                          className="sm:col-span-2 px-2.5 py-1.5 rounded-lg border border-border bg-white text-navy font-semibold text-xs focus:border-gold"
                        />
                        <select
                          value={resItem.type || 'PDF'}
                          onChange={(e) => {
                            const list = [...(workshop.resources || [])];
                            list[idx] = { ...list[idx], type: e.target.value };
                            setWorkshop({ ...workshop, resources: list });
                          }}
                          className="px-2.5 py-1.5 rounded-lg border border-border bg-white text-navy text-xs focus:border-gold"
                        >
                          <option value="PDF">PDF Document</option>
                          <option value="Slide Deck">Slide Deck</option>
                          <option value="Model / Template">Model / Template</option>
                          <option value="Code Repository">Code Repository</option>
                          <option value="Link">External Link</option>
                        </select>
                      </div>

                      <input
                        type="url"
                        value={resItem.url || ''}
                        placeholder="https://..."
                        onChange={(e) => {
                          const list = [...(workshop.resources || [])];
                          list[idx] = { ...list[idx], url: e.target.value };
                          setWorkshop({ ...workshop, resources: list });
                        }}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-white text-navy font-mono text-xs focus:border-gold"
                      />
                    </div>
                  ))}
                  {(!workshop.resources || workshop.resources.length === 0) && (
                    <p className="text-xs text-muted italic py-1">No resources added yet.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: THEME & ANIMATION PRESET */}
          {activeTab === 'theme' && (
            <div className="p-4 space-y-4 pb-28">
              <div className="p-3 bg-cream rounded-xl border border-border">
                <p className="text-xs font-bold text-navy mb-1">Animation Preset</p>
                <p className="text-[11px] text-muted mb-3">
                  Controls page-wide motion speed and intensity for this workshop.
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {['minimal', 'smooth', 'dynamic'].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setWorkshop({ ...workshop, animationPreset: preset })}
                      className={`py-2 px-3 rounded-lg border text-xs font-semibold capitalize transition-all ${
                        (workshop.animationPreset || 'smooth') === preset
                          ? 'bg-navy text-white border-navy'
                          : 'bg-white text-navy border-border hover:border-gold'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-cream rounded-xl border border-border space-y-3">
                <p className="text-xs font-bold text-navy">Color Palette Overrides</p>
                <div>
                  <label className="text-[11px] text-muted block mb-1">Gold Accent Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={workshop.theme?.gold || '#C8A24F'}
                      onChange={(e) =>
                        setWorkshop({
                          ...workshop,
                          theme: { ...workshop.theme, gold: e.target.value },
                        })
                      }
                      className="w-8 h-8 rounded border border-border cursor-pointer"
                    />
                    <input
                      type="text"
                      value={workshop.theme?.gold || '#C8A24F'}
                      onChange={(e) =>
                        setWorkshop({
                          ...workshop,
                          theme: { ...workshop.theme, gold: e.target.value },
                        })
                      }
                      className="flex-1 px-3 py-1.5 rounded-lg border border-border bg-white text-xs font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] text-muted block mb-1">Cream Background Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={workshop.theme?.cream || '#FAF8F5'}
                      onChange={(e) =>
                        setWorkshop({
                          ...workshop,
                          theme: { ...workshop.theme, cream: e.target.value },
                        })
                      }
                      className="w-8 h-8 rounded border border-border cursor-pointer"
                    />
                    <input
                      type="text"
                      value={workshop.theme?.cream || '#FAF8F5'}
                      onChange={(e) =>
                        setWorkshop({
                          ...workshop,
                          theme: { ...workshop.theme, cream: e.target.value },
                        })
                      }
                      className="flex-1 px-3 py-1.5 rounded-lg border border-border bg-white text-xs font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: HUB CARD PREVIEW */}
          {activeTab === 'cardPreview' && (
            <div className="p-6 space-y-4 pb-28">
              <div className="text-center mb-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-navy">
                  Hub Card Preview
                </h3>
                <p className="text-[11px] text-muted">
                  How this workshop appears in the public grid on the home page.
                </p>
              </div>
              <div className="max-w-sm mx-auto">
                <WorkshopCard workshop={workshop} />
              </div>
            </div>
          )}
        </div>

        {/* RIGHT PANE: LIVE PREVIEW PANEL */}
        <div
          className={`h-full flex-1 bg-white overflow-y-auto min-h-0 pb-28 ${
            previewMode === 'editor' ? 'hidden' : 'block'
          }`}
        >
          <div className="sticky top-0 z-10 bg-navy text-white text-[11px] font-semibold py-1.5 px-4 flex items-center justify-between border-b border-navy/80">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-gold" /> Live Real-Time Workshop Preview
            </span>
            <span className="text-white/60">Updates instantly as you edit</span>
          </div>

          {/* Public Landing Page Renderer */}
          <div className="pointer-events-none select-none">
            {sections
              .filter((s) => s.visible !== false)
              .sort((a, b) => (a.order || 0) - (b.order || 0))
              .map((section) => {
                switch (section.type) {
                  case 'hero':
                    return (
                      <HeroSection
                        key={section._id || 'hero'}
                        content={section.content}
                        workshop={workshop}
                        onRegister={() => {}}
                      />
                    );
                  case 'benefits':
                    return <BenefitsSection key={section._id || 'benefits'} content={section.content} />;
                  case 'logos':
                    return <LogosSection key={section._id || 'logos'} content={section.content} />;
                  case 'community':
                    return <CommunitySection key={section._id || 'community'} content={section.content} />;
                  case 'testimonials':
                    return <TestimonialsSection key={section._id || 'testimonials'} content={section.content} />;
                  case 'stages':
                    return <StagesSection key={section._id || 'stages'} content={section.content} />;
                  case 'audience':
                    return <AudienceSection key={section._id || 'audience'} content={section.content} onRegister={() => {}} />;
                  case 'trainer':
                    return <TrainerSection key={section._id || 'trainer'} content={section.content} />;
                  case 'footer':
                    return <WorkshopFooter key={section._id || 'footer'} content={section.content} />;
                  default:
                    return null;
                }
              })}
          </div>
        </div>
      </div>
    </div>
  );
}
