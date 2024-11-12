import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { Resend } from 'resend';

admin.initializeApp();
const resend = new Resend(functions.config().resend.key);

export const sendVerificationEmail = functions.auth.user().onCreate(async (user) => {
  const verificationToken = await admin.auth().createCustomToken(user.uid);
  const verificationLink = `https://trailkitchen.io/verify-email?token=${verificationToken}`;

  try {
    await resend.emails.send({
      from: 'Trail Kitchen <noreply@trailkitchen.io>',
      to: user.email,
      subject: 'Verify your Trail Kitchen email address',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <title>Verify your Trail Kitchen email</title>
          </head>
          <body style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.5; color: #1f2937; margin: 0; padding: 0;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="text-align: center; margin-bottom: 32px;">
                <svg viewBox="0 0 24 24" width="48" height="48" stroke="currentColor" stroke-width="1.5" fill="none" style="color: #059669; margin: 0 auto;">
                  <path d="M20 7L12 3L4 7M20 7L12 11M20 7V17L12 21M12 11L4 7M12 11V21M4 7V17L12 21" />
                </svg>
                <h1 style="color: #059669; font-size: 24px; margin-top: 16px;">Trail Kitchen</h1>
              </div>
              
              <div style="background-color: white; border-radius: 8px; padding: 32px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);">
                <h2 style="margin: 0 0 16px; color: #111827; font-size: 20px;">Verify your email address</h2>
                
                <p style="margin: 0 0 24px; color: #4b5563;">
                  Hi ${user.displayName || 'there'},<br><br>
                  Thanks for signing up for Trail Kitchen! Please verify your email address by clicking the button below:
                </p>
                
                <div style="text-align: center; margin: 32px 0;">
                  <a href="${verificationLink}" 
                     style="display: inline-block; background-color: #059669; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 500;">
                    Verify Email Address
                  </a>
                </div>
                
                <p style="margin: 24px 0 0; color: #6b7280; font-size: 14px;">
                  If you didn't create an account with Trail Kitchen, you can safely ignore this email.
                </p>
              </div>
              
              <div style="text-align: center; margin-top: 32px; color: #6b7280; font-size: 14px;">
                <p style="margin: 0;">
                  Trail Kitchen - Plan your hiking meals with confidence<br>
                  <a href="https://trailkitchen.io" style="color: #059669; text-decoration: none;">www.trailkitchen.io</a>
                </p>
              </div>
            </div>
          </body>
        </html>
      `,
    });
    
    console.log('Verification email sent successfully');
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw new functions.https.HttpsError('internal', 'Error sending verification email');
  }
});