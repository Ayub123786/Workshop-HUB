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
export const sendConfirmationEmail = async ({ email, name, workshop, form }) => {
  const trans = getTransporter();
  const workshopTitle = workshop?.title || 'Workshop';
  const startDate = workshop?.startDate
    ? new Date(workshop.startDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    : 'TBA';

  const confirmHtml = `
    <div style="font-family: Inter, Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #0A0A0A;">
      <div style="background: #C8A24F; padding: 32px; text-align: center; border-radius: 12px 12px 0 0;">
        <h1 style="color: #fff; margin: 0; font-size: 24px;">You're Registered! 🎉</h1>
      </div>
      <div style="background: #FAFAFA; padding: 32px; border-radius: 0 0 12px 12px; border: 1px solid #E8E8E8;">
        <p>Hi <strong>${name || 'there'}</strong>,</p>
        <p>Your spot for <strong>${workshopTitle}</strong> has been confirmed.</p>
        <div style="background: #fff; border: 1px solid #E8E8E8; border-radius: 8px; padding: 16px; margin: 24px 0;">
          <p style="margin: 0 0 8px; color: #6B7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em;">WORKSHOP DETAILS</p>
          <p style="margin: 0; font-size: 18px; font-weight: 600;">${workshopTitle}</p>
          <p style="margin: 4px 0 0; color: #6B7280;">${startDate}</p>
        </div>
        <p style="color: #6B7280; font-size: 14px;">${form?.successMessage || 'We look forward to seeing you!'}</p>
        <p style="color: #6B7280; font-size: 12px; margin-top: 32px; border-top: 1px solid #E8E8E8; padding-top: 16px;">
          Workshop Hub · <a href="${process.env.CLIENT_URL}" style="color: #C8A24F;">workshophub.com</a>
        </p>
      </div>
    </div>
  `;

  if (!trans) {
    console.log('[Email] Would send confirmation to:', email);
    console.log('[Email] Subject: Your spot is confirmed -', workshopTitle);
    return;
  }

  // Send to registrant
  await trans.sendMail({
    from: process.env.EMAIL_FROM || 'Workshop Hub <noreply@workshophub.com>',
    to: email,
    subject: `Your spot is confirmed – ${workshopTitle}`,
    html: confirmHtml,
  });

  // Notify admin
  if (process.env.ADMIN_EMAIL) {
    await trans.sendMail({
      from: process.env.EMAIL_FROM,
      to: process.env.ADMIN_EMAIL,
      subject: `New registration: ${name || email} – ${workshopTitle}`,
      html: `<p>New registration from <strong>${name || 'Unknown'}</strong> (${email}) for <strong>${workshopTitle}</strong>.</p>`,
    });
  }
};
