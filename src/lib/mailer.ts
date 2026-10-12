import nodemailer from 'nodemailer';
import { LaundryIssue } from '@/types';

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

export async function sendIssueStatusUpdateEmail({
  issue,
  adminNotes,
  responderName,
}: {
  issue: LaundryIssue;
  adminNotes?: string | null;
  responderName?: string | null;
}) {
  if (!issue.author_email || !issue.author_email.includes('@')) {
    console.warn('Invalid or missing recipient email for notification:', issue.author_email);
    return { success: false, reason: 'Invalid email' };
  }

  const displayName = issue.author_name?.trim() ? issue.author_name.trim() : 'Étudiant(e) Centrale Casablanca';
  const responder = responderName?.trim() ? responderName.trim() : 'Pôle Technique Centrale Tech';

  const statusLabels: Record<string, { label: string; color: string; bg: string }> = {
    open: { label: 'Signalement Reçu & Ouvert', color: '#009881', bg: '#e6f7f4' },
    investigating: { label: 'En Cours d\'Investigation', color: '#c28b49', bg: '#fef7ea' },
    resolved: { label: 'Résolu & Traité', color: '#126a38', bg: '#eaf4ee' },
    closed: { label: 'Clôturé', color: '#4c5362', bg: '#f1f2f4' },
  };

  const statusInfo = statusLabels[issue.status] || { label: issue.status, color: '#009881', bg: '#e6f7f4' };

  const machineDetails = issue.machine_info?.machineNumber
    ? `${issue.machine_info.machineNumber} (${issue.machine_info.room || 'Lavoir ECC'})`
    : issue.machine_info?.room || 'Non spécifié';

  const platformSummary = `${issue.platform.device || 'Appareil'} • ${issue.platform.browser || 'Navigateur'}${
    issue.platform.osVersion ? ` (${issue.platform.osVersion})` : ''
  }`;

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="utf-8">
      <title>Centrale Tech — laundry.fecc.ma</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f4f6f8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #272727;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f6f8; padding: 24px 12px;">
        <tr>
          <td align="center">
            <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 620px; background-color: #ffffff; border-radius: 14px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #e1e7ec;">
              
              <!-- Header Centrale Tech -->
              <tr>
                <td style="background: linear-gradient(135deg, #0c3d40 0%, #073f49 100%); padding: 28px 24px; text-align: center; border-bottom: 3px solid #009881;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td align="center">
                        <div style="display: inline-block; background-color: #009881; color: #ffffff; width: 44px; height: 44px; line-height: 44px; border-radius: 10px; font-weight: 800; font-size: 20px; text-align: center; margin-bottom: 10px;">
                          CT
                        </div>
                        <h1 style="color: #ffffff; font-size: 20px; font-weight: 800; margin: 0; letter-spacing: 0.5px; text-transform: uppercase;">
                          CENTRALE TECH
                        </h1>
                        <p style="color: #abd1f9; font-size: 12px; margin: 4px 0 0 0; letter-spacing: 0.3px;">
                          École Centrale Casablanca • Pôle Support laundry.fecc.ma
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Status Notification Banner -->
              <tr>
                <td style="padding: 24px 28px 12px 28px;">
                  <div style="display: inline-block; background-color: ${statusInfo.bg}; color: ${statusInfo.color}; border: 1px solid ${statusInfo.color}; font-size: 12px; font-weight: 700; text-transform: uppercase; padding: 6px 14px; border-radius: 20px; margin-bottom: 16px;">
                    Statut : ${statusInfo.label}
                  </div>
                  <h2 style="font-size: 18px; color: #0c3d40; margin: 0 0 8px 0; font-weight: 700;">
                    Bonjour ${displayName},
                  </h2>
                  <p style="font-size: 14px; line-height: 1.6; color: #4c5362; margin: 0;">
                    Votre signalement concernant le service de la laverie <strong>laundry.fecc.ma</strong> a été mis à jour par l'équipe technique Centrale Tech.
                  </p>
                </td>
              </tr>

              <!-- Issue Card Details -->
              <tr>
                <td style="padding: 12px 28px;">
                  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 18px;">
                    <div style="border-bottom: 1px solid #e2e8f0; padding-bottom: 10px; margin-bottom: 12px;">
                      <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #009881; letter-spacing: 0.5px;">Titre de l'incident</span>
                      <h3 style="font-size: 15px; color: #0c3d40; margin: 4px 0 0 0; font-weight: 600;">
                        ${issue.title}
                      </h3>
                    </div>

                    <table width="100%" cellpadding="0" cellspacing="0" style="font-size: 13px; color: #4c5362; line-height: 1.8;">
                      <tr>
                        <td width="35%" style="font-weight: 600;">Catégorie :</td>
                        <td>${issue.category}</td>
                      </tr>
                      <tr>
                        <td style="font-weight: 600;">Machine / Salle :</td>
                        <td>${machineDetails}</td>
                      </tr>
                      <tr>
                        <td style="font-weight: 600;">Environnement :</td>
                        <td>${platformSummary}</td>
                      </tr>
                    </table>

                    <div style="margin-top: 12px; padding-top: 10px; border-top: 1px dashed #cbd5e1; font-size: 13px; color: #334155;">
                      <strong>Description initiale :</strong>
                      <p style="margin: 4px 0 0 0; font-style: italic; color: #475569;">"${issue.description}"</p>
                    </div>
                  </div>
                </td>
              </tr>

              <!-- Resolution / Notes Section -->
              ${
                adminNotes
                  ? `
              <tr>
                <td style="padding: 12px 28px 24px 28px;">
                  <div style="background-color: #e6f7f4; border-left: 4px solid #009881; border-radius: 8px; padding: 16px 20px;">
                    <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #126a38; letter-spacing: 0.5px; margin-bottom: 6px;">
                      Réponse & Intervention de l'équipe :
                    </div>
                    <p style="font-size: 14px; line-height: 1.6; color: #0c3d40; margin: 0; font-weight: 500; white-space: pre-line;">
                      ${adminNotes}
                    </p>
                    <div style="font-size: 11px; color: #048471; margin-top: 8px; font-weight: 600;">
                      — ${responder}
                    </div>
                  </div>
                </td>
              </tr>
              `
                  : ''
              }

              <!-- Direct Link to Portal -->
              <tr>
                <td style="padding: 0 28px 28px 28px; text-align: center;">
                  <a href="https://laundry.fecc.ma" target="_blank" style="display: inline-block; background-color: #009881; color: #ffffff; text-decoration: none; font-size: 13px; font-weight: 700; padding: 12px 24px; border-radius: 8px; text-transform: uppercase; letter-spacing: 0.5px;">
                    Accéder à laundry.fecc.ma
                  </a>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background-color: #f1f5f9; padding: 18px 24px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 11px; color: #64748b; line-height: 1.5;">
                  <p style="margin: 0;">
                    Ce message a été envoyé automatiquement par le portail de suivi <strong>Centrale Tech</strong>.
                  </p>
                  <p style="margin: 4px 0 0 0;">
                    Club Centrale Tech • École Centrale Casablanca, Ville Verte Côté Bouskoura.
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  try {
    const info = await transporter.sendMail({
      from: `"Centrale Tech (laundry.fecc.ma Support)" <${user}>`,
      to: issue.author_email,
      replyTo,
      subject: `[Centrale Tech] Mise à jour de votre signalement laundry.fecc.ma : ${issue.title}`,
      text: `Bonjour ${displayName},\n\nVotre signalement concernant laundry.fecc.ma a été mis à jour.\nStatut: ${statusInfo.label}\n\nTitre: ${issue.title}\nMachine: ${machineDetails}\n\nRéponse de l'équipe:\n${adminNotes || 'En cours de traitement'}\n\n— ${responder}\nCentrale Tech • École Centrale Casablanca`,
      html: htmlContent,
    });

    console.log('Issue notification email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Failed to dispatch issue notification email via Gmail SMTP:', error);
    return { success: false, error };
  }
}

// Backward compatibility alias for any existing question routes
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
  const dummyIssue: LaundryIssue = {
    id: 'legacy',
    title: questionText.substring(0, 60),
    description: questionText,
    category: 'Other',
    severity: 'medium',
    platform: { device: 'Other', browser: 'Other' },
    author_name: recipientName,
    author_email: recipientEmail,
    status: 'resolved',
    admin_notes: answerText,
    resolved_by: answeredBy,
    created_at: new Date().toISOString(),
  };

  return sendIssueStatusUpdateEmail({
    issue: dummyIssue,
    adminNotes: answerText,
    responderName: answeredBy,
  });
}
