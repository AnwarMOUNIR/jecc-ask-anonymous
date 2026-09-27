import nodemailer from 'nodemailer';

const host = process.env.SMTP__HOST || 'smtp.gmail.com';
const port = parseInt(process.env.SMTP__PORT || '587', 10);
const user = process.env.GMAIL_SENDER_EMAIL || 'anwaremounire@gmail.com';
const pass = (process.env.GMAIL_APP_PASSWORD || 'kahp grgh jmhy ukue').replace(/\s+/g, '');
const replyTo = process.env.SMTP__REPLY_TO || user;

const transporter = nodemailer.createTransport({
  host,
  port,
  secure: port === 465,
  auth: {
    user,
    pass,
  },
});

export async function sendAnswerNotificationEmail({
  recipientEmail,
  recipientName,
  questionText,
  answerText,
  answeredBy,
}: {
  recipientEmail: string;
  recipientName?: string;
  questionText: string;
  answerText: string;
  answeredBy: string;
}) {
  if (!recipientEmail || !recipientEmail.includes('@')) {
    console.warn('Invalid or missing recipient email for notification:', recipientEmail);
    return { success: false, reason: 'Invalid email' };
  }

  const displayName = recipientName?.trim() ? recipientName.trim() : 'JECC Community Member';

  const htmlContent = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #0f172a; color: #f8fafc; border-radius: 16px; border: 1px solid #1e293b;">
      <div style="text-align: center; margin-bottom: 24px;">
        <div style="display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; width: 44px; height: 44px; line-height: 44px; border-radius: 12px; font-weight: bold; font-size: 20px; text-align: center;">J</div>
        <h2 style="color: #ffffff; margin-top: 12px; font-size: 22px; font-weight: bold;">JECC Question Portal</h2>
        <p style="color: #94a3b8; font-size: 13px; margin: 0;">Junior Entreprise Centrale Casablanca</p>
      </div>

      <div style="background-color: #1e293b; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
        <p style="margin-top: 0; color: #cbd5e1; font-size: 14px;">Hello <strong>${displayName}</strong>,</p>
        <p style="color: #e2e8f0; font-size: 14px; line-height: 1.5;">Your question has just been answered by <strong>${answeredBy}</strong>!</p>
        
        <div style="margin: 16px 0; padding: 14px; background-color: #0f172a; border-left: 4px solid #6366f1; border-radius: 6px;">
          <p style="font-size: 11px; text-transform: uppercase; color: #818cf8; font-weight: 600; margin: 0 0 6px 0;">Your Question:</p>
          <p style="margin: 0; font-size: 14px; color: #f1f5f9; font-style: italic;">"${questionText}"</p>
        </div>

        <div style="margin: 16px 0; padding: 14px; background-color: #0f172a; border-left: 4px solid #10b981; border-radius: 6px;">
          <p style="font-size: 11px; text-transform: uppercase; color: #34d399; font-weight: 600; margin: 0 0 6px 0;">Official Answer from ${answeredBy}:</p>
          <p style="margin: 0; font-size: 14px; color: #f1f5f9; white-space: pre-line; line-height: 1.6;">${answerText}</p>
        </div>
      </div>

      <div style="text-align: center; border-top: 1px solid #1e293b; padding-top: 16px;">
        <p style="color: #64748b; font-size: 12px; margin: 0;">
          This email was automatically sent by the JECC Q&A notification service.
        </p>
      </div>
    </div>
  `;

  try {
    const info = await transporter.sendMail({
      from: `"JECC Portal" <${user}>`,
      to: recipientEmail,
      replyTo,
      subject: `[JECC Response] Your question has been answered!`,
      text: `Hello ${displayName},\n\nYour question: "${questionText}"\n\nOfficial Answer from ${answeredBy}:\n${answerText}\n\nJunior Entreprise Centrale Casablanca`,
      html: htmlContent,
    });

    console.log('Answer notification email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Failed to dispatch notification email via Gmail SMTP:', error);
    return { success: false, error };
  }
}
