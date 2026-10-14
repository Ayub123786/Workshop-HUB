import cron from 'node-cron';
import Workshop from '../models/Workshop.js';
import Submission from '../models/Submission.js';
import { sendReminderEmail } from '../utils/email.js';

let isRunning = false;

export async function checkAndSendReminders() {
  if (isRunning) return;
  isRunning = true;

  try {
    const now = new Date();
    const workshops = await Workshop.find({ status: 'published' });

    for (const w of workshops) {
      if (!w.startDate) continue;
      const startTime = new Date(w.startDate).getTime();
      const diffMs = startTime - now.getTime();
      const hoursUntilStart = diffMs / (1000 * 60 * 60);

      // Past workshops or workshops further than 24.5 hours out
      if (hoursUntilStart <= 0 || hoursUntilStart > 24.5) continue;

      // 24h reminder check
      if (hoursUntilStart <= 24 && hoursUntilStart > 1.2 && !w.reminder24hSent) {
        console.log(`[ReminderScheduler] Triggering 24h reminder for: "${w.title}" (in ${hoursUntilStart.toFixed(1)}h)`);
        const subs = await Submission.find({ workshopId: w.id });
        const confirmedSubs = subs.filter((s) => !s.data?.isWaitlist);

        for (const s of confirmedSubs) {
          if (s.email) {
            await sendReminderEmail({
              email: s.email,
              name: s.data?.name,
              workshop: w,
              type: '24h',
            }).catch((err) => console.error(`[ReminderScheduler] Error sending 24h reminder to ${s.email}:`, err.message));
          }
        }

        await Workshop.findByIdAndUpdate(w.id, { reminder24hSent: true });
        console.log(`[ReminderScheduler] 24h reminders dispatched to ${confirmedSubs.length} registrants for "${w.title}"`);
      }

      // 1h reminder check
      if (hoursUntilStart <= 1.2 && hoursUntilStart > 0 && !w.reminder1hSent) {
        console.log(`[ReminderScheduler] Triggering 1h reminder for: "${w.title}" (in ${hoursUntilStart.toFixed(1)}h)`);
        const subs = await Submission.find({ workshopId: w.id });
        const confirmedSubs = subs.filter((s) => !s.data?.isWaitlist);

        for (const s of confirmedSubs) {
          if (s.email) {
            await sendReminderEmail({
              email: s.email,
              name: s.data?.name,
              workshop: w,
              type: '1h',
            }).catch((err) => console.error(`[ReminderScheduler] Error sending 1h reminder to ${s.email}:`, err.message));
          }
        }

        await Workshop.findByIdAndUpdate(w.id, { reminder1hSent: true });
        console.log(`[ReminderScheduler] 1h reminders dispatched to ${confirmedSubs.length} registrants for "${w.title}"`);
      }
    }
  } catch (err) {
    console.error('[ReminderScheduler] Error in checkAndSendReminders:', err);
  } finally {
    isRunning = false;
  }
}

export function startReminderScheduler() {
  console.log('⏰ Reminder Scheduler initialized (running every 10 minutes)');
  // Run once on server startup to catch any pending reminders
  setTimeout(() => {
    checkAndSendReminders().catch(console.error);
  }, 5000);

  // Recurring schedule every 10 minutes
  return cron.schedule('*/10 * * * *', () => {
    checkAndSendReminders().catch(console.error);
  });
}
