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
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${escapeHtml(name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(email)}</p>
        <p><strong>Company:</strong> ${escapeHtml(company) || 'Not provided'}</p>
        <p><strong>Engagement Type:</strong> ${escapeHtml(engagementDisplay)}</p>
        <h3>Message:</h3>
        <p>${escapeHtml(message).replace(/\n/g, '<br>')}</p>
      `,
      text: `
New Contact Form Submission

Name: ${name}
Email: ${email}
Company: ${company || 'Not provided'}
Engagement Type: ${engagementDisplay}

Message:
${message}
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
<body style="margin: 0; padding: 0; background-color: #0a0a0f; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0a0a0f;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width: 600px; width: 100%;">
          
          <!-- Header -->
          <tr>
            <td style="padding-bottom: 32px;">
              <span style="font-size: 24px; font-weight: 700; color: #ffffff;">Chelon</span>
              <span style="font-size: 24px; font-weight: 700; color: #6366f1;">Labs</span>
            </td>
          </tr>
          
          <!-- Main Card -->
          <tr>
            <td style="background: linear-gradient(180deg, #1a1a24 0%, #12121a 100%); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 16px; padding: 32px;">
              
              <h1 style="margin: 0 0 16px 0; font-size: 24px; font-weight: 700; color: #ffffff;">Thanks for reaching out, ${escapeHtml(firstName)}!</h1>
              
              <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.6; color: #a0a0a8;">
                We've received your message and will review it shortly. You can expect to hear back from us within 24 hours.
              </p>
              
              <div style="padding: 20px; background: rgba(255, 255, 255, 0.03); border-radius: 12px; border-left: 3px solid #6366f1; margin-bottom: 24px;">
                <p style="margin: 0 0 8px 0; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; color: #6366f1;">Your message</p>
                <p style="margin: 0; font-size: 15px; line-height: 1.6; color: #e0e0e6; white-space: pre-wrap;">${escapeHtml(message)}</p>
              </div>
              
              <p style="margin: 0 0 8px 0; font-size: 14px; color: #a0a0a8;">
                <strong style="color: #ffffff;">Engagement type:</strong> ${escapeHtml(engagementDisplay)}
              </p>
              
              ${company ? `<p style="margin: 0; font-size: 14px; color: #a0a0a8;"><strong style="color: #ffffff;">Company:</strong> ${escapeHtml(company)}</p>` : ''}
              
            </td>
          </tr>
          
          <!-- What's Next -->
          <tr>
            <td style="padding-top: 32px;">
              <h2 style="margin: 0 0 16px 0; font-size: 18px; font-weight: 600; color: #ffffff;">What happens next?</h2>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="padding: 12px 0;">
                    <table role="presentation" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="width: 32px; vertical-align: top;">
                          <span style="display: inline-block; width: 24px; height: 24px; background: rgba(99, 102, 241, 0.15); border-radius: 50%; text-align: center; line-height: 24px; font-size: 12px; font-weight: 700; color: #6366f1;">1</span>
                        </td>
                        <td style="padding-left: 12px;">
                          <p style="margin: 0; font-size: 15px; color: #ffffff;">We review your requirements</p>
                          <p style="margin: 4px 0 0 0; font-size: 13px; color: #888894;">Our team will analyze your message and prepare initial thoughts</p>
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
                          <span style="display: inline-block; width: 24px; height: 24px; background: rgba(99, 102, 241, 0.15); border-radius: 50%; text-align: center; line-height: 24px; font-size: 12px; font-weight: 700; color: #6366f1;">2</span>
                        </td>
                        <td style="padding-left: 12px;">
                          <p style="margin: 0; font-size: 15px; color: #ffffff;">We'll respond within 24 hours</p>
                          <p style="margin: 4px 0 0 0; font-size: 13px; color: #888894;">With our thoughts on approach, timeline, and whether we're the right fit</p>
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
                          <span style="display: inline-block; width: 24px; height: 24px; background: rgba(99, 102, 241, 0.15); border-radius: 50%; text-align: center; line-height: 24px; font-size: 12px; font-weight: 700; color: #6366f1;">3</span>
                        </td>
                        <td style="padding-left: 12px;">
                          <p style="margin: 0; font-size: 15px; color: #ffffff;">Discovery call (if it makes sense)</p>
                          <p style="margin: 4px 0 0 0; font-size: 13px; color: #888894;">We'll dig into requirements, architecture, and constraints together</p>
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
            <td style="padding-top: 40px; text-align: center; border-top: 1px solid rgba(255, 255, 255, 0.08); margin-top: 32px;">
              <p style="margin: 24px 0 8px 0; font-size: 13px; color: #888894;">
                Questions? Just reply to this email.
              </p>
              <p style="margin: 0; font-size: 13px; color: #888894;">
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
