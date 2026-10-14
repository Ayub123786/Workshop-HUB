import nodemailer from 'nodemailer';

let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('[Email] No email credentials configured. Emails will be logged to console.');
    return null;
  }
  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  return transporter;
};

/**
 * Send confirmation email to registrant and notification to admin
 */
export const sendConfirmationEmail = async ({ email, name, workshop, form, isWaitlist = false }) => {
  const trans = getTransporter();
  const workshopTitle = workshop?.title || 'Workshop';
  const startDate = workshop?.startDate
    ? new Date(workshop.startDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    : 'TBA';

  const headingText = isWaitlist ? "You're on the Waitlist" : "You're Registered!";
  const introText = isWaitlist
    ? `You have been added to the priority waitlist for <strong>${workshopTitle}</strong>. If a seat opens up or a new cohort is announced, you will be notified immediately.`
    : `Your executive seat for <strong>${workshopTitle}</strong> has been confirmed.`;

  const confirmHtml = `
    <div style="font-family: Inter, Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #0A0A0A; background: #FFFFFF; border: 1px solid #E8E8E8; border-radius: 12px; overflow: hidden;">
      <div style="background: #C8A24F; padding: 28px 32px; text-align: center;">
        <h1 style="color: #FFFFFF; margin: 0; font-size: 22px; font-weight: 700; letter-spacing: -0.02em;">${headingText}</h1>
      </div>
      <div style="padding: 32px;">
        <p style="font-size: 15px; margin-top: 0;">Hi <strong>${name || 'there'}</strong>,</p>
        <p style="font-size: 14px; color: #374151; line-height: 1.6;">${introText}</p>
        
        <div style="background: #FAFAFA; border: 1px solid #E8E8E8; border-radius: 8px; padding: 20px; margin: 24px 0;">
          <p style="margin: 0 0 6px; color: #C8A24F; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em;">MASTERCLASS DETAILS</p>
          <p style="margin: 0; font-size: 17px; font-weight: 700; color: #0A0A0A;">${workshopTitle}</p>
          <p style="margin: 6px 0 0; color: #6B7280; font-size: 13px;">${startDate}</p>
        </div>

        <p style="color: #6B7280; font-size: 13px; line-height: 1.5;">${form?.successMessage || 'We look forward to hosting you for this master session.'}</p>
        
        <div style="margin-top: 28px; padding-top: 20px; border-top: 1px solid #E8E8E8; display: flex; justify-content: space-between; align-items: center;">
          <p style="color: #9CA3AF; font-size: 12px; margin: 0;">
            Workshop Hub · Institutional Due Diligence Masterclasses
          </p>
        </div>
      </div>
    </div>
  `;

  if (!trans) {
    console.log('[Email] Would send confirmation to:', email, isWaitlist ? '(Waitlist)' : '(Confirmed)');
    console.log('[Email] Subject:', isWaitlist ? `Waitlist Confirmation – ${workshopTitle}` : `Your spot is confirmed – ${workshopTitle}`);
    return;
  }

  // Send to registrant
  await trans.sendMail({
    from: process.env.EMAIL_FROM || 'Workshop Hub <noreply@workshophub.com>',
    to: email,
    subject: isWaitlist ? `Waitlist Confirmation – ${workshopTitle}` : `Your spot is confirmed – ${workshopTitle}`,
    html: confirmHtml,
  });

  // Notify admin
  if (process.env.ADMIN_EMAIL) {
    await trans.sendMail({
      from: process.env.EMAIL_FROM || 'Workshop Hub <noreply@workshophub.com>',
      to: process.env.ADMIN_EMAIL,
      subject: `${isWaitlist ? 'New Waitlist' : 'New registration'}: ${name || email} – ${workshopTitle}`,
      html: `<p>New ${isWaitlist ? 'waitlist request' : 'registration'} from <strong>${name || 'Unknown'}</strong> (${email}) for <strong>${workshopTitle}</strong>.</p>`,
    });
  }
};

/**
 * Send automated reminder email (24h or 1h before start)
 */
export const sendReminderEmail = async ({ email, name, workshop, type = '24h' }) => {
  const trans = getTransporter();
  const workshopTitle = workshop?.title || 'Workshop';
  const startDate = workshop?.startDate
    ? new Date(workshop.startDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    : 'Upcoming';

  const timeNotice = type === '1h' ? 'Starts in 1 Hour' : 'Starting Tomorrow (24 Hours)';
  const subject = type === '1h'
    ? `Starting in 1 hour: ${workshopTitle}`
    : `Reminder: ${workshopTitle} starts tomorrow`;

  const reminderHtml = `
    <div style="font-family: Inter, Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #0A0A0A; background: #FFFFFF; border: 1px solid #E8E8E8; border-radius: 12px; overflow: hidden;">
      <div style="background: #0A0A0A; padding: 24px 32px; text-align: left; border-bottom: 2px solid #C8A24F;">
        <span style="color: #C8A24F; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em;">EXECUTIVE SESSION REMINDER</span>
        <h1 style="color: #FFFFFF; margin: 8px 0 0; font-size: 20px; font-weight: 700;">${timeNotice}</h1>
      </div>
      <div style="padding: 32px;">
        <p style="font-size: 15px; margin-top: 0;">Hi <strong>${name || 'there'}</strong>,</p>
        <p style="font-size: 14px; color: #374151; line-height: 1.6;">
          This is a reminder that your live session for <strong>${workshopTitle}</strong> is starting soon.
        </p>

        <div style="background: #FAFAFA; border: 1px solid #E8E8E8; border-radius: 8px; padding: 20px; margin: 24px 0;">
          <p style="margin: 0; font-size: 16px; font-weight: 700; color: #0A0A0A;">${workshopTitle}</p>
          <p style="margin: 6px 0 0; color: #6B7280; font-size: 13px;">${startDate}</p>
          ${workshop?.recordingUrl ? `<p style="margin: 12px 0 0;"><a href="${workshop.recordingUrl}" style="color: #C8A24F; font-weight: 600; font-size: 13px;">Join Live Room →</a></p>` : ''}
        </div>

        <p style="color: #6B7280; font-size: 13px; line-height: 1.5;">
          Please join a few minutes early to verify your audio and video connection.
        </p>

        <div style="margin-top: 28px; padding-top: 20px; border-top: 1px solid #E8E8E8;">
          <p style="color: #9CA3AF; font-size: 12px; margin: 0;">
            Workshop Hub · <a href="${process.env.CLIENT_URL}" style="color: #C8A24F;">workshophub.com</a>
          </p>
        </div>
      </div>
    </div>
  `;

  if (!trans) {
    console.log(`[Email] Would send ${type} reminder to:`, email, 'for', workshopTitle);
    return;
  }

  await trans.sendMail({
    from: process.env.EMAIL_FROM || 'Workshop Hub <noreply@workshophub.com>',
    to: email,
    subject,
    html: reminderHtml,
  });
};

/**
 * Broadcast custom email to multiple registrants
 */
export const sendBroadcastEmail = async ({ emails = [], subject, message, workshopTitle }) => {
  const trans = getTransporter();
  const html = `
    <div style="font-family: Inter, Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #0A0A0A; background: #FFFFFF; border: 1px solid #E8E8E8; border-radius: 12px; padding: 32px;">
      <div style="border-bottom: 2px solid #C8A24F; padding-bottom: 16px; margin-bottom: 24px;">
        <p style="color: #C8A24F; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; margin: 0 0 4px;">UPDATE FROM WORKSHOP HUB</p>
        <h2 style="margin: 0; font-size: 18px; color: #0A0A0A;">${workshopTitle ? `${workshopTitle}` : 'Executive Update'}</h2>
      </div>
      <div style="font-size: 14px; line-height: 1.7; color: #374151;">
        ${message.replace(/\n/g, '<br/>')}
      </div>
      <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #E8E8E8; color: #9CA3AF; font-size: 12px;">
        Workshop Hub · <a href="${process.env.CLIENT_URL}" style="color: #C8A24F;">workshophub.com</a>
      </div>
    </div>
  `;

  if (!trans) {
    console.log(`[Email] Would broadcast to ${emails.length} recipients: ${subject}`);
    return { sent: emails.length };
  }

  let sentCount = 0;
  for (const to of emails) {
    try {
      await trans.sendMail({
        from: process.env.EMAIL_FROM || 'Workshop Hub <noreply@workshophub.com>',
        to,
        subject,
        html,
      });
      sentCount++;
    } catch (err) {
      console.error(`[Email] Failed broadcast to ${to}:`, err.message);
    }
  }
  return { sent: sentCount };
};
