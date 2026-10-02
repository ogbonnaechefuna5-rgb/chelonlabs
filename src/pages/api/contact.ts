import type { APIRoute } from 'astro';
import { Resend } from 'resend';

const resend = new Resend(import.meta.env.RESEND_API_KEY);

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const formData = await request.formData();
    
    const name = formData.get('name')?.toString() || '';
    const email = formData.get('email')?.toString() || '';
    const company = formData.get('company')?.toString() || '';
    const engagement = formData.get('engagement')?.toString() || '';
    const message = formData.get('message')?.toString() || '';

    // Validate required fields
    if (!name || !email || !message) {
      return new Response(
        JSON.stringify({ error: 'Name, email, and message are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email address' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Format the engagement type for display
    const engagementLabels: Record<string, string> = {
      build: 'Build — New backend system or API',
      integrate: 'Integrate — Payment/third-party connections',
      fix: 'Fix — Performance, tech debt, modernization',
      scale: 'Scale — Infrastructure and DevOps',
      fractional: 'Fractional — Ongoing engineering capacity',
      other: 'Something else',
    };

    const engagementDisplay = engagement 
      ? engagementLabels[engagement] || engagement 
      : 'Not specified';

    // Send notification email to Chelon Labs
    const { data, error } = await resend.emails.send({
      from: 'Chelon Labs <contact@chelonlabs.com>',
      to: ['hello@chelonlabs.com'],
      replyTo: email,
      subject: `New Contact Form Submission from ${name}`,
      html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f4f4f5;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width: 600px; width: 100%;">
          
          <!-- Header -->
          <tr>
            <td style="padding-bottom: 24px;">
              <span style="font-size: 24px; font-weight: 700; color: #18181b;">Chelon</span>
              <span style="font-size: 24px; font-weight: 700; color: #6366f1;">Labs</span>
            </td>
          </tr>
          
          <!-- Main Card -->
          <tr>
            <td style="background-color: #ffffff; border: 1px solid #e4e4e7; border-radius: 12px; padding: 32px;">
              
              <!-- Title -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="padding-bottom: 24px; border-bottom: 1px solid #e4e4e7;">
                    <p style="margin: 0 0 8px 0; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; color: #6366f1;">New Inquiry</p>
                    <h1 style="margin: 0; font-size: 22px; font-weight: 700; color: #18181b;">Contact Form Submission</h1>
                  </td>
                </tr>
              </table>
              
              <!-- Contact Details -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top: 24px;">
                
                <!-- Name -->
                <tr>
                  <td style="padding: 14px 0; border-bottom: 1px solid #f4f4f5;">
                    <p style="margin: 0 0 4px 0; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #71717a;">Name</p>
                    <p style="margin: 0; font-size: 16px; color: #18181b; font-weight: 500;">${escapeHtml(name)}</p>
                  </td>
                </tr>
                
                <!-- Email -->
                <tr>
                  <td style="padding: 14px 0; border-bottom: 1px solid #f4f4f5;">
                    <p style="margin: 0 0 4px 0; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #71717a;">Email</p>
                    <p style="margin: 0; font-size: 16px;">
                      <a href="mailto:${escapeHtml(email)}" style="color: #6366f1; text-decoration: none; font-weight: 500;">${escapeHtml(email)}</a>
                    </p>
                  </td>
                </tr>
                
                <!-- Company -->
                <tr>
                  <td style="padding: 14px 0; border-bottom: 1px solid #f4f4f5;">
                    <p style="margin: 0 0 4px 0; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #71717a;">Company</p>
                    <p style="margin: 0; font-size: 16px; color: #18181b; font-weight: 500;">${escapeHtml(company) || '<span style="color: #a1a1aa;">Not provided</span>'}</p>
                  </td>
                </tr>
                
                <!-- Engagement Type -->
                <tr>
                  <td style="padding: 14px 0; border-bottom: 1px solid #f4f4f5;">
                    <p style="margin: 0 0 8px 0; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #71717a;">Engagement Type</p>
                    <p style="margin: 0;">
                      <span style="display: inline-block; padding: 8px 14px; background-color: #eef2ff; border-radius: 6px; font-size: 14px; font-weight: 600; color: #4f46e5;">${escapeHtml(engagementDisplay)}</span>
                    </p>
                  </td>
                </tr>
                
                <!-- Message -->
                <tr>
                  <td style="padding: 14px 0;">
                    <p style="margin: 0 0 12px 0; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #71717a;">Message</p>
                    <div style="padding: 16px; background-color: #fafafa; border-radius: 8px; border-left: 4px solid #6366f1;">
                      <p style="margin: 0; font-size: 15px; line-height: 1.7; color: #27272a; white-space: pre-wrap;">${escapeHtml(message)}</p>
                    </div>
                  </td>
                </tr>
                
              </table>
              
              <!-- Reply Button -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top: 24px;">
                <tr>
                  <td align="center">
                    <a href="mailto:${escapeHtml(email)}" style="display: inline-block; padding: 14px 32px; background-color: #6366f1; border-radius: 8px; font-size: 15px; font-weight: 600; color: #ffffff; text-decoration: none;">Reply to ${escapeHtml(name.split(' ')[0])}</a>
                  </td>
                </tr>
              </table>
              
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding-top: 24px; text-align: center;">
              <p style="margin: 0; font-size: 13px; color: #71717a;">Received from contact form at chelonlabs.com</p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `,
      text: `
NEW CONTACT FORM SUBMISSION
===========================

Name: ${name}
Email: ${email}
Company: ${company || 'Not provided'}
Engagement Type: ${engagementDisplay}

Message:
---------
${message}

---
Reply directly to this email to respond to ${name}.
      `.trim(),
    });

    if (error) {
      console.error('Resend error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to send message. Please try again.' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Send confirmation email to the sender
    const firstName = name.split(' ')[0];
    await resend.emails.send({
      from: 'Chelon Labs <contact@chelonlabs.com>',
      to: [email],
      subject: `We received your message, ${firstName}`,
      html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f4f4f5;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width: 600px; width: 100%;">
          
          <!-- Header -->
          <tr>
            <td style="padding-bottom: 24px;">
              <span style="font-size: 24px; font-weight: 700; color: #18181b;">Chelon</span>
              <span style="font-size: 24px; font-weight: 700; color: #6366f1;">Labs</span>
            </td>
          </tr>
          
          <!-- Main Card -->
          <tr>
            <td style="background-color: #ffffff; border: 1px solid #e4e4e7; border-radius: 12px; padding: 32px;">
              
              <h1 style="margin: 0 0 16px 0; font-size: 22px; font-weight: 700; color: #18181b;">Thanks for reaching out, ${escapeHtml(firstName)}!</h1>
              
              <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.6; color: #52525b;">
                We've received your message and will review it shortly. You can expect to hear back from us within 24 hours.
              </p>
              
              <div style="padding: 20px; background-color: #fafafa; border-radius: 8px; border-left: 4px solid #6366f1; margin-bottom: 24px;">
                <p style="margin: 0 0 8px 0; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; color: #6366f1;">Your message</p>
                <p style="margin: 0; font-size: 15px; line-height: 1.7; color: #27272a; white-space: pre-wrap;">${escapeHtml(message)}</p>
              </div>
              
              <p style="margin: 0 0 8px 0; font-size: 14px; color: #52525b;">
                <strong style="color: #18181b;">Engagement type:</strong> ${escapeHtml(engagementDisplay)}
              </p>
              
              ${company ? `<p style="margin: 0; font-size: 14px; color: #52525b;"><strong style="color: #18181b;">Company:</strong> ${escapeHtml(company)}</p>` : ''}
              
            </td>
          </tr>
          
          <!-- What's Next -->
          <tr>
            <td style="padding-top: 32px;">
              <h2 style="margin: 0 0 16px 0; font-size: 18px; font-weight: 600; color: #18181b;">What happens next?</h2>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="padding: 12px 0;">
                    <table role="presentation" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="width: 32px; vertical-align: top;">
                          <span style="display: inline-block; width: 24px; height: 24px; background-color: #eef2ff; border-radius: 50%; text-align: center; line-height: 24px; font-size: 12px; font-weight: 700; color: #4f46e5;">1</span>
                        </td>
                        <td style="padding-left: 12px;">
                          <p style="margin: 0; font-size: 15px; font-weight: 600; color: #18181b;">We review your requirements</p>
                          <p style="margin: 4px 0 0 0; font-size: 14px; color: #71717a;">Our team will analyze your message and prepare initial thoughts</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0;">
                    <table role="presentation" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="width: 32px; vertical-align: top;">
                          <span style="display: inline-block; width: 24px; height: 24px; background-color: #eef2ff; border-radius: 50%; text-align: center; line-height: 24px; font-size: 12px; font-weight: 700; color: #4f46e5;">2</span>
                        </td>
                        <td style="padding-left: 12px;">
                          <p style="margin: 0; font-size: 15px; font-weight: 600; color: #18181b;">We'll respond within 24 hours</p>
                          <p style="margin: 4px 0 0 0; font-size: 14px; color: #71717a;">With our thoughts on approach, timeline, and whether we're the right fit</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0;">
                    <table role="presentation" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="width: 32px; vertical-align: top;">
                          <span style="display: inline-block; width: 24px; height: 24px; background-color: #eef2ff; border-radius: 50%; text-align: center; line-height: 24px; font-size: 12px; font-weight: 700; color: #4f46e5;">3</span>
                        </td>
                        <td style="padding-left: 12px;">
                          <p style="margin: 0; font-size: 15px; font-weight: 600; color: #18181b;">Discovery call (if it makes sense)</p>
                          <p style="margin: 4px 0 0 0; font-size: 14px; color: #71717a;">We'll dig into requirements, architecture, and constraints together</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding-top: 32px; text-align: center; border-top: 1px solid #e4e4e7; margin-top: 32px;">
              <p style="margin: 24px 0 8px 0; font-size: 13px; color: #71717a;">
                Questions? Just reply to this email.
              </p>
              <p style="margin: 0; font-size: 13px; color: #71717a;">
                <a href="https://chelonlabs.com" style="color: #6366f1; text-decoration: none;">chelonlabs.com</a>
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
      text: `
Thanks for reaching out, ${firstName}!

We've received your message and will review it shortly. You can expect to hear back from us within 24 hours.

---

Your message:
${message}

Engagement type: ${engagementDisplay}
${company ? `Company: ${company}` : ''}

---

What happens next?

1. We review your requirements
   Our team will analyze your message and prepare initial thoughts

2. We'll respond within 24 hours
   With our thoughts on approach, timeline, and whether we're the right fit

3. Discovery call (if it makes sense)
   We'll dig into requirements, architecture, and constraints together

---

Questions? Just reply to this email.
chelonlabs.com
      `.trim(),
    });

    return new Response(
      JSON.stringify({ success: true, messageId: data?.id }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('Contact form error:', err);
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

// Helper function to escape HTML to prevent XSS
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (char) => map[char]);
}
