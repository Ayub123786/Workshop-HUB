import 'dotenv/config';
import Workshop from '../models/Workshop.js';
import Section from '../models/Section.js';

const defaultAyub = {
  label: 'YOUR TRAINER',
  name: 'Ayub.',
  portrait: '/ayub-founder-full.png',
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
};

async function updateAll() {
  try {
    const workshops = await Workshop.find({});
    console.log(`Found ${workshops.length} workshops.`);

    for (const w of workshops) {
      const sections = await Section.find({ workshopId: w._id });
      const trainerSec = sections.find((s) => s.type === 'trainer');
      if (trainerSec) {
        await Section.findByIdAndUpdate(trainerSec._id, {
          content: defaultAyub,
          visible: true,
        });
        console.log(`✅ Updated trainer section for: "${w.title}" (${w._id})`);
      } else {
        await Section.create({
          workshopId: w._id,
          type: 'trainer',
          order: sections.length,
          visible: true,
          content: defaultAyub,
          animation: { entrance: 'slide-right', speed: 'normal' },
        });
        console.log(`✅ Created trainer section for: "${w.title}" (${w._id})`);
      }
    }

    console.log('🎉 Successfully updated all workshop templates with Ayub trainer section!');
    process.exit(0);
  } catch (err) {
    console.error('Error updating trainer sections:', err);
    process.exit(1);
  }
}

updateAll();
