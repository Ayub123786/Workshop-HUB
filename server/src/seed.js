import 'dotenv/config';
import User from './models/User.js';
import Workshop from './models/Workshop.js';
import Section from './models/Section.js';
import Form from './models/Form.js';
import PlatformSettings from './models/PlatformSettings.js';
import Submission from './models/Submission.js';
import { isSupabaseConfigured } from './utils/supabase.js';

async function seed() {
  try {
    if (isSupabaseConfigured) {
      console.log('⚡ Connected to Supabase Database for seeding');
    } else {
      console.log('ℹ️  Seeding Supabase local database store (configure SUPABASE_URL in .env to seed remote)');
    }

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Workshop.deleteMany({}),
      Section.deleteMany({}),
      Form.deleteMany({}),
      PlatformSettings.deleteMany({}),
      Submission.deleteMany({}),
    ]);
    console.log('🗑️  Cleared existing data');

    /* ─── ADMIN USER ─── */
    const adminUser = await User.create({
      name: process.env.SEED_ADMIN_NAME || 'Admin User',
      email: process.env.SEED_ADMIN_EMAIL || 'admin@workshophub.com',
      passwordHash: process.env.SEED_ADMIN_PASSWORD || 'Admin@123456',
      role: 'admin',
    });
    console.log(`👤 Admin created: ${adminUser.email}`);

    /* ─── PLATFORM SETTINGS ─── */
    const settings = await PlatformSettings.create({
      platformName: 'Workshop Hub',
      hubHeadline: 'Build What the Best Funds Already Run',
      hubSubtitle: 'Live, expert-led master classes for finance and investment professionals. Walk away with systems, not slides.',
      navbarLinks: [
        { label: 'Workshops', href: '/workshops', order: 0 },
        { label: 'Upcoming', href: '/workshops?filter=upcoming', order: 1 },
        { label: 'Past', href: '/workshops?filter=past', order: 2 },
      ],
      footerText: '© 2026 Workshop Hub · Morse Bridge Ventures. All rights reserved.',
      globalTrust: {
        aumNumber: '246',
        aumLabel: 'Billion AUM+',
        aumPrefix: '$',
        testimonials: [
          {
            name: 'Mauricio Bisker Finkelstein',
            role: 'Analista de Startups',
            company: 'Anjos do Brasil',
            quote: 'I attended your workshop last Friday and found it very insightful.',
            rating: 5,
          },
          {
            name: 'Lucia Rodriguez Lacasa',
            role: 'Investor',
            company: 'Albion VC',
            quote: 'Diff bits were quite useful! Especially on the DD part.',
            rating: 5,
          },
          {
            name: 'Geoff Heath',
            role: 'Family Office',
            company: 'VC Division, United States',
            quote: 'Thank you for the excellent webinar this morning. How can I get a copy of the MD Files?',
            rating: 5,
          },
          {
            name: 'Saloni Gupta',
            role: 'Associate Director – Sales & Key Accounts',
            company: 'PE Front Office Solution',
            quote: 'It was a really insightful session. Thanks for organizing the same and sharing insights in the Deal Workflows.',
            rating: 5,
          },
        ],
      },
      animationsEnabled: true,
    });
    console.log('⚙️  Platform settings created');

    /* ─── WORKSHOP 1: PE Deal Flow Automation (main) ─── */
    const peWorkshop = await Workshop.create({
      slug: 'pe-deal-flow-automation',
      title: 'PE Deal Flow Automation Master Class with Ayub',
      shortDescription: 'Build a full agent workspace running end-to-end Due Diligence automation across sourcing, screening, commercial DD, and IC prep.',
      bannerImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=675&fit=crop',
      category: 'Private Equity',
      tags: ['AI', 'Due Diligence', 'Automation', 'Deal Flow', 'Private Equity'],
      status: 'published',
      showOnHub: true,
      featured: true,
      displayOrder: 0,
      startDate: new Date('2026-11-13T15:00:00Z'), // 6PM Dubai, 10AM NY, 3PM London
      endDate: new Date('2026-11-13T19:00:00Z'),
      timezones: [
        { city: 'Dubai', time: '6:00 PM', label: 'GST' },
        { city: 'New York', time: '10:00 AM', label: 'EST' },
        { city: 'London', time: '3:00 PM', label: 'GMT' },
      ],
      seatsTotal: 150,
      seatsBooked: 47,
      theme: { gold: '#C8A24F', cream: '#FAFAFA', navy: '#0A0A0A', fontFamily: 'Inter' },
      animationPreset: 'smooth',
      seo: {
        title: 'PE Deal Flow Automation Master Class with Ayub | Workshop Hub',
        description: 'Build a full AI agent workspace for Due Diligence automation. Live master class covering sourcing, screening, commercial DD, and IC prep.',
        ogImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=630&fit=crop',
      },
    });

    // PE Workshop Sections
    const peSections = [
      {
        type: 'hero',
        order: 0,
        visible: true,
        content: {
          badge: 'LIVE MASTER CLASS',
          title: 'PE Deal Flow Automation Master Class with Ayub',
          subtitle: 'The market just shifted. The fastest funds aren\'t buying AI tools — they\'re building agent teams that run diligence themselves. Here you build yours: a full agent workspace running end-to-end Due Diligence automation across sourcing, screening, commercial DD, and IC prep. By the end, the system is yours to keep.',
          ctaLabel: 'Reserve Your Spot',
          bannerImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=675&fit=crop',
          dateLabel: 'NEXT MASTER CLASS',
          dates: 'November 13 & October 22, 2026',
          timezones: [
            { city: 'Dubai', time: '6:00 PM' },
            { city: 'New York', time: '10:00 AM' },
            { city: 'London', time: '3:00 PM' },
          ],
        },
        animation: { entrance: 'fade-up', stagger: 0.1, speed: 'normal', hover: 'none', parallax: false },
      },
      {
        type: 'benefits',
        order: 1,
        visible: true,
        content: {
          label: 'WHAT YOU GET OUT OF IT',
          heading: 'Everything you need to hit the ground running — not just during the session, but long after it ends.',
          items: [
            {
              id: 'b1',
              icon: 'Video',
              title: 'Video Tutorial',
              description: 'Step-by-step recordings of every prompt being run live on real deal scenarios — rewatch at your own pace.',
            },
            {
              id: 'b2',
              icon: 'ClipboardList',
              title: 'Playbook',
              description: 'All 20+ Claude Cowork prompts, organised by deal stage and ready to copy-paste into your workflow tomorrow.',
            },
            {
              id: 'b3',
              icon: 'FolderOpen',
              title: 'Case Study Docs',
              description: 'Real anonymised deal examples showing inputs, AI outputs, and how teams used them to make faster decisions.',
            },
          ],
        },
        animation: { entrance: 'fade-up', stagger: 0.15, speed: 'normal', hover: 'lift', parallax: false },
      },
      {
        type: 'logos',
        order: 2,
        visible: true,
        content: {
          label: 'PROFESSIONALS FROM THESE FIRMS HAVE ATTENDED PREVIOUS MASTER CLASSES',
          heading: 'To stay ahead in the Deal Due Diligence game',
          image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&h=500&fit=crop',
          firms: ['Apax', 'EY Parthenon', 'KPMG', 'Rivean Capital', 'Bain & Company', 'Baker Tilly', 'PwC', 'Serendipia Capital Partners', 'Fremman Capital', 'NMP', 'Abacus Global Management', 'Quore Capital', 'Carlson', 'ITACA', 'Integrity360', 'ERAYA Capital', 'CBRE Investment Management', 'Ibtikar Fund', 'Core 4 Partners', 'NL Investeert', 'Prelude Growth Partners', 'Novator'],
          aumNumber: '246',
          aumLabel: 'Billion AUM',
          aumPrefix: '$',
        },
        animation: { entrance: 'fade-in', stagger: 0.05, speed: 'slow', hover: 'none', parallax: false },
      },
      {
        type: 'community',
        order: 3,
        visible: true,
        content: {
          badge: 'OUR COMMUNITY',
          heading: 'Alumni Reflection & Networking',
          subtext: 'We host post-workshop reflection meetups to exchange notes and learn from one another.',
          image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1200&h=800&fit=crop',
        },
        animation: { entrance: 'zoom-in', stagger: 0, speed: 'normal', hover: 'none', parallax: true },
      },
      {
        type: 'testimonials',
        order: 4,
        visible: true,
        content: {
          label: 'WHAT ATTENDEES SAY',
          heading: 'Post Master Class Responses',
          subtext: 'From VCs, PEs, and Family Offices who attended',
          items: [
            { id: 't1', name: 'Mauricio Bisker Finkelstein', company: 'Anjos do Brasil', role: 'Analista de Startups na Anjos do Brasil', location: 'São Paulo, Brazil', quote: 'I attended your workshop last Friday and found it very insightful.', avatar: 'https://i.pravatar.cc/80?img=11' },
            { id: 't2', name: 'Lucia Rodriguez Lacasa', company: 'Albion VC', role: 'Investor at AlbionVC | Healthtech | ex-Goldman Sachs', location: 'London, United Kingdom', quote: 'Diff bits were quite useful! Especially on the DD part.', avatar: 'https://i.pravatar.cc/80?img=49' },
            { id: 't3', name: 'Geoff Heath', company: 'Family Office with a VC Division', role: 'From United States', location: 'Folsom, California', quote: 'Thank you for the excellent webinar this morning. How can I get a copy of the MD Files you shared?', avatar: 'https://i.pravatar.cc/80?img=15' },
            { id: 't4', name: 'Saloni Gupta', company: 'PE Front Office Solution', role: 'Associate Director – Sales & Key Accounts', location: 'Rajasthan, India', quote: 'It was a really insightful session. Thanks for organizing the same and sharing insights in the Deal Workflows.', avatar: 'https://i.pravatar.cc/80?img=47' },
            { id: 't5', name: 'Thomas Strahm', company: 'American Gelbvieh Association', role: 'Commercial Marketing', location: 'Sabetha, Kansas', quote: 'I found the demonstration of the workflow you set up in Claude very impressive. I would very much like to stay updated on your services and offerings.', avatar: 'https://i.pravatar.cc/80?img=12' },
            { id: 't6', name: 'Lukas Gerdon', company: 'KMU-Investor', role: '', location: 'Vallendar, Rhineland-Palatinate, Germany', quote: 'Excellent workshop to get started with Claude CoWork on the topic of deal sourcing and deal evaluation. No Claude CoWork experience required.', avatar: 'https://i.pravatar.cc/80?img=33' },
          ],
        },
        animation: { entrance: 'fade-up', stagger: 0.1, speed: 'normal', hover: 'lift', parallax: false },
      },
      {
        type: 'stages',
        order: 5,
        visible: true,
        content: {
          label: 'WHAT YOU\'LL BUILD',
          heading: '8 Stages. Live Results.',
          subtitle: 'Each stage collapses days of analyst work into minutes using AI — and you leave with every prompt ready to paste tomorrow.',
          items: [
            { id: 's1', number: '01', icon: 'TrendingUp', title: 'Deal Origination', description: 'Auto-generate a daily target watchlist of acquisition candidates scored against your fund mandate — replacing 3–5 hours of manual scanning with a 10-minute automated report.', duration: '10 min', timeSaved: '3–5 hrs saved' },
            { id: 's2', number: '02', icon: 'FileSearch', title: 'CIM Screening', description: 'Run a 100-point, 10-dimension scorecard on any CIM in 8 minutes — producing a pass/proceed recommendation before your morning call.', duration: '8 min', timeSaved: 'Hours saved' },
            { id: 's3', number: '03', icon: 'BarChart2', title: 'Commercial Due Diligence', description: 'Generate a full market research report with TAM, competitive landscape, and timing thesis — with cited sources — in 3 hours instead of 2 weeks.', duration: '3 hrs', timeSaved: '2 weeks → 3 hrs' },
            { id: 's4', number: '04', icon: 'DollarSign', title: 'Financial Due Diligence', description: 'Normalise EBITDA, review LBO model assumptions, and produce a plain-language model summary for partners — in 2 hours instead of 5 days.', duration: '2 hrs', timeSaved: '5 days → 2 hrs' },
            { id: 's5', number: '05', icon: 'Users', title: 'Management Due Diligence', description: 'Run systematic background checks on entire leadership teams — with red flag triggers and risk ratings — in 45 minutes.', duration: '45 min', timeSaved: 'Days → 45 min' },
            { id: 's6', number: '06', icon: 'Scale', title: 'Legal DD & SPA Review', description: 'Scan legal documents and SPAs for red flags, non-market terms, and negotiation points — in 20 minutes before your lawyers open a single page.', duration: '20 min', timeSaved: 'Before lawyers open a page' },
            { id: 's7', number: '07', icon: 'FileText', title: 'IC Memo', description: 'Assemble an 80% complete 20–35 page Investment Committee memo from all prior DD outputs — in 30 minutes instead of 20 hours.', duration: '30 min', timeSaved: '20 hrs → 30 min' },
            { id: 's8', number: '08', icon: 'Shield', title: 'Portfolio Monitoring', description: 'Auto-generate monthly KPI reports across every portfolio company the day financials arrive — and compile quarterly LP letters in 30 minutes.', duration: '30 min', timeSaved: 'Monthly auto-reports' },
          ],
        },
        animation: { entrance: 'fade-up', stagger: 0.12, speed: 'normal', hover: 'lift', parallax: false },
      },
      {
        type: 'audience',
        order: 6,
        visible: true,
        content: {
          label: 'WHO THIS IS FOR',
          heading: 'Built for PE professionals who want to move faster',
          description: 'PE partners, principals, analysts, and operations teams at funds managing <strong>$50M to $5B+</strong> who want to move faster on deals without adding headcount.',
          chips: ['PE Partners', 'Principals', 'Analysts', 'Operations Teams'],
          ctaLabel: 'Reserve Your Spot',
        },
        animation: { entrance: 'fade-up', stagger: 0.08, speed: 'normal', hover: 'none', parallax: false },
      },
      {
        type: 'trainer',
        order: 7,
        visible: true,
        content: {
          label: 'YOUR TRAINER',
          name: 'Ayub.',
          portrait: '/ayub-founder.png',
          portraitCaption: "The future isn't firm versus firm. It's firm versus agent stack.",
          bio: [
            'Fifteen years in finance, now building multi model agentic systems for private equity and venture capital firms focused on due diligence.',
            'Trained in audit and advisory at KPMG and BDO Binder International, then founded and sold a technology company. That mix is the point. Most AI training for investment teams is run by people who have never signed off on a set of numbers, and most valuation training is run by people who have never built an agent. This session sits in the middle.',
            'Runs a due diligence lab for PE and VC firms, where every engine is stress tested against real deal documents before it reaches a client.',
          ],
          keyValues: [
            { label: 'AUDIT', value: 'Ex KPMG, ex BDO Binder International' },
            { label: 'FOUNDER', value: 'Built and exited a technology company' },
            { label: 'NOW', value: 'Due diligence lab for PE and VC firms' },
            { label: 'FOCUS', value: 'Multi model agentic orchestration for deal teams' },
          ],
        },
        animation: { entrance: 'slide-right', stagger: 0.1, speed: 'normal', hover: 'none', parallax: false },
      },
      {
        type: 'footer',
        order: 8,
        visible: true,
        content: {
          companyName: 'Morse Bridge Ventures',
          copyright: '© 2026 PE Deal Flow Automation Master Class with Ayub. All rights reserved.',
        },
        animation: { entrance: 'fade-in', stagger: 0, speed: 'normal', hover: 'none', parallax: false },
      },
    ];

    await Section.insertMany(peSections.map(s => ({ ...s, workshopId: peWorkshop._id })));

    // PE Workshop Form
    await Form.create({
      workshopId: peWorkshop._id,
      fields: [
        { id: 'name', type: 'text', label: 'Full Name', placeholder: 'Your full name', required: true, order: 0 },
        { id: 'email', type: 'email', label: 'Email Address', placeholder: 'you@example.com', required: true, order: 1 },
        { id: 'company', type: 'text', label: 'Company / Fund', placeholder: 'Your organization', required: true, order: 2 },
        { id: 'role', type: 'dropdown', label: 'Your Role', placeholder: 'Select your role', required: true, options: ['Partner / GP', 'Principal', 'Associate', 'Analyst', 'Operations', 'Other'], order: 3 },
        { id: 'aum', type: 'dropdown', label: 'Fund AUM', placeholder: 'Select AUM range', required: false, options: ['< $50M', '$50M – $500M', '$500M – $5B', '$5B+', 'Family Office', 'Other'], order: 4 },
        { id: 'linkedin', type: 'text', label: 'LinkedIn Profile', placeholder: 'linkedin.com/in/...', required: false, order: 5 },
      ],
      capacity: 150,
      deadline: new Date('2026-11-12T23:59:00Z'),
      successMessage: 'Your spot is confirmed! Check your email for details. We look forward to seeing you on November 13th.',
      ctaLabel: 'Reserve Your Spot',
    });
    console.log('✅ PE Deal Flow workshop + sections + form created');

    /* ─── WORKSHOP 2: Upcoming Placeholder ─── */
    const vcWorkshop = await Workshop.create({
      slug: 'vc-portfolio-intelligence',
      title: 'VC Portfolio Intelligence with AI',
      shortDescription: 'Automate your portfolio monitoring, LP reporting, and follow-on analysis using a custom AI agent stack built live in this session.',
      bannerImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=675&fit=crop',
      category: 'Venture Capital',
      tags: ['AI', 'Portfolio Monitoring', 'VC', 'LP Reporting'],
      status: 'published',
      showOnHub: true,
      featured: false,
      displayOrder: 1,
      startDate: new Date('2026-12-10T15:00:00Z'),
      endDate: new Date('2026-12-10T19:00:00Z'),
      timezones: [
        { city: 'Dubai', time: '7:00 PM', label: 'GST' },
        { city: 'New York', time: '10:00 AM', label: 'EST' },
        { city: 'London', time: '3:00 PM', label: 'GMT' },
      ],
      seatsTotal: 100,
      seatsBooked: 12,
      theme: { gold: '#C8A24F', cream: '#FAFAFA', navy: '#0A0A0A', fontFamily: 'Inter' },
      animationPreset: 'smooth',
      seo: {
        title: 'VC Portfolio Intelligence with AI | Workshop Hub',
        description: 'Build AI-powered portfolio monitoring and LP reporting systems. Live master class for VC professionals.',
      },
    });

    const vcSections = [
      {
        type: 'hero', order: 0, visible: true,
        content: {
          badge: 'LIVE MASTER CLASS',
          title: 'VC Portfolio Intelligence with AI',
          subtitle: 'Stop manually compiling portfolio updates. Build a fully automated monitoring system that generates LP-ready reports, tracks KPIs, and flags risks before they become problems.',
          ctaLabel: 'Reserve Your Spot',
          bannerImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=675&fit=crop',
          dateLabel: 'NEXT MASTER CLASS',
          dates: 'December 10, 2026',
          timezones: [
            { city: 'Dubai', time: '7:00 PM' },
            { city: 'New York', time: '10:00 AM' },
            { city: 'London', time: '3:00 PM' },
          ],
        },
        animation: { entrance: 'fade-up', stagger: 0.1, speed: 'normal', hover: 'none', parallax: false },
      },
      {
        type: 'benefits', order: 1, visible: true,
        content: {
          label: 'WHAT YOU GET OUT OF IT',
          heading: 'Transform hours of portfolio work into minutes of automated intelligence.',
          items: [
            { id: 'b1', icon: 'Activity', title: 'Live Monitoring Dashboard', description: 'Build a real-time portfolio health dashboard that flags underperforming companies before your board meeting.' },
            { id: 'b2', icon: 'FileText', title: 'LP Report Generator', description: 'Auto-generate quarterly LP letters in 30 minutes from raw financial data — consistent, accurate, and on-brand.' },
            { id: 'b3', icon: 'TrendingUp', title: 'Follow-On Framework', description: 'Systematic AI-powered analysis of follow-on opportunities against your thesis and market conditions.' },
          ],
        },
        animation: { entrance: 'fade-up', stagger: 0.15, speed: 'normal', hover: 'lift', parallax: false },
      },
      {
        type: 'stages', order: 2, visible: true,
        content: {
          label: 'WHAT YOU\'LL BUILD',
          heading: '5 Systems. Real Results.',
          subtitle: 'Each system eliminates a manual process that costs your team days every quarter.',
          items: [
            { id: 's1', number: '01', icon: 'Database', title: 'Data Collection Agent', description: 'Automatically pull financials from portfolio companies via email, Airtable, or shared docs.', duration: '30 min', timeSaved: 'Days → 30 min' },
            { id: 's2', number: '02', icon: 'BarChart2', title: 'KPI Tracker', description: 'Build a living scorecard across all portfolio companies with automatic flagging and alerts.', duration: '45 min', timeSaved: 'Weekly hours' },
            { id: 's3', number: '03', icon: 'FileText', title: 'LP Report Builder', description: 'Generate complete quarterly reports with AI-written narrative sections from structured data.', duration: '1 hr', timeSaved: '3 days → 1 hr' },
            { id: 's4', number: '04', icon: 'TrendingUp', title: 'Follow-On Analyzer', description: 'Score follow-on opportunities against thesis, market timing, and fund reserves automatically.', duration: '30 min', timeSaved: 'Consistent decisions' },
            { id: 's5', number: '05', icon: 'Bell', title: 'Alert System', description: 'Set up intelligent alerts for cash runway warnings, market events, and competitive moves.', duration: '20 min', timeSaved: 'Never miss a signal' },
          ],
        },
        animation: { entrance: 'fade-up', stagger: 0.12, speed: 'normal', hover: 'lift', parallax: false },
      },
      {
        type: 'audience', order: 3, visible: true,
        content: {
          label: 'WHO THIS IS FOR',
          heading: 'Built for VC professionals managing active portfolios',
          description: 'Partners, associates, and operations leads at funds with <strong>5+ portfolio companies</strong> who spend too much time on manual reporting and monitoring.',
          chips: ['VC Partners', 'Associates', 'Portfolio Ops', 'CFOs', 'Investor Relations'],
          ctaLabel: 'Reserve Your Spot',
        },
        animation: { entrance: 'fade-up', stagger: 0.08, speed: 'normal', hover: 'none', parallax: false },
      },
      {
        type: 'trainer', order: 4, visible: true,
        content: {
          label: 'YOUR TRAINER',
          name: 'Ayub.',
          portrait: '/ayub-founder.png',
          portraitCaption: "The future isn't firm versus firm. It's firm versus agent stack.",
          bio: [
            'Fifteen years in finance, now building multi model agentic systems for private equity and venture capital firms focused on due diligence.',
            'Trained in audit and advisory at KPMG and BDO Binder International, then founded and sold a technology company. That mix is the point. Most AI training for investment teams is run by people who have never signed off on a set of numbers, and most valuation training is run by people who have never built an agent. This session sits in the middle.',
            'Runs a due diligence lab for PE and VC firms, where every engine is stress tested against real deal documents before it reaches a client.',
          ],
          keyValues: [
            { label: 'AUDIT', value: 'Ex KPMG, ex BDO Binder International' },
            { label: 'FOUNDER', value: 'Built and exited a technology company' },
            { label: 'NOW', value: 'Due diligence lab for PE and VC firms' },
            { label: 'FOCUS', value: 'Multi model agentic orchestration for deal teams' },
          ],
        },
        animation: { entrance: 'slide-right', stagger: 0.1, speed: 'normal', hover: 'none', parallax: false },
      },
      {
        type: 'footer', order: 5, visible: true,
        content: { companyName: 'Morse Bridge Ventures', copyright: '© 2026 VC Portfolio Intelligence. All rights reserved.' },
        animation: { entrance: 'fade-in', stagger: 0, speed: 'normal', hover: 'none', parallax: false },
      },
    ];
    await Section.insertMany(vcSections.map(s => ({ ...s, workshopId: vcWorkshop._id })));
    await Form.create({
      workshopId: vcWorkshop._id,
      fields: [
        { id: 'name', type: 'text', label: 'Full Name', placeholder: 'Your full name', required: true, order: 0 },
        { id: 'email', type: 'email', label: 'Email Address', placeholder: 'you@example.com', required: true, order: 1 },
        { id: 'fund', type: 'text', label: 'Fund Name', placeholder: 'Your VC fund', required: true, order: 2 },
        { id: 'portfolio', type: 'dropdown', label: 'Portfolio Size', placeholder: 'Select range', required: false, options: ['1–5 companies', '5–15 companies', '15–30 companies', '30+ companies'], order: 3 },
      ],
      capacity: 100,
      successMessage: 'Your spot is confirmed for December 10th! Check your email for the session link.',
    });
    console.log('✅ VC Portfolio workshop created');

    /* ─── WORKSHOP 3: Past Workshop ─── */
    const familyOfficeWorkshop = await Workshop.create({
      slug: 'family-office-deal-sourcing',
      title: 'Family Office Deal Sourcing Masterclass',
      shortDescription: 'Learn how leading family offices are using AI to source proprietary deal flow and evaluate opportunities 10x faster than traditional methods.',
      bannerImage: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=1200&h=675&fit=crop',
      category: 'Family Office',
      tags: ['AI', 'Deal Sourcing', 'Family Office', 'Investment'],
      status: 'published',
      showOnHub: true,
      featured: false,
      displayOrder: 2,
      startDate: new Date('2026-09-15T15:00:00Z'),
      endDate: new Date('2026-09-15T19:00:00Z'),
      timezones: [
        { city: 'Dubai', time: '7:00 PM', label: 'GST' },
        { city: 'New York', time: '11:00 AM', label: 'EDT' },
        { city: 'London', time: '4:00 PM', label: 'BST' },
      ],
      seatsTotal: 80,
      seatsBooked: 80,
      theme: { gold: '#C8A24F', cream: '#FAFAFA', navy: '#0A0A0A', fontFamily: 'Inter' },
      animationPreset: 'minimal',
      seo: {
        title: 'Family Office Deal Sourcing Masterclass | Workshop Hub',
        description: 'AI-powered deal sourcing for family offices. Learn to build proprietary deal flow systems.',
      },
    });

    const familySections = [
      {
        type: 'hero', order: 0, visible: true,
        content: {
          badge: 'PAST MASTER CLASS',
          title: 'Family Office Deal Sourcing Masterclass',
          subtitle: 'Discover how the smartest family offices are building proprietary deal flow with AI — sourcing better deals, faster, with fewer people.',
          ctaLabel: 'Get Resources',
          bannerImage: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=1200&h=675&fit=crop',
          dateLabel: 'COMPLETED',
          dates: 'September 15, 2026',
          timezones: [
            { city: 'Dubai', time: '7:00 PM' },
            { city: 'New York', time: '11:00 AM' },
            { city: 'London', time: '4:00 PM' },
          ],
        },
        animation: { entrance: 'fade-up', stagger: 0.1, speed: 'normal', hover: 'none', parallax: false },
      },
      {
        type: 'benefits', order: 1, visible: true,
        content: {
          label: 'WHAT YOU GOT',
          heading: 'A complete AI-powered deal sourcing system for family offices.',
          items: [
            { id: 'b1', icon: 'Search', title: 'Deal Scanner', description: 'Automated daily scanning of deal databases, news, and networks for opportunities matching your mandate.' },
            { id: 'b2', icon: 'Filter', title: 'Screening Framework', description: 'AI-powered first-pass screening that scores deals against your investment criteria in minutes.' },
            { id: 'b3', icon: 'Users', title: 'Relationship Map', description: 'Build and maintain an AI-enhanced relationship map to identify warm intro paths to target companies.' },
          ],
        },
        animation: { entrance: 'fade-up', stagger: 0.15, speed: 'normal', hover: 'lift', parallax: false },
      },
      {
        type: 'audience', order: 2, visible: true,
        content: {
          label: 'WHO ATTENDED',
          heading: 'Built for family office investment teams',
          description: 'Investment directors and principals at family offices with <strong>$50M to $2B+</strong> in assets looking to build proprietary deal flow without hiring more analysts.',
          chips: ['Family Office Principals', 'Investment Directors', 'Single Family Offices', 'Multi-Family Offices'],
          ctaLabel: 'Join Next Session',
        },
        animation: { entrance: 'fade-up', stagger: 0.08, speed: 'normal', hover: 'none', parallax: false },
      },
      {
        type: 'footer', order: 3, visible: true,
        content: { companyName: 'Morse Bridge Ventures', copyright: '© 2026 Family Office Deal Sourcing. All rights reserved.' },
        animation: { entrance: 'fade-in', stagger: 0, speed: 'normal', hover: 'none', parallax: false },
      },
    ];
    await Section.insertMany(familySections.map(s => ({ ...s, workshopId: familyOfficeWorkshop._id })));
    await Form.create({
      workshopId: familyOfficeWorkshop._id,
      fields: [
        { id: 'name', type: 'text', label: 'Full Name', placeholder: 'Your full name', required: true, order: 0 },
        { id: 'email', type: 'email', label: 'Email Address', placeholder: 'you@example.com', required: true, order: 1 },
      ],
      isActive: false, // past workshop
      successMessage: 'Added to the waitlist! We\'ll notify you of the next session.',
    });
    console.log('✅ Family Office workshop created');

    // Update settings to point to featured workshop
    await PlatformSettings.findByIdAndUpdate(settings._id, { featuredWorkshopId: peWorkshop._id });

    console.log('\n🌱 Seed complete!');
    console.log('─────────────────────────────────────');
    console.log(`Admin email:    ${adminUser.email}`);
    console.log(`Admin password: ${process.env.SEED_ADMIN_PASSWORD || 'Admin@123456'}`);
    console.log('─────────────────────────────────────');
    console.log('Workshops seeded:');
    console.log('  1. PE Deal Flow Automation (featured, upcoming)');
    console.log('  2. VC Portfolio Intelligence (upcoming)');
    console.log('  3. Family Office Deal Sourcing (past, sold out)');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  }
}

seed();
