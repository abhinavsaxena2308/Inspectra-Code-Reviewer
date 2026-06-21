import nodemailer from 'nodemailer';
import { config } from '../config';

// Initialize Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: config.emailUser,
    pass: config.emailPass,
  },
});

export const sendAnalysisCompletionEmail = async (toEmail: string, repoName: string, score: number) => {
  if (!config.emailUser || !config.emailPass) {
    console.warn('[EmailService] EMAIL_USER or EMAIL_PASS is not set. Skipping email notification.');
    return;
  }

  const scoreColor = score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444';

  try {
    const info = await transporter.sendMail({
      from: `"Inspectra Notifications" <${config.emailUser}>`,
      to: toEmail,
      subject: `Scan Completed: ${repoName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
          </style>
        </head>
        <body style="margin: 0; padding: 0; background-color: #09090b; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';">
          <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #09090b; padding: 40px 0;">
            <tr>
              <td align="center">
                <table width="100%" max-width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #18181b; border: 1px solid #27272a; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
                  
                  <!-- Header -->
                  <tr>
                    <td align="center" style="padding: 40px 40px 20px 40px; border-bottom: 1px solid #27272a;">
                      <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">Inspectra<span style="color: #3b82f6;">.</span></h1>
                      <p style="color: #a1a1aa; margin: 10px 0 0 0; font-size: 14px;">Automated Code Intelligence</p>
                    </td>
                  </tr>

                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px;">
                      <h2 style="color: #ffffff; margin: 0 0 16px 0; font-size: 20px; font-weight: 600;">Analysis Completed</h2>
                      <p style="color: #d4d4d8; margin: 0 0 32px 0; font-size: 16px; line-height: 24px;">
                        The deep static analysis for your repository <strong style="color: #ffffff; background-color: #27272a; padding: 2px 6px; border-radius: 4px; font-weight: 600;">${repoName}</strong> has finished processing.
                      </p>

                      <!-- Score Card -->
                      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #09090b; border: 1px solid #27272a; border-radius: 8px; margin-bottom: 32px;">
                        <tr>
                          <td align="center" style="padding: 30px;">
                            <p style="margin: 0 0 8px 0; color: #a1a1aa; text-transform: uppercase; font-size: 12px; font-weight: 700; letter-spacing: 1.5px;">Integrity Score</p>
                            <h1 style="margin: 0; font-size: 64px; font-weight: 700; color: ${scoreColor}; letter-spacing: -2px;">
                              ${score}<span style="font-size: 24px; color: #52525b; font-weight: 600; letter-spacing: 0;">/100</span>
                            </h1>
                          </td>
                        </tr>
                      </table>

                      <p style="color: #d4d4d8; margin: 0 0 32px 0; font-size: 15px; line-height: 24px;">
                        Our AI engine has identified potential logic flaws, security vulnerabilities, and code quality improvements. You can view the full breakdown in your dashboard.
                      </p>

                      <!-- CTA Button -->
                      <table width="100%" border="0" cellspacing="0" cellpadding="0">
                        <tr>
                          <td align="center">
                            <a href="http://localhost:3000/repos" style="display: inline-block; background-color: #ffffff; color: #000000; padding: 14px 32px; font-size: 15px; font-weight: 600; text-decoration: none; border-radius: 6px; transition: background-color 0.2s;">
                              View Full Report
                            </a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="padding: 32px 40px; background-color: #09090b; border-top: 1px solid #27272a; text-align: center;">
                      <p style="color: #52525b; margin: 0; font-size: 13px; line-height: 20px;">
                        You are receiving this email because you have <strong>"Scan Completion"</strong> notifications enabled in your Inspectra Settings.<br>
                        <a href="http://localhost:3000/settings" style="color: #71717a; text-decoration: underline;">Manage Preferences</a>
                      </p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });

    console.log(`[EmailService] Sent completion email for ${repoName} to ${toEmail}. Message ID: ${info.messageId}`);
  } catch (error: any) {
    console.error(`[EmailService] Failed to send email to ${toEmail}:`, error);
  }
};
