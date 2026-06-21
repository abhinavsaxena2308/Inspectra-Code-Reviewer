import { Resend } from 'resend';
import { config } from '../config';

// Initialize Resend with the API Key
const resend = new Resend(config.resendApiKey);

export const sendAnalysisCompletionEmail = async (toEmail: string, repoName: string, score: number) => {
  if (!config.resendApiKey) {
    console.warn('[EmailService] RESEND_API_KEY is not set. Skipping email notification.');
    return;
  }

  const scoreColor = score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444';

  try {
    const { data, error } = await resend.emails.send({
      from: 'Inspectra Notifications <onboarding@resend.dev>',
      to: [toEmail],
      subject: `Scan Completed: ${repoName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
          <h2 style="color: #111827;">Inspectra Code Reviewer</h2>
          <p style="color: #4b5563; font-size: 16px;">
            The deep static analysis for your repository <strong>${repoName}</strong> has just completed successfully!
          </p>
          <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; text-align: center; margin: 30px 0;">
            <p style="margin: 0; color: #6b7280; text-transform: uppercase; font-size: 12px; font-weight: bold; letter-spacing: 1px;">Integrity Score</p>
            <h1 style="margin: 10px 0 0 0; font-size: 48px; color: ${scoreColor};">${score}<span style="font-size: 24px; color: #9ca3af;">/100</span></h1>
          </div>
          <p style="color: #4b5563; font-size: 14px;">
            You can view the full breakdown of detected issues, security vulnerabilities, and logic flaws in your Inspectra Dashboard.
          </p>
          <div style="text-align: center; margin-top: 30px;">
            <a href="http://localhost:3000/repos" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">View Analysis Results</a>
          </div>
          <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 40px 0 20px 0;" />
          <p style="color: #9ca3af; font-size: 12px; text-align: center;">
            You are receiving this email because you have "Scan Completion" notifications enabled in your Inspectra Settings.
          </p>
        </div>
      `,
    });

    if (error) {
      console.error(`[EmailService] Resend API Error for ${toEmail}:`, error);
      return;
    }

    console.log(`[EmailService] Sent completion email for ${repoName} to ${toEmail}. ID: ${data?.id}`);
  } catch (err: any) {
    console.error(`[EmailService] Failed to send email to ${toEmail}:`, err.message);
  }
};
