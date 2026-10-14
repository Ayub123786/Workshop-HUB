import 'dotenv/config';
import Workshop from './models/Workshop.js';
import Section from './models/Section.js';
import Form from './models/Form.js';
import PlatformSettings from './models/PlatformSettings.js';
import { isSupabaseConfigured, supabase } from './utils/supabase.js';

async function seedExtended() {
  console.log('🌱 Starting Extended Data Seeding...');
  console.log('Supabase Configured:', isSupabaseConfigured);

  const now = new Date();

  // 1. Update / Set 'bhavya-sample' and any broken test workshops to draft
  try {
    const existingBhavya = await Workshop.findOne({ slug: 'bhavya-sample' });
    if (existingBhavya) {
      await Workshop.findByIdAndUpdate(existingBhavya._id, {
        status: 'draft',
        showOnHub: false,
      });
      console.log('🧹 Cleaned up Bhavya Sample -> set to draft (showOnHub: false)');
    }
    const existingSms = await Workshop.findOne({ slug: 'sm-s' });
    if (existingSms) {
      await Workshop.findByIdAndUpdate(existingSms._id, {
        status: 'draft',
        showOnHub: false,
      });
      console.log('🧹 Cleaned up sm-s -> set to draft (showOnHub: false)');
    }
  } catch (err) {
    console.warn('Note cleaning up test workshops:', err.message);
  }

  // 2. Workshop 1: PE Deal Flow Automation (Upcoming, Featured, Full Details)
  const peData = {
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
    startDate: new Date('2026-11-13T15:00:00Z').toISOString(),
    endDate: new Date('2026-11-13T19:00:00Z').toISOString(),
    timezones: [
      { city: 'Dubai', time: '7:00 PM', label: 'GST' },
      { city: 'New York', time: '10:00 AM', label: 'EST' },
      { city: 'London', time: '3:00 PM', label: 'GMT' },
    ],
    seatsTotal: 150,
    seatsBooked: 48,
    price: 0,
    speakers: [
      {
        name: 'Ayub.',
        title: 'Founder & Principal, Due Diligence Lab',
        bio: 'Fifteen years in finance, now building multi-model agentic systems for private equity and venture capital firms. Ex-KPMG and BDO Binder International. Built and exited a technology company.',
        photoUrl: '/ayub-founder-full.jpg',
      },
    ],
    learningOutcomes: [
      'Architect an end-to-end multi-agent deal sourcing and CIM evaluation workspace in Claude Cowork',
      'Deploy 100-point CIM scorecards that output pass/proceed recommendations in 8 minutes',
      'Produce commercial due diligence market maps, TAM estimation, and timing theses with live web verification',
      'Assemble 80% complete 20–35 page Investment Committee memos with cited financial models',
    ],
    requirements: [
      'Familiarity with private equity deal flow, CIM review, or LBO models',
      'Modern web browser (Google Chrome, Brave, or Microsoft Edge)',
      'Zero coding required; systems are built using prompt engineering and agent orchestration',
    ],
    agenda: [
      {
        time: '15:00 - 15:45 GMT',
        title: 'Stage 01-02: Deal Origination & CIM Rapid Screening',
        description: 'Auto-generating candidate watchlists scored against your fund mandate and running automated 100-point CIM scorecards.',
      },
      {
        time: '15:45 - 16:45 GMT',
        title: 'Stage 03-04: Commercial & Financial Due Diligence Engine',
        description: 'Synthesizing market research, TAM estimates, and normalizing EBITDA assumptions with citations.',
      },
      {
        time: '16:45 - 17:30 GMT',
        title: 'Stage 05-06: Management Screening & Legal SPA Scanning',
        description: 'Background validation on leadership teams and scanning legal documents for non-market terms.',
      },
      {
        time: '17:30 - 18:30 GMT',
        title: 'Stage 07-08: IC Memo Compilation & Portfolio KPI Tracking',
        description: 'Collapsing a 20-hour IC memo build into 30 minutes, plus automated monthly portfolio KPI reporting.',
      },
      {
        time: '18:30 - 19:00 GMT',
        title: 'Live Lab Q&A & Architecture Handover',
        description: 'Testing live deal files from attendees and complete distribution of all prompt templates and documentation.',
      },
    ],
    faqs: [
      {
        question: 'Will we receive the actual prompt files and agent configurations?',
        answer: 'Yes. All 20+ Claude Cowork prompts, Markdown instruction sets, and case study documents are handed over for your deal team to use immediately.',
      },
      {
        question: 'Is this hands-on or a lecture?',
        answer: '100% hands-on. You will see live deals evaluated in real time, with step-by-step walkthroughs of agent execution.',
      },
      {
        question: 'Can colleagues from our fund join under one registration?',
        answer: 'Each attendee requires a separate registration to access the live workshop link and dedicated staging environment.',
      },
      {
        question: 'Is prior AI or coding experience required?',
        answer: 'None. The session is specifically engineered for investment partners, principals, and analysts.',
      },
    ],
    resources: [
      {
        title: 'Due Diligence Agent Stack Architecture Diagram',
        url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200',
        type: 'PDF',
      },
      {
        title: '20+ PE Claude Cowork Deal Prompts Playbook',
        url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200',
        type: 'Slide Deck',
      },
      {
        title: 'LBO Valuation & Sensitivity Model Template',
        url: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200',
        type: 'Model / Template',
      },
    ],
  };

  const existingPE = await Workshop.findOne({ slug: 'pe-deal-flow-automation' });
  if (existingPE) {
    await Workshop.findByIdAndUpdate(existingPE._id, peData);
    console.log('✅ Updated PE Deal Flow Automation (Upcoming)');
  } else {
    await Workshop.create(peData);
    console.log('✅ Created PE Deal Flow Automation (Upcoming)');
  }

  // 3. Workshop 2: Live Now Session (Live Status)
  const liveStart = new Date(now.getTime() - 45 * 60 * 1000).toISOString();
  const liveEnd = new Date(now.getTime() + 3 * 60 * 60 * 1000).toISOString();
  const liveData = {
    slug: 'live-cim-evaluation-war-room',
    title: 'Live Deal Sourcing War Room: Real-Time CIM Evaluation',
    shortDescription: 'Active live session: Investment teams stress-testing real deal flow CIMs and deploying multi-agent evaluation pipelines.',
    bannerImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&h=675&fit=crop',
    category: 'Private Equity',
    tags: ['Live', 'CIM', 'War Room', 'Due Diligence'],
    status: 'published',
    showOnHub: true,
    featured: false,
    displayOrder: 1,
    startDate: liveStart,
    endDate: liveEnd,
    timezones: [
      { city: 'Dubai', time: '6:00 PM', label: 'GST' },
      { city: 'New York', time: '10:00 AM', label: 'EST' },
      { city: 'London', time: '3:00 PM', label: 'GMT' },
    ],
    seatsTotal: 120,
    seatsBooked: 104,
    price: 0,
    speakers: [
      {
        name: 'Ayub.',
        title: 'Master Trainer, Due Diligence Lab',
        bio: 'Ex-KPMG & BDO Binder International. Leading live CIM stress tests.',
        photoUrl: '/ayub-founder-full.jpg',
      },
    ],
  };

  const existingLive = await Workshop.findOne({ slug: 'live-cim-evaluation-war-room' });
  if (existingLive) {
    await Workshop.findByIdAndUpdate(existingLive._id, liveData);
    console.log('✅ Updated Live Deal Sourcing War Room (Live Now)');
  } else {
    await Workshop.create(liveData);
    console.log('✅ Created Live Deal Sourcing War Room (Live Now)');
  }

  // 4. Workshop 3: Sold Out Upcoming Session (Sold Out Status)
  const soldOutData = {
    slug: 'cross-border-ma-due-diligence',
    title: 'Cross-Border M&A Due Diligence & Deal Structuring',
    shortDescription: 'Advanced multi-jurisdictional tax structuring, regulatory approvals, and SPA risk modeling with specialized agent stacks.',
    bannerImage: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1200&h=675&fit=crop',
    category: 'Investment Banking',
    tags: ['M&A', 'Cross-Border', 'SPA', 'Due Diligence'],
    status: 'published',
    showOnHub: true,
    featured: false,
    displayOrder: 2,
    startDate: new Date('2026-11-28T14:00:00Z').toISOString(),
    endDate: new Date('2026-11-28T18:00:00Z').toISOString(),
    timezones: [
      { city: 'Dubai', time: '6:00 PM', label: 'GST' },
      { city: 'New York', time: '9:00 AM', label: 'EST' },
      { city: 'London', time: '2:00 PM', label: 'GMT' },
    ],
    seatsTotal: 75,
    seatsBooked: 75, // Sold Out!
    price: 495,
    speakers: [
      {
        name: 'Ayub.',
        title: 'Founder, Due Diligence Lab',
        bio: 'Ex-KPMG & BDO Binder International. Advises on cross-border PE acquisitions.',
        photoUrl: '/ayub-founder-full.jpg',
      },
    ],
    learningOutcomes: [
      'Model multi-jurisdiction regulatory clearance and FDI scrutiny risks',
      'Compare SPA representation and warranty terms against precedent benchmarks',
      'Automate covenant simulation and cross-currency debt service analysis',
    ],
    requirements: [
      'Prior experience with corporate acquisitions and financial statements',
    ],
    agenda: [
      { time: '14:00 - 15:15', title: 'Jurisdictional Risk & Antitrust Screening', description: 'Agentic screening of cross-border merger filings and foreign investment thresholds.' },
      { time: '15:15 - 16:30', title: 'SPA Reps & Warranties Stress Testing', description: 'Automated contract diffing and liability cap benchmarking.' },
      { time: '16:30 - 18:00', title: 'Earn-Out & Currency Hedging Models', description: 'Simulating payout distributions across variable forex and interest scenarios.' },
    ],
    faqs: [
      { question: 'Is this cohort fully booked?', answer: 'Yes, this executive cohort has reached its 75-seat capacity. You can join the waitlist for priority access to the next session.' },
    ],
  };

  const existingSoldOut = await Workshop.findOne({ slug: 'cross-border-ma-due-diligence' });
  if (existingSoldOut) {
    await Workshop.findByIdAndUpdate(existingSoldOut._id, soldOutData);
    console.log('✅ Updated Cross-Border M&A (Sold Out)');
  } else {
    await Workshop.create(soldOutData);
    console.log('✅ Created Cross-Border M&A (Sold Out)');
  }

  // 5. Workshop 4: VC Portfolio Intelligence (Upcoming - Few Spots Left)
  const vcData = {
    slug: 'vc-portfolio-intelligence',
    title: 'VC Portfolio Intelligence with AI',
    shortDescription: 'Automate your portfolio monitoring, LP reporting, and follow-on analysis using a custom AI agent stack built live in this session.',
    bannerImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=675&fit=crop',
    category: 'Venture Capital',
    tags: ['AI', 'Portfolio Monitoring', 'VC', 'LP Reporting'],
    status: 'published',
    showOnHub: true,
    featured: false,
    displayOrder: 3,
    startDate: new Date('2026-12-10T15:00:00Z').toISOString(),
    endDate: new Date('2026-12-10T19:00:00Z').toISOString(),
    timezones: [
      { city: 'Dubai', time: '7:00 PM', label: 'GST' },
      { city: 'New York', time: '10:00 AM', label: 'EST' },
      { city: 'London', time: '3:00 PM', label: 'GMT' },
    ],
    seatsTotal: 100,
    seatsBooked: 88, // 12 seats left (<20% -> few-spots left badge)
    price: 0,
    speakers: [
      {
        name: 'Ayub.',
        title: 'Principal, Due Diligence Lab',
        bio: 'Ex-KPMG & BDO Binder International. Specializes in venture metrics and LP communications.',
        photoUrl: '/ayub-founder-full.jpg',
      },
    ],
  };

  const existingVC = await Workshop.findOne({ slug: 'vc-portfolio-intelligence' });
  if (existingVC) {
    await Workshop.findByIdAndUpdate(existingVC._id, vcData);
    console.log('✅ Updated VC Portfolio Intelligence (Few Spots Left)');
  } else {
    await Workshop.create(vcData);
    console.log('✅ Created VC Portfolio Intelligence (Few Spots Left)');
  }

  // 6. Workshop 5: Family Office Deal Sourcing (Completed)
  const familyData = {
    slug: 'family-office-deal-sourcing',
    title: 'Family Office Deal Sourcing Masterclass',
    shortDescription: 'Learn how leading family offices are using AI to source proprietary deal flow and evaluate opportunities 10x faster than traditional methods.',
    bannerImage: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=1200&h=675&fit=crop',
    category: 'Family Office',
    tags: ['AI', 'Deal Sourcing', 'Family Office', 'Investment'],
    status: 'published',
    showOnHub: true,
    featured: false,
    displayOrder: 4,
    startDate: new Date('2026-09-15T15:00:00Z').toISOString(),
    endDate: new Date('2026-09-15T19:00:00Z').toISOString(),
    timezones: [
      { city: 'Dubai', time: '7:00 PM', label: 'GST' },
      { city: 'New York', time: '11:00 AM', label: 'EDT' },
      { city: 'London', time: '4:00 PM', label: 'BST' },
    ],
    seatsTotal: 80,
    seatsBooked: 80,
    price: 0,
  };

  const existingFamily = await Workshop.findOne({ slug: 'family-office-deal-sourcing' });
  if (existingFamily) {
    await Workshop.findByIdAndUpdate(existingFamily._id, familyData);
    console.log('✅ Updated Family Office Deal Sourcing (Completed)');
  } else {
    await Workshop.create(familyData);
    console.log('✅ Created Family Office Deal Sourcing (Completed)');
  }

  // 7. Workshop 6: AI Valuation & LBO Modeling (Completed)
  const lboData = {
    slug: 'ai-valuation-lbo-modeling',
    title: 'AI Valuation & LBO Modeling Master Class',
    shortDescription: 'Construct dynamic buyout models, debt amortization schedules, and sensitivity tables with audited AI pipelines.',
    bannerImage: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&h=675&fit=crop',
    category: 'Private Equity',
    tags: ['Valuation', 'LBO', 'Financial Modeling', 'Private Equity'],
    status: 'published',
    showOnHub: true,
    featured: false,
    displayOrder: 5,
    startDate: new Date('2026-08-20T15:00:00Z').toISOString(),
    endDate: new Date('2026-08-20T19:00:00Z').toISOString(),
    timezones: [
      { city: 'Dubai', time: '7:00 PM', label: 'GST' },
      { city: 'New York', time: '11:00 AM', label: 'EDT' },
      { city: 'London', time: '4:00 PM', label: 'BST' },
    ],
    seatsTotal: 90,
    seatsBooked: 85,
    price: 0,
    recordingUrl: 'https://vimeo.com/76979871',
    speakers: [
      {
        name: 'Ayub.',
        title: 'Founder & Principal, Due Diligence Lab',
        bio: 'Ex-KPMG & BDO Binder International. Built automated LBO sensitivity analysis engines.',
        photoUrl: '/ayub-founder-full.jpg',
      },
    ],
  };

  const existingLBO = await Workshop.findOne({ slug: 'ai-valuation-lbo-modeling' });
  if (existingLBO) {
    await Workshop.findByIdAndUpdate(existingLBO._id, lboData);
    console.log('✅ Updated AI Valuation & LBO Modeling (Completed)');
  } else {
    await Workshop.create(lboData);
    console.log('✅ Created AI Valuation & LBO Modeling (Completed)');
  }

  console.log('\n🎉 Extended seeding completed successfully!');
  console.log('Status Breakdown:');
  console.log('  - Upcoming: PE Deal Flow Automation (150 seats, 48 booked)');
  console.log('  - Live Now: Live Deal Sourcing War Room (120 seats, 104 booked)');
  console.log('  - Sold Out: Cross-Border M&A (75 seats, 75 booked)');
  console.log('  - Few Spots: VC Portfolio Intelligence (100 seats, 88 booked)');
  console.log('  - Completed: Family Office Deal Sourcing (Sep 2026)');
  console.log('  - Completed: AI Valuation & LBO Modeling (Aug 2026)');
  console.log('  - Draft (Hidden): Bhavya Sample, sm-s');

  process.exit(0);
}

seedExtended().catch((err) => {
  console.error('❌ Extended seed failed:', err);
  process.exit(1);
});
