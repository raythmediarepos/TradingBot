const { Resend } = require('resend')
require('dotenv').config()

// Initialize Resend client (lazy initialization to allow env vars to load)
let resend = null

const getResendClient = () => {
  if (!resend) {
    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      console.error('❌ [RESEND CONFIG] RESEND_API_KEY environment variable is missing!')
      console.error('   → Set it in Render dashboard: Environment → Add Variable')
      return null
    }
    console.log('✅ [RESEND CONFIG] Initializing Resend client...')
    console.log(`   → API Key: ${apiKey.substring(0, 8)}...`)
    resend = new Resend(apiKey)
  }
  return resend
}

/**
 * Send waitlist confirmation email
 * @param {string} email - User's email address
 * @param {string} firstName - User's first name
 * @param {string} lastName - User's last name
 * @param {number} position - User's position in waitlist
 * @returns {Promise<boolean>}
 */
const sendWaitlistConfirmation = async (email, firstName, lastName, position) => {
  console.log('📧 [EMAIL] Starting waitlist confirmation email...')
  console.log(`   → To: ${email}`)
  console.log(`   → Name: ${firstName} ${lastName}`)
  console.log(`   → Position: #${position}`)
  
  try {
    const resendClient = getResendClient()
    if (!resendClient) {
      console.error('❌ [EMAIL] Cannot send - Resend client not initialized')
      return false
    }

    const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'
    const fromName = process.env.EMAIL_FROM_NAME || 'Honeypot AI'

    console.log(`   → From: ${fromName} <${fromEmail}>`)
    console.log(`   → Resend API Key: ${process.env.RESEND_API_KEY ? '✓ Set' : '✗ Missing'}`)

    const data = await resendClient.emails.send({
      from: `${fromName} <${fromEmail}>`,
      to: [email],
      subject: `You're on the Honeypot AI Waitlist - Position #${position}`,
      text: `
Hi ${firstName},

Thank you for joining the Honeypot AI waitlist! You're confirmed at position #${position}.

About Honeypot AI
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
We're building the first AI-powered trading assistant designed with Islamic principles at its core. Our platform provides real-time, halal-compliant trading signals with full transparency on every recommendation.

What You'll Get
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ Real-time buy/sell signals for halal-compliant stocks
✓ Detailed rationale and risk analysis for every trade
✓ Automatic screening: No options, no haram sectors
✓ Direct delivery to your Discord server
✓ Educational resources on halal investing

Launch Timeline
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
November 15, 2025  →  Discord community opens
December 1, 2025   →  Beta access for first 100 members
January 1, 2026    →  Full platform launch (v1.0)

We'll email you as soon as it's your turn to join. In the meantime, you can follow our progress and connect with early members on our social channels.

Stay Connected
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Website: https://honeypotai.com
Twitter: @HoneypotAI
Discord: Coming Soon

Have questions? Reply to this email – we read every message.

Best regards,
The Honeypot AI Team

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Honeypot AI · Halal-First Trading Intelligence
© ${new Date().getFullYear()} Honeypot AI. All rights reserved.

You're receiving this email because you joined our waitlist at honeypotai.com
      `.trim(),
      html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Welcome to Honeypot AI</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f6f9fc; line-height: 1.6;">
  
  <!-- Main Container -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f6f9fc; padding: 20px 0;">
    <tr>
      <td align="center">
        
        <!-- Email Content -->
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); max-width: 600px;">
          
          <!-- Header with Logo -->
          <tr>
            <td style="padding: 48px 48px 24px 48px; text-align: center; border-bottom: 1px solid #e6ebf1;">
              <h1 style="margin: 0; color: #0A0A0A; font-size: 28px; font-weight: 600; letter-spacing: -0.5px;">
                🐝 Honeypot AI
              </h1>
              <p style="margin: 8px 0 0 0; color: #6b7280; font-size: 14px; font-weight: 500;">
                Halal-First Trading Intelligence
              </p>
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="padding: 40px 48px;">
              
              <!-- Greeting -->
              <p style="margin: 0 0 24px 0; color: #1f2937; font-size: 16px; line-height: 1.5;">
                Hi <strong>${firstName}</strong>,
              </p>
              
              <p style="margin: 0 0 32px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                Thank you for joining the Honeypot AI waitlist! We're excited to have you as part of our early community.
              </p>
              
              <!-- Position Badge -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 0 0 32px 0;">
                <tr>
                  <td align="center" style="background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); border-radius: 12px; padding: 24px;">
                    <p style="margin: 0 0 8px 0; color: #78350f; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                      Your Waitlist Position
                    </p>
                    <p style="margin: 0; color: #1f2937; font-size: 36px; font-weight: 700; line-height: 1;">
                      #${position}
                    </p>
                    <p style="margin: 8px 0 0 0; color: #78350f; font-size: 13px;">
                      ✓ Confirmed
                    </p>
                  </td>
                </tr>
              </table>
              
              <!-- About Section -->
              <h2 style="margin: 0 0 16px 0; color: #1f2937; font-size: 20px; font-weight: 600; line-height: 1.3;">
                About Honeypot AI
              </h2>
              <p style="margin: 0 0 32px 0; color: #4b5563; font-size: 15px; line-height: 1.6;">
                We're building the first AI-powered trading assistant designed with Islamic principles at its core. Our platform provides real-time, halal-compliant trading signals with complete transparency on every recommendation.
              </p>
              
              <!-- Features Section -->
              <h2 style="margin: 0 0 20px 0; color: #1f2937; font-size: 20px; font-weight: 600; line-height: 1.3;">
                What You'll Get
              </h2>
              
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 0 0 32px 0;">
                <tr>
                  <td style="padding: 16px; background-color: #f9fafb; border-left: 3px solid #10b981; border-radius: 6px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="padding: 8px 0;">
                          <span style="color: #10b981; font-size: 18px; margin-right: 8px;">✓</span>
                          <span style="color: #374151; font-size: 15px; line-height: 1.5;">Real-time buy/sell signals for halal-compliant stocks</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0;">
                          <span style="color: #10b981; font-size: 18px; margin-right: 8px;">✓</span>
                          <span style="color: #374151; font-size: 15px; line-height: 1.5;">Detailed rationale and risk analysis for every trade</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0;">
                          <span style="color: #10b981; font-size: 18px; margin-right: 8px;">✓</span>
                          <span style="color: #374151; font-size: 15px; line-height: 1.5;">Automatic screening: No options, no haram sectors</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0;">
                          <span style="color: #10b981; font-size: 18px; margin-right: 8px;">✓</span>
                          <span style="color: #374151; font-size: 15px; line-height: 1.5;">Direct delivery to your Discord server</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0;">
                          <span style="color: #10b981; font-size: 18px; margin-right: 8px;">✓</span>
                          <span style="color: #374151; font-size: 15px; line-height: 1.5;">Educational resources on halal investing</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              <!-- Timeline Section -->
              <h2 style="margin: 0 0 20px 0; color: #1f2937; font-size: 20px; font-weight: 600; line-height: 1.3;">
                Launch Timeline
              </h2>
              
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 0 0 32px 0; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
                <tr>
                  <td style="padding: 16px 20px; background-color: #fef3c7; border-bottom: 1px solid #fde68a;">
                    <p style="margin: 0; color: #92400e; font-size: 14px; font-weight: 600;">November 15, 2025</p>
                    <p style="margin: 4px 0 0 0; color: #78350f; font-size: 13px;">Discord community opens</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 16px 20px; background-color: #fef3c7; border-bottom: 1px solid #fde68a;">
                    <p style="margin: 0; color: #92400e; font-size: 14px; font-weight: 600;">December 1, 2025</p>
                    <p style="margin: 4px 0 0 0; color: #78350f; font-size: 13px;">Beta access for first 100 members</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 16px 20px; background-color: #fef3c7;">
                    <p style="margin: 0; color: #92400e; font-size: 14px; font-weight: 600;">January 1, 2026</p>
                    <p style="margin: 4px 0 0 0; color: #78350f; font-size: 13px;">Full platform launch (v1.0)</p>
                  </td>
                </tr>
              </table>
              
              <!-- Next Steps -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 0 0 32px 0; background-color: #eff6ff; border-radius: 8px; padding: 24px;">
                <tr>
                  <td>
                    <p style="margin: 0 0 12px 0; color: #1e40af; font-size: 15px; font-weight: 600;">
                      What Happens Next?
                    </p>
                    <p style="margin: 0; color: #1e3a8a; font-size: 14px; line-height: 1.6;">
                      We'll email you as soon as it's your turn to join. In the meantime, you can follow our progress and connect with early members on our social channels.
                    </p>
                  </td>
                </tr>
              </table>
              
              <!-- CTA Button -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 0 0 32px 0;">
                <tr>
                  <td align="center">
                    <a href="https://honeypotai.com" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); color: #1f2937; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; box-shadow: 0 2px 6px rgba(251, 191, 36, 0.3);">
                      Visit Our Website →
                    </a>
                  </td>
                </tr>
              </table>
              
              <!-- Closing -->
              <p style="margin: 0 0 8px 0; color: #4b5563; font-size: 15px; line-height: 1.6;">
                Have questions? Just reply to this email – we read every message.
              </p>
              
              <p style="margin: 0; color: #4b5563; font-size: 15px; line-height: 1.6;">
                <strong style="color: #1f2937;">Best regards,</strong><br>
                <span style="color: #6b7280;">The Honeypot AI Team</span>
              </p>
              
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 32px 48px; background-color: #f9fafb; border-top: 1px solid #e6ebf1; border-radius: 0 0 8px 8px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center">
                    <p style="margin: 0 0 12px 0; color: #6b7280; font-size: 13px;">
                      <a href="https://honeypotai.com" style="color: #f59e0b; text-decoration: none; font-weight: 500;">Website</a>
                      <span style="color: #d1d5db; margin: 0 8px;">•</span>
                      <a href="https://twitter.com/HoneypotAI" style="color: #f59e0b; text-decoration: none; font-weight: 500;">Twitter</a>
                      <span style="color: #d1d5db; margin: 0 8px;">•</span>
                      <span style="color: #9ca3af;">Discord (Coming Soon)</span>
                    </p>
                    <p style="margin: 0 0 8px 0; color: #9ca3af; font-size: 12px; line-height: 1.5;">
                      © ${new Date().getFullYear()} Honeypot AI. All rights reserved.
                    </p>
                    <p style="margin: 0; color: #d1d5db; font-size: 11px; line-height: 1.5;">
                      You're receiving this email because you joined our waitlist at honeypotai.com
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
        </table>
        
      </td>
    </tr>
  </table>
  
</body>
</html>
      `,
    })

    console.log('   → Sending email via Resend API...')
    console.log('📨 [RESEND RESPONSE] Full API response:', JSON.stringify(data, null, 2))
    
    if (data && data.data && data.data.id) {
      console.log('✅ [EMAIL SUCCESS] Confirmation email sent!')
      console.log(`   → To: ${email}`)
      console.log(`   → Position: #${position}`)
      console.log(`   → Email ID: ${data.data.id}`)
      return true
    } else if (data && data.id) {
      console.log('✅ [EMAIL SUCCESS] Confirmation email sent!')
      console.log(`   → To: ${email}`)
      console.log(`   → Position: #${position}`)
      console.log(`   → Email ID: ${data.id}`)
      return true
    } else if (data && data.error) {
      console.error('❌ [EMAIL ERROR] Resend API returned an error')
      console.error(`   → Error details:`, JSON.stringify(data.error, null, 2))
      return false
    } else {
      console.warn('⚠️ [EMAIL WARNING] Unexpected Resend API response structure')
      console.warn(`   → Can't find email ID in response`)
      // Still return true since no error was thrown
      return true
    }
  } catch (error) {
    console.error('❌ [EMAIL ERROR] Failed to send confirmation email')
    console.error(`   → Recipient: ${email}`)
    console.error(`   → Error: ${error.message}`)
    if (error.statusCode) {
      console.error(`   → Status Code: ${error.statusCode}`)
    }
    if (error.name) {
      console.error(`   → Error Type: ${error.name}`)
    }
    // Don't throw - we don't want to fail the waitlist signup if email fails
    return false
  }
}

/**
 * Send contact form notification email (to admin)
 * @param {string} email - User's email
 * @param {string} firstName - User's first name
 * @param {string} lastName - User's last name
 * @param {string} message - User's message
 * @param {string} subject - Message subject
 * @returns {Promise<boolean>}
 */
const sendContactNotification = async (email, firstName, lastName, message, subject = 'No Subject') => {
  console.log('📧 [EMAIL] Starting contact notification email...')
  console.log(`   → From: ${firstName} ${lastName} <${email}>`)
  
  try {
    const resendClient = getResendClient()
    if (!resendClient) {
      console.error('❌ [EMAIL] Cannot send - Resend client not initialized')
      return false
    }

    const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'
    const fromName = process.env.EMAIL_FROM_NAME || 'Honeypot AI'
    const adminEmail = process.env.ADMIN_EMAIL || 'raythmedia.repo@gmail.com'

    console.log(`   → To Admin: ${adminEmail}`)

    const data = await resendClient.emails.send({
      from: `${fromName} <${fromEmail}>`,
      to: [adminEmail],
      replyTo: email,
      subject: `New Contact Form: ${subject}`,
      text: `
New contact form submission:

From: ${firstName} ${lastName}
Email: ${email}
Subject: ${subject}

Message:
${message}

---
Reply to: ${email}
      `.trim(),
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>New Contact Form Submission</title>
</head>
<body style="margin: 0; padding: 20px; font-family: sans-serif; background-color: #f5f5f5;">
  <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <h2 style="color: #F5C518; margin-top: 0;">📧 New Contact Form Submission</h2>
    
    <div style="background-color: #f9f9f9; padding: 15px; border-radius: 6px; margin: 20px 0;">
      <p style="margin: 5px 0;"><strong>From:</strong> ${firstName} ${lastName}</p>
      <p style="margin: 5px 0;"><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
      <p style="margin: 5px 0;"><strong>Subject:</strong> ${subject}</p>
    </div>
    
    <div style="margin: 20px 0;">
      <h3 style="color: #333;">Message:</h3>
      <div style="background-color: #f9f9f9; padding: 15px; border-radius: 6px; white-space: pre-wrap;">
${message}
      </div>
    </div>
    
    <p style="color: #666; font-size: 12px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 15px;">
      Reply directly to: <a href="mailto:${email}">${email}</a>
    </p>
  </div>
</body>
</html>
      `,
    })

    console.log(`✅ [EMAIL SUCCESS] Contact notification sent!`)
    console.log(`   → Email ID: ${data.id}`)
    return true
  } catch (error) {
    console.error('❌ [EMAIL ERROR] Failed to send contact notification')
    console.error(`   → Error: ${error.message}`)
    return false
  }
}

module.exports = {
  sendWaitlistConfirmation,
  sendContactNotification,
}
