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
    const fromName = process.env.EMAIL_FROM_NAME || 'Helwa AI'

    console.log(`   → From: ${fromName} <${fromEmail}>`)
    console.log(`   → Resend API Key: ${process.env.RESEND_API_KEY ? '✓ Set' : '✗ Missing'}`)

    const data = await resendClient.emails.send({
      from: `${fromName} <${fromEmail}>`,
      to: [email],
      subject: `You're on the Helwa AI Waitlist - Position #${position}`,
      text: `
Hi ${firstName},

Thank you for joining the Helwa AI waitlist! You're confirmed at position #${position}.

About Helwa AI
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
We're building the first AI-powered trading assistant designed with Islamic principles at its core. Our platform provides real-time, ethical trading signals with full transparency on every recommendation.

What You'll Get
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ Real-time buy/sell signals for ethical stocks
✓ Detailed rationale and risk analysis for every trade
✓ Automatic screening: No options, no haram sectors
✓ Direct delivery to your Discord server
✓ Educational resources on ethical investing

Launch Timeline
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
November 15, 2025  →  Discord community opens
December 1, 2025   →  Beta access for first 100 members
January 1, 2026    →  Full platform launch (v1.0)

We'll email you as soon as it's your turn to join. In the meantime, you can follow our progress and connect with early members on our social channels.

Stay Connected
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Website: https://helwaai.com
Twitter: @HelwaAI
Discord: Coming Soon

Have questions? Reply to this email – we read every message.

Best regards,
The Helwa AI Team

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Helwa AI · Ethical Trading Intelligence
© ${new Date().getFullYear()} Helwa AI. All rights reserved.

You're receiving this email because you joined our waitlist at helwaai.com
      `.trim(),
      html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Welcome to Helwa AI</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0A0A0A; line-height: 1.6;">
  
  <!-- Main Container -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #0A0A0A; padding: 40px 20px;">
    <tr>
      <td align="center">
        
        <!-- Email Content -->
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #111213; border-radius: 12px; box-shadow: 0 8px 32px rgba(245, 197, 24, 0.15); max-width: 600px; border: 1px solid rgba(245, 197, 24, 0.2);">
          
          <!-- Golden Top Border -->
          <tr>
            <td style="background: linear-gradient(90deg, #F5C518 0%, #D4A90E 50%, #F5C518 100%); height: 4px; border-radius: 12px 12px 0 0;"></td>
          </tr>
          
          <!-- Header with Logo -->
          <tr>
            <td style="padding: 48px 48px 32px 48px; text-align: center; background: linear-gradient(180deg, rgba(245, 197, 24, 0.08) 0%, transparent 100%);">
              <h1 style="margin: 0; color: #FFFFFF; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">
                Helwa AI
              </h1>
              <p style="margin: 8px 0 0 0; color: #A3A3A3; font-size: 14px; font-weight: 500; letter-spacing: 0.5px;">
                ethical Trading Signals
              </p>
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="padding: 40px 48px; background-color: #111213;">
              
              <!-- Greeting -->
              <p style="margin: 0 0 16px 0; color: #FFFFFF; font-size: 18px; line-height: 1.5; font-weight: 600;">
                Hi <strong style="color: #F5C518;">${firstName}</strong>,
              </p>
              
              <p style="margin: 0 0 32px 0; color: #D4D4D4; font-size: 16px; line-height: 1.6;">
                Thank you for joining the Helwa AI waitlist! We're excited to have you as part of our early community.
              </p>
              
              <!-- Position Badge -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 0 0 40px 0;">
                <tr>
                  <td align="center" style="background: linear-gradient(135deg, #F5C518 0%, #D4A90E 100%); border-radius: 16px; padding: 32px; box-shadow: 0 8px 32px rgba(245, 197, 24, 0.4);">
                    <p style="margin: 0 0 12px 0; color: #0A0A0A; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px;">
                      Your Waitlist Position
                    </p>
                    <p style="margin: 0; color: #0A0A0A; font-size: 56px; font-weight: 800; line-height: 1; text-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);">
                      #${position}
                    </p>
                    <div style="margin-top: 16px; display: inline-block; background-color: #0A0A0A; color: #F5C518; padding: 8px 20px; border-radius: 24px; font-size: 12px; font-weight: 700; letter-spacing: 0.5px;">
                      ✓ CONFIRMED
                    </div>
                  </td>
                </tr>
              </table>
              
              <!-- About Section -->
              <h2 style="margin: 0 0 16px 0; color: #F5C518; font-size: 22px; font-weight: 700; line-height: 1.3;">
                About Helwa AI
              </h2>
              <p style="margin: 0 0 32px 0; color: #D4D4D4; font-size: 15px; line-height: 1.7;">
                We're building the first AI-powered trading assistant designed with Islamic principles at its core. Our platform provides real-time, ethical trading signals with complete transparency on every recommendation.
              </p>
              
              <!-- Features Section -->
              <h2 style="margin: 0 0 20px 0; color: #F5C518; font-size: 22px; font-weight: 700; line-height: 1.3;">
                What You'll Get
              </h2>
              
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 0 0 32px 0;">
                <tr>
                  <td style="padding: 24px; background-color: rgba(245, 197, 24, 0.05); border-left: 4px solid #F5C518; border-radius: 8px; border: 1px solid rgba(245, 197, 24, 0.15);">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="padding: 10px 0;">
                          <span style="color: #F5C518; font-size: 18px; margin-right: 10px; font-weight: bold;">✓</span>
                          <span style="color: #E5E5E5; font-size: 15px; line-height: 1.6;">Real-time buy/sell signals for ethical stocks</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 0;">
                          <span style="color: #F5C518; font-size: 18px; margin-right: 10px; font-weight: bold;">✓</span>
                          <span style="color: #E5E5E5; font-size: 15px; line-height: 1.6;">Detailed rationale and risk analysis for every trade</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 0;">
                          <span style="color: #F5C518; font-size: 18px; margin-right: 10px; font-weight: bold;">✓</span>
                          <span style="color: #E5E5E5; font-size: 15px; line-height: 1.6;">Automatic screening: No options, no haram sectors</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 0;">
                          <span style="color: #F5C518; font-size: 18px; margin-right: 10px; font-weight: bold;">✓</span>
                          <span style="color: #E5E5E5; font-size: 15px; line-height: 1.6;">Direct delivery to your Discord server</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 0;">
                          <span style="color: #F5C518; font-size: 18px; margin-right: 10px; font-weight: bold;">✓</span>
                          <span style="color: #E5E5E5; font-size: 15px; line-height: 1.6;">Educational resources on ethical investing</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              <!-- Timeline Section -->
              <h2 style="margin: 0 0 20px 0; color: #F5C518; font-size: 22px; font-weight: 700; line-height: 1.3;">
                Launch Timeline
              </h2>
              
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 0 0 32px 0; border: 1px solid rgba(245, 197, 24, 0.2); border-radius: 10px; overflow: hidden; background-color: rgba(245, 197, 24, 0.03);">
                <tr>
                  <td style="padding: 18px 24px; border-bottom: 1px solid rgba(245, 197, 24, 0.15);">
                    <p style="margin: 0 0 4px 0; color: #F5C518; font-size: 14px; font-weight: 700;">November 15, 2025</p>
                    <p style="margin: 0; color: #A3A3A3; font-size: 13px;">Discord community opens</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 18px 24px; border-bottom: 1px solid rgba(245, 197, 24, 0.15);">
                    <p style="margin: 0 0 4px 0; color: #F5C518; font-size: 14px; font-weight: 700;">December 1, 2025</p>
                    <p style="margin: 0; color: #A3A3A3; font-size: 13px;">Beta access for first 100 members</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 18px 24px;">
                    <p style="margin: 0 0 4px 0; color: #F5C518; font-size: 14px; font-weight: 700;">January 1, 2026</p>
                    <p style="margin: 0; color: #A3A3A3; font-size: 13px;">Full platform launch (v1.0)</p>
                  </td>
                </tr>
              </table>
              
              <!-- Next Steps -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 0 0 32px 0; background: linear-gradient(135deg, rgba(245, 197, 24, 0.1) 0%, rgba(212, 169, 14, 0.05) 100%); border-radius: 10px; padding: 24px; border: 1px solid rgba(245, 197, 24, 0.2);">
                <tr>
                  <td>
                    <p style="margin: 0 0 12px 0; color: #F5C518; font-size: 16px; font-weight: 700;">
                      What Happens Next?
                    </p>
                    <p style="margin: 0; color: #D4D4D4; font-size: 14px; line-height: 1.7;">
                      We'll email you as soon as it's your turn to join. In the meantime, you can follow our progress and connect with early members on our social channels.
                    </p>
                  </td>
                </tr>
              </table>
              
              <!-- CTA Button -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 0 0 32px 0;">
                <tr>
                  <td align="center">
                    <a href="https://helwaai.com" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #F5C518 0%, #D4A90E 100%); color: #0A0A0A; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 15px; box-shadow: 0 8px 24px rgba(245, 197, 24, 0.4); letter-spacing: 0.3px;">
                      Visit Our Website →
                    </a>
                  </td>
                </tr>
              </table>
              
              <!-- Closing -->
              <p style="margin: 0 0 12px 0; color: #D4D4D4; font-size: 15px; line-height: 1.6;">
                Have questions? Just reply to this email – we read every message.
              </p>
              
              <p style="margin: 0; color: #D4D4D4; font-size: 15px; line-height: 1.6;">
                <strong style="color: #FFFFFF;">Best regards,</strong><br>
                <span style="color: #A3A3A3;">The Helwa AI Team</span>
              </p>
              
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 32px 48px; background: linear-gradient(180deg, #111213 0%, #0A0A0A 100%); border-top: 1px solid rgba(245, 197, 24, 0.15); border-radius: 0 0 12px 12px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center">
                    <!-- Divider Line -->
                    <div style="height: 2px; background: linear-gradient(90deg, transparent 0%, #F5C518 50%, transparent 100%); margin-bottom: 24px; opacity: 0.3;"></div>
                    
                    <p style="margin: 0 0 16px 0; color: #A3A3A3; font-size: 13px;">
                      <a href="https://helwaai.com" style="color: #F5C518; text-decoration: none; font-weight: 600; transition: opacity 0.2s;">Website</a>
                      <span style="color: #525252; margin: 0 10px;">•</span>
                      <a href="https://twitter.com/HelwaAI" style="color: #F5C518; text-decoration: none; font-weight: 600; transition: opacity 0.2s;">Twitter</a>
                      <span style="color: #525252; margin: 0 10px;">•</span>
                      <span style="color: #737373;">Discord (Coming Soon)</span>
                    </p>
                    <p style="margin: 0 0 8px 0; color: #737373; font-size: 12px; line-height: 1.5;">
                      © ${new Date().getFullYear()} Helwa AI. All rights reserved.
                    </p>
                    <p style="margin: 0; color: #525252; font-size: 11px; line-height: 1.5;">
                      You're receiving this email because you joined our waitlist at helwaai.com
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
    const fromName = process.env.EMAIL_FROM_NAME || 'Helwa AI'
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

/**
 * Send affiliate application confirmation email
 * @param {string} email - Affiliate email
 * @param {string} name - Affiliate name
 * @param {string} affiliateCode - Unique affiliate code
 * @returns {Promise<boolean>}
 */
const sendAffiliateApplicationEmail = async (email, name, affiliateCode) => {
  console.log('📧 [EMAIL] Sending affiliate application confirmation...')
  console.log(`   → To: ${email}`)
  console.log(`   → Name: ${name}`)
  console.log(`   → Code: ${affiliateCode}`)

  try {
    const resendClient = getResendClient()
    if (!resendClient) {
      console.error('❌ [EMAIL] Cannot send - Resend client not initialized')
      return false
    }

    const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'
    const fromName = process.env.EMAIL_FROM_NAME || 'Helwa AI'

    const data = await resendClient.emails.send({
      from: `${fromName} <${fromEmail}>`,
      to: [email],
      subject: `Affiliate Application Received - Helwa AI`,
      html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Affiliate Application Received</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0A0A0A; line-height: 1.6;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #0A0A0A; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #111213; border-radius: 12px; box-shadow: 0 8px 32px rgba(245, 197, 24, 0.15); max-width: 600px; border: 1px solid rgba(245, 197, 24, 0.2);">
          <tr>
            <td style="background: linear-gradient(90deg, #F5C518 0%, #D4A90E 50%, #F5C518 100%); height: 4px; border-radius: 12px 12px 0 0;"></td>
          </tr>
          <tr>
            <td style="padding: 48px 48px 32px 48px; text-align: center;">
              <h1 style="margin: 0; color: #FFFFFF; font-size: 32px; font-weight: 700;">Application Received!</h1>
              <p style="margin: 8px 0 0 0; color: #A3A3A3; font-size: 14px;">Affiliate Program</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 48px; background-color: #111213;">
              <p style="margin: 0 0 16px 0; color: #FFFFFF; font-size: 18px; font-weight: 600;">
                Hi <strong style="color: #F5C518;">${name}</strong>,
              </p>
              <p style="margin: 0 0 24px 0; color: #D4D4D4; font-size: 16px;">
                Thank you for applying to become a Helwa AI affiliate! We've received your application and are reviewing it.
              </p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 0 0 32px 0;">
                <tr>
                  <td align="center" style="background: linear-gradient(135deg, #F5C518 0%, #D4A90E 100%); border-radius: 12px; padding: 24px;">
                    <p style="margin: 0 0 8px 0; color: #0A0A0A; font-size: 13px; font-weight: 700; text-transform: uppercase;">Your Affiliate Code</p>
                    <p style="margin: 0; color: #0A0A0A; font-size: 32px; font-weight: 800; font-family: monospace;">${affiliateCode}</p>
                  </td>
                </tr>
              </table>
              <h2 style="margin: 0 0 16px 0; color: #F5C518; font-size: 20px; font-weight: 700;">What Happens Next?</h2>
              <p style="margin: 0 0 16px 0; color: #D4D4D4; font-size: 15px;">
                We'll review your application within <strong>24-48 hours</strong>. Once approved, you'll receive an email with:
              </p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 0 0 32px 0;">
                <tr>
                  <td style="padding: 20px; background-color: rgba(245, 197, 24, 0.05); border-left: 4px solid #F5C518; border-radius: 8px;">
                    <p style="margin: 0 0 12px 0; color: #F5C518; font-size: 16px; font-weight: 600;">✓ Login credentials for your dashboard</p>
                    <p style="margin: 0 0 12px 0; color: #E5E5E5; font-size: 15px;">✓ Your unique referral link</p>
                    <p style="margin: 0 0 12px 0; color: #E5E5E5; font-size: 15px;">✓ Marketing materials and resources</p>
                    <p style="margin: 0; color: #E5E5E5; font-size: 15px;">✓ Getting started guide</p>
                  </td>
                </tr>
              </table>
              <p style="margin: 0 0 8px 0; color: #D4D4D4; font-size: 15px;">
                Questions? Reply to this email or contact us at <a href="mailto:affiliates@helwaai.com" style="color: #F5C518; text-decoration: none;">affiliates@helwaai.com</a>
              </p>
              <p style="margin: 24px 0 0 0; color: #D4D4D4; font-size: 15px;">
                <strong style="color: #FFFFFF;">Best regards,</strong><br>
                <span style="color: #A3A3A3;">The Helwa AI Team</span>
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px 48px; background: linear-gradient(180deg, #111213 0%, #0A0A0A 100%); border-top: 1px solid rgba(245, 197, 24, 0.15); border-radius: 0 0 12px 12px;">
              <p style="margin: 0; color: #737373; font-size: 12px; text-align: center;">
                © ${new Date().getFullYear()} Helwa AI. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `
    })

    console.log('✅ [EMAIL SUCCESS] Affiliate application confirmation sent!')
    console.log(`   → Email ID: ${data.id}`)
    return true
  } catch (error) {
    console.error('❌ [EMAIL ERROR] Failed to send affiliate confirmation')
    console.error(`   → Error: ${error.message}`)
    return false
  }
}

/**
 * Send affiliate approval email with login credentials
 * @param {string} email - Affiliate email
 * @param {string} name - Affiliate name
 * @param {string} affiliateCode - Unique affiliate code
 * @param {string} tempPassword - Temporary password
 * @returns {Promise<boolean>}
 */
const sendAffiliateApprovalEmail = async (email, name, affiliateCode, tempPassword) => {
  console.log('📧 [EMAIL] Sending affiliate approval email...')
  console.log(`   → To: ${email}`)

  try {
    const resendClient = getResendClient()
    if (!resendClient) {
      console.error('❌ [EMAIL] Cannot send - Resend client not initialized')
      return false
    }

    const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'
    const fromName = process.env.EMAIL_FROM_NAME || 'Helwa AI'
    const frontendUrl = process.env.FRONTEND_URL || 'https://trading-bot-dusky-two.vercel.app'
    const affiliateLink = `${frontendUrl}/?ref=${affiliateCode}`
    const loginUrl = `${frontendUrl}/affiliates/login`

    const data = await resendClient.emails.send({
      from: `${fromName} <${fromEmail}>`,
      to: [email],
      subject: `🎉 You're Approved! Welcome to Helwa AI Affiliates`,
      html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Affiliate Approved</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0A0A0A;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #0A0A0A; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #111213; border-radius: 12px; max-width: 600px; border: 1px solid rgba(245, 197, 24, 0.2);">
          <tr>
            <td style="background: linear-gradient(90deg, #F5C518 0%, #D4A90E 50%, #F5C518 100%); height: 4px; border-radius: 12px 12px 0 0;"></td>
          </tr>
          <tr>
            <td style="padding: 48px 48px 32px 48px; text-align: center;">
              <div style="font-size: 64px; margin-bottom: 16px;">🎉</div>
              <h1 style="margin: 0; color: #FFFFFF; font-size: 32px; font-weight: 700;">You're Approved!</h1>
              <p style="margin: 8px 0 0 0; color: #A3A3A3; font-size: 14px;">Welcome to the Affiliate Program</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 48px; background-color: #111213;">
              <p style="margin: 0 0 16px 0; color: #FFFFFF; font-size: 18px; font-weight: 600;">
                Congratulations <strong style="color: #F5C518;">${name}</strong>!
              </p>
              <p style="margin: 0 0 32px 0; color: #D4D4D4; font-size: 16px;">
                Your affiliate application has been approved! You can now start earning 10% recurring commissions on every referral.
              </p>
              
              <h2 style="margin: 0 0 16px 0; color: #F5C518; font-size: 22px; font-weight: 700;">Your Login Credentials</h2>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 0 0 32px 0;">
                <tr>
                  <td style="padding: 24px; background: rgba(245, 197, 24, 0.05); border: 1px solid rgba(245, 197, 24, 0.2); border-radius: 8px;">
                    <p style="margin: 0 0 12px 0; color: #A3A3A3; font-size: 13px;">Email</p>
                    <p style="margin: 0 0 20px 0; color: #FFFFFF; font-size: 16px; font-weight: 600;">${email}</p>
                    <p style="margin: 0 0 12px 0; color: #A3A3A3; font-size: 13px;">Temporary Password</p>
                    <p style="margin: 0; color: #F5C518; font-size: 18px; font-weight: 700; font-family: monospace;">${tempPassword}</p>
                  </td>
                </tr>
              </table>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 0 0 32px 0;">
                <tr>
                  <td align="center">
                    <a href="${loginUrl}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #F5C518 0%, #D4A90E 100%); color: #0A0A0A; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 16px;">Login to Dashboard →</a>
                  </td>
                </tr>
              </table>

              <h2 style="margin: 0 0 16px 0; color: #F5C518; font-size: 22px; font-weight: 700;">Your Referral Link</h2>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 0 0 32px 0;">
                <tr>
                  <td style="padding: 20px; background: rgba(245, 197, 24, 0.05); border: 1px solid rgba(245, 197, 24, 0.2); border-radius: 8px;">
                    <p style="margin: 0; color: #F5C518; font-size: 14px; word-break: break-all;">${affiliateLink}</p>
                  </td>
                </tr>
              </table>

              <h2 style="margin: 0 0 16px 0; color: #F5C518; font-size: 20px; font-weight: 700;">Next Steps</h2>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 0 0 32px 0;">
                <tr>
                  <td style="padding: 20px; background-color: rgba(245, 197, 24, 0.05); border-left: 4px solid #F5C518; border-radius: 8px;">
                    <p style="margin: 0 0 12px 0; color: #E5E5E5; font-size: 15px;"><strong style="color: #F5C518;">1.</strong> Login to your dashboard</p>
                    <p style="margin: 0 0 12px 0; color: #E5E5E5; font-size: 15px;"><strong style="color: #F5C518;">2.</strong> Change your temporary password</p>
                    <p style="margin: 0 0 12px 0; color: #E5E5E5; font-size: 15px;"><strong style="color: #F5C518;">3.</strong> Copy your referral link</p>
                    <p style="margin: 0 0 12px 0; color: #E5E5E5; font-size: 15px;"><strong style="color: #F5C518;">4.</strong> Download marketing materials</p>
                    <p style="margin: 0; color: #E5E5E5; font-size: 15px;"><strong style="color: #F5C518;">5.</strong> Start promoting and earning!</p>
                  </td>
                </tr>
              </table>

              <p style="margin: 0; color: #D4D4D4; font-size: 15px;">
                <strong style="color: #FFFFFF;">Best regards,</strong><br>
                <span style="color: #A3A3A3;">The Helwa AI Team</span>
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px 48px; background: linear-gradient(180deg, #111213 0%, #0A0A0A 100%); border-top: 1px solid rgba(245, 197, 24, 0.15); border-radius: 0 0 12px 12px;">
              <p style="margin: 0; color: #737373; font-size: 12px; text-align: center;">
                © ${new Date().getFullYear()} Helwa AI. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `
    })

    console.log('✅ [EMAIL SUCCESS] Affiliate approval email sent!')
    console.log(`   → Email ID: ${data.id}`)
    return true
  } catch (error) {
    console.error('❌ [EMAIL ERROR] Failed to send affiliate approval')
    console.error(`   → Error: ${error.message}`)
    return false
  }
}

/**
 * Send affiliate welcome email with login credentials (instant signup - NO affiliate code yet)
 * @param {string} email - Affiliate email
 * @param {string} name - Affiliate name
 * @param {string} tempPassword - Temporary password
 * @returns {Promise<boolean>}
 */
const sendAffiliateWelcomeEmail = async (email, name, tempPassword) => {
  console.log('📧 [EMAIL] Sending affiliate welcome email...')
  console.log(`   → To: ${email}`)

  try {
    const resendClient = getResendClient()
    if (!resendClient) {
      console.error('❌ [EMAIL] Cannot send - Resend client not initialized')
      return false
    }

    const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'
    const fromName = process.env.EMAIL_FROM_NAME || 'Helwa AI'
    const frontendUrl = process.env.FRONTEND_URL || 'https://trading-bot-dusky-two.vercel.app'
    const loginUrl = `${frontendUrl}/affiliates/login`

    const data = await resendClient.emails.send({
      from: `${fromName} <${fromEmail}>`,
      to: [email],
      subject: `🎉 Welcome to Helwa AI Affiliates!`,
      html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Helwa AI Affiliates</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0A0A0A;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #0A0A0A; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #111213; border-radius: 12px; max-width: 600px; border: 1px solid rgba(245, 197, 24, 0.2);">
          <tr>
            <td style="background: linear-gradient(90deg, #F5C518 0%, #D4A90E 50%, #F5C518 100%); height: 4px; border-radius: 12px 12px 0 0;"></td>
          </tr>
          <tr>
            <td style="padding: 48px 48px 32px 48px; text-align: center;">
              <div style="font-size: 64px; margin-bottom: 16px;">🎉</div>
              <h1 style="margin: 0; color: #FFFFFF; font-size: 32px; font-weight: 700;">Welcome Aboard!</h1>
              <p style="margin: 8px 0 0 0; color: #A3A3A3; font-size: 14px;">Your affiliate account is ready</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 48px; background-color: #111213;">
              <p style="margin: 0 0 16px 0; color: #FFFFFF; font-size: 18px; font-weight: 600;">
                Hi <strong style="color: #F5C518;">${name}</strong>!
              </p>
              <p style="margin: 0 0 32px 0; color: #D4D4D4; font-size: 16px;">
                Your Helwa AI affiliate account has been created! To start earning 10% recurring commissions, please log in and complete your profile setup with your address and payment information.
              </p>
              
              <h2 style="margin: 0 0 16px 0; color: #F5C518; font-size: 22px; font-weight: 700;">Your Login Credentials</h2>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 0 0 32px 0;">
                <tr>
                  <td style="padding: 24px; background: rgba(245, 197, 24, 0.05); border: 1px solid rgba(245, 197, 24, 0.2); border-radius: 8px;">
                    <p style="margin: 0 0 12px 0; color: #A3A3A3; font-size: 13px;">Email</p>
                    <p style="margin: 0 0 20px 0; color: #FFFFFF; font-size: 16px; font-weight: 600;">${email}</p>
                    <p style="margin: 0 0 12px 0; color: #A3A3A3; font-size: 13px;">Temporary Password</p>
                    <p style="margin: 0; color: #F5C518; font-size: 18px; font-weight: 700; font-family: monospace;">${tempPassword}</p>
                  </td>
                </tr>
              </table>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 0 0 32px 0;">
                <tr>
                  <td align="center">
                    <a href="${loginUrl}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #F5C518 0%, #D4A90E 100%); color: #0A0A0A; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 16px;">Login & Complete Setup →</a>
                  </td>
                </tr>
              </table>

              <h2 style="margin: 0 0 16px 0; color: #F5C518; font-size: 20px; font-weight: 700;">Complete Your Profile</h2>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 0 0 32px 0;">
                <tr>
                  <td style="padding: 20px; background-color: rgba(245, 197, 24, 0.05); border-left: 4px solid #F5C518; border-radius: 8px;">
                    <p style="margin: 0 0 12px 0; color: #E5E5E5; font-size: 15px;"><strong style="color: #F5C518;">1.</strong> Click the button above to login</p>
                    <p style="margin: 0 0 12px 0; color: #E5E5E5; font-size: 15px;"><strong style="color: #F5C518;">2.</strong> Complete your full profile information</p>
                    <p style="margin: 0 0 12px 0; color: #E5E5E5; font-size: 15px;"><strong style="color: #F5C518;">3.</strong> Add your address and payment details</p>
                    <p style="margin: 0; color: #E5E5E5; font-size: 15px;"><strong style="color: #F5C518;">4.</strong> Get your unique referral link and start earning!</p>
                  </td>
                </tr>
              </table>

              <p style="margin: 0; color: #D4D4D4; font-size: 15px;">
                <strong style="color: #FFFFFF;">Best regards,</strong><br>
                <span style="color: #A3A3A3;">The Helwa AI Team</span>
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px 48px; background: linear-gradient(180deg, #111213 0%, #0A0A0A 100%); border-top: 1px solid rgba(245, 197, 24, 0.15); border-radius: 0 0 12px 12px;">
              <p style="margin: 0; color: #737373; font-size: 12px; text-align: center;">
                © ${new Date().getFullYear()} Helwa AI. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `
    })

    console.log('✅ [EMAIL SUCCESS] Affiliate welcome email sent!')
    console.log(`   → Email ID: ${data.id}`)
    return true
  } catch (error) {
    console.error('❌ [EMAIL ERROR] Failed to send affiliate welcome')
    console.error(`   → Error: ${error.message}`)
    return false
  }
}

/**
 * Send setup completion email with affiliate code
 * @param {string} email - Affiliate email
 * @param {string} name - Affiliate name
 * @param {string} affiliateCode - Unique affiliate code
 * @returns {Promise<boolean>}
 */
const sendAffiliateSetupCompleteEmail = async (email, name, affiliateCode) => {
  console.log('📧 [EMAIL] Sending setup completion email...')
  console.log(`   → To: ${email}`)

  try {
    const resendClient = getResendClient()
    if (!resendClient) {
      console.error('❌ [EMAIL] Cannot send - Resend client not initialized')
      return false
    }

    const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'
    const fromName = process.env.EMAIL_FROM_NAME || 'Helwa AI'
    const frontendUrl = process.env.FRONTEND_URL || 'https://trading-bot-dusky-two.vercel.app'
    const affiliateLink = `${frontendUrl}/?ref=${affiliateCode}`

    const data = await resendClient.emails.send({
      from: `${fromName} <${fromEmail}>`,
      to: [email],
      subject: `🎉 Setup Complete! Here's Your Referral Link`,
      html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Setup Complete</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0A0A0A;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #0A0A0A; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #111213; border-radius: 12px; max-width: 600px; border: 1px solid rgba(245, 197, 24, 0.2);">
          <tr>
            <td style="background: linear-gradient(90deg, #F5C518 0%, #D4A90E 50%, #F5C518 100%); height: 4px; border-radius: 12px 12px 0 0;"></td>
          </tr>
          <tr>
            <td style="padding: 48px 48px 32px 48px; text-align: center;">
              <div style="font-size: 64px; margin-bottom: 16px;">🚀</div>
              <h1 style="margin: 0; color: #FFFFFF; font-size: 32px; font-weight: 700;">You're All Set!</h1>
              <p style="margin: 8px 0 0 0; color: #A3A3A3; font-size: 14px;">Start earning commissions today</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 48px; background-color: #111213;">
              <p style="margin: 0 0 16px 0; color: #FFFFFF; font-size: 18px; font-weight: 600;">
                Congratulations <strong style="color: #F5C518;">${name}</strong>!
              </p>
              <p style="margin: 0 0 32px 0; color: #D4D4D4; font-size: 16px;">
                Your affiliate profile is complete! Your unique referral link is ready, and you can now start earning 10% recurring commissions.
              </p>
              
              <h2 style="margin: 0 0 16px 0; color: #F5C518; font-size: 22px; font-weight: 700;">Your Affiliate Code</h2>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 0 0 32px 0;">
                <tr>
                  <td align="center" style="background: linear-gradient(135deg, #F5C518 0%, #D4A90E 100%); border-radius: 12px; padding: 24px;">
                    <p style="margin: 0 0 8px 0; color: #0A0A0A; font-size: 13px; font-weight: 700; text-transform: uppercase;">Your Code</p>
                    <p style="margin: 0; color: #0A0A0A; font-size: 32px; font-weight: 800; font-family: monospace;">${affiliateCode}</p>
                  </td>
                </tr>
              </table>

              <h2 style="margin: 0 0 16px 0; color: #F5C518; font-size: 22px; font-weight: 700;">Your Referral Link</h2>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 0 0 32px 0;">
                <tr>
                  <td style="padding: 20px; background: rgba(245, 197, 24, 0.05); border: 1px solid rgba(245, 197, 24, 0.2); border-radius: 8px;">
                    <p style="margin: 0; color: #F5C518; font-size: 14px; word-break: break-all;">${affiliateLink}</p>
                  </td>
                </tr>
              </table>

              <h2 style="margin: 0 0 16px 0; color: #F5C518; font-size: 20px; font-weight: 700;">Start Promoting</h2>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 0 0 32px 0;">
                <tr>
                  <td style="padding: 20px; background-color: rgba(245, 197, 24, 0.05); border-left: 4px solid #F5C518; border-radius: 8px;">
                    <p style="margin: 0 0 12px 0; color: #E5E5E5; font-size: 15px;">✓ Share your link on social media</p>
                    <p style="margin: 0 0 12px 0; color: #E5E5E5; font-size: 15px;">✓ Add it to your YouTube descriptions</p>
                    <p style="margin: 0 0 12px 0; color: #E5E5E5; font-size: 15px;">✓ Include in your newsletter</p>
                    <p style="margin: 0 0 12px 0; color: #E5E5E5; font-size: 15px;">✓ Feature on your website</p>
                    <p style="margin: 0; color: #E5E5E5; font-size: 15px;">✓ Track everything in your dashboard</p>
                  </td>
                </tr>
              </table>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 0 0 32px 0;">
                <tr>
                  <td align="center">
                    <a href="${frontendUrl}/affiliates/dashboard" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #F5C518 0%, #D4A90E 100%); color: #0A0A0A; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 16px;">Go to Dashboard →</a>
                  </td>
                </tr>
              </table>

              <p style="margin: 0; color: #D4D4D4; font-size: 15px;">
                <strong style="color: #FFFFFF;">Best regards,</strong><br>
                <span style="color: #A3A3A3;">The Helwa AI Team</span>
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px 48px; background: linear-gradient(180deg, #111213 0%, #0A0A0A 100%); border-top: 1px solid rgba(245, 197, 24, 0.15); border-radius: 0 0 12px 12px;">
              <p style="margin: 0; color: #737373; font-size: 12px; text-align: center;">
                © ${new Date().getFullYear()} Helwa AI. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `
    })

    console.log('✅ [EMAIL SUCCESS] Setup completion email sent!')
    console.log(`   → Email ID: ${data.id}`)
    return true
  } catch (error) {
    console.error('❌ [EMAIL ERROR] Failed to send setup completion email')
    console.error(`   → Error: ${error.message}`)
    return false
  }
}

/**
 * Send beta welcome email with email verification link
 * @param {string} email - User's email
 * @param {string} firstName - User's first name
 * @param {string} position - Position in beta program
 * @param {boolean} isFree - Is this a free slot?
 * @param {string} verificationToken - Email verification token
 * @returns {Promise<boolean>}
 */
const sendBetaWelcomeEmail = async (email, firstName, position, isFree, verificationToken) => {
  console.log('📧 [EMAIL] Sending beta welcome email...')
  console.log(`   → To: ${email}`)
  console.log(`   → Position: #${position}`)
  console.log(`   → Type: ${isFree ? 'FREE' : 'PAID'}`)

  try {
    const resendClient = getResendClient()
    if (!resendClient) {
      console.error('❌ [EMAIL] Cannot send - Resend client not initialized')
      return false
    }

    const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'
    const fromName = process.env.EMAIL_FROM_NAME || 'Helwa AI'
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000'
    const verificationUrl = `${frontendUrl}/beta/verify?token=${verificationToken}`

    const data = await resendClient.emails.send({
      from: `${fromName} <${fromEmail}>`,
      to: [email],
      subject: `🎉 Welcome to Helwa AI Beta! - Position #${position}`,
      html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Beta</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0A0A0A;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #0A0A0A; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #111213; border-radius: 12px; max-width: 600px; border: 1px solid rgba(245, 197, 24, 0.2);">
          <tr>
            <td style="background: linear-gradient(90deg, #F5C518 0%, #D4A90E 50%, #F5C518 100%); height: 4px; border-radius: 12px 12px 0 0;"></td>
          </tr>
          <tr>
            <td style="padding: 48px 48px 32px 48px; text-align: center;">
              <div style="font-size: 64px; margin-bottom: 16px;">🐝</div>
              <h1 style="margin: 0; color: #FFFFFF; font-size: 32px; font-weight: 700;">Welcome to Beta!</h1>
              <p style="margin: 8px 0 0 0; color: #A3A3A3; font-size: 14px;">Position #${position}</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 48px; background-color: #111213;">
              <p style="margin: 0 0 16px 0; color: #FFFFFF; font-size: 18px; font-weight: 600;">
                Hi <strong style="color: #F5C518;">${firstName}</strong>!
              </p>
              <p style="margin: 0 0 32px 0; color: #D4D4D4; font-size: 16px;">
                Congratulations! You've secured position #${position} in the Helwa AI Beta Program${isFree ? ' <strong style="color: #F5C518;">(FREE ACCESS)</strong>' : ''}.
              </p>

              ${isFree ? `
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 0 0 32px 0;">
                <tr>
                  <td style="padding: 20px; background: linear-gradient(135deg, #F5C518 0%, #D4A90E 100%); border-radius: 12px; text-align: center;">
                    <p style="margin: 0; color: #0A0A0A; font-size: 18px; font-weight: 800;">🎁 FREE BETA ACCESS</p>
                    <p style="margin: 8px 0 0 0; color: #0A0A0A; font-size: 14px; font-weight: 600;">You're in the first 20!</p>
                  </td>
                </tr>
              </table>
              ` : `
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 0 0 32px 0;">
                <tr>
                  <td style="padding: 20px; background: rgba(245, 197, 24, 0.1); border: 2px solid #F5C518; border-radius: 12px; text-align: center;">
                    <p style="margin: 0 0 8px 0; color: #F5C518; font-size: 16px; font-weight: 700;">Beta Access: $49.99 one-time</p>
                    <p style="margin: 0; color: #A3A3A3; font-size: 14px;">After verification, you'll be directed to payment (valid until Dec 31, 2025)</p>
                  </td>
                </tr>
              </table>
              `}

              <h2 style="margin: 0 0 20px 0; color: #F5C518; font-size: 22px; font-weight: 700;">Next Step: Verify Your Email</h2>
              
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 0 0 32px 0;">
                <tr>
                  <td align="center">
                    <a href="${verificationUrl}" style="display: inline-block; padding: 18px 48px; background: linear-gradient(135deg, #F5C518 0%, #D4A90E 100%); color: #0A0A0A; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 16px; box-shadow: 0 8px 24px rgba(245, 197, 24, 0.4);">
                      Verify Email & Continue →
                    </a>
                  </td>
                </tr>
              </table>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 0 0 32px 0;">
                <tr>
                  <td style="padding: 20px; background-color: rgba(245, 197, 24, 0.05); border-left: 4px solid #F5C518; border-radius: 8px;">
                    <p style="margin: 0 0 12px 0; color: #F5C518; font-size: 15px; font-weight: 700;">After verification:</p>
                    <p style="margin: 0 0 8px 0; color: #E5E5E5; font-size: 14px;">✓ Log in to your dashboard</p>
                    <p style="margin: 0 0 8px 0; color: #E5E5E5; font-size: 14px;">${isFree ? '✓ Get instant Discord access (FREE!)' : '✓ Complete payment to unlock Discord'}</p>
                    <p style="margin: 0; color: #E5E5E5; font-size: 14px;">✓ Start receiving trading signals</p>
                  </td>
                </tr>
              </table>

              <p style="margin: 24px 0 0 0; color: #A3A3A3; font-size: 13px; line-height: 1.6;">
                This link expires in 24 hours. If you didn't sign up for the beta program, please ignore this email.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px 48px; background: linear-gradient(180deg, #111213 0%, #0A0A0A 100%); border-top: 1px solid rgba(245, 197, 24, 0.15); border-radius: 0 0 12px 12px;">
              <p style="margin: 0; color: #737373; font-size: 12px; text-align: center;">
                © ${new Date().getFullYear()} Helwa AI. All rights reserved.
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
    })

    console.log('✅ [EMAIL SUCCESS] Beta welcome email sent!')
    console.log(`   → Email ID: ${data.id}`)
    return true
  } catch (error) {
    console.error('❌ [EMAIL ERROR] Failed to send beta welcome email')
    console.error(`   → Error: ${error.message}`)
    return false
  }
}

/**
 * Send Discord invite email
 * @param {string} email - User's email
 * @param {string} firstName - User's first name
 * @param {string} discordToken - Discord invite token
 * @returns {Promise<boolean>}
 */
const sendDiscordInviteEmail = async (email, firstName, discordToken) => {
  console.log('📧 [EMAIL] Sending Discord invite email...')
  console.log(`   → To: ${email}`)

  try {
    const resendClient = getResendClient()
    if (!resendClient) {
      console.error('❌ [EMAIL] Cannot send - Resend client not initialized')
      return false
    }

    const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'
    const fromName = process.env.EMAIL_FROM_NAME || 'Helwa AI'
    const discordServerInvite = process.env.DISCORD_SERVER_INVITE_URL || 'https://discord.gg/your-server'
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000'

    const data = await resendClient.emails.send({
      from: `${fromName} <${fromEmail}>`,
      to: [email],
      subject: `🎮 Your Discord Access is Ready! - Helwa AI Beta`,
      html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Discord Access Ready</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0A0A0A;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #0A0A0A; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #111213; border-radius: 12px; max-width: 600px; border: 1px solid rgba(245, 197, 24, 0.2);">
          <tr>
            <td style="background: linear-gradient(90deg, #F5C518 0%, #D4A90E 50%, #F5C518 100%); height: 4px; border-radius: 12px 12px 0 0;"></td>
          </tr>
          <tr>
            <td style="padding: 48px 48px 32px 48px; text-align: center;">
              <div style="font-size: 64px; margin-bottom: 16px;">🎮</div>
              <h1 style="margin: 0; color: #FFFFFF; font-size: 32px; font-weight: 700;">Join Our Discord!</h1>
              <p style="margin: 8px 0 0 0; color: #A3A3A3; font-size: 14px;">Your access is ready</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 48px; background-color: #111213;">
              <p style="margin: 0 0 16px 0; color: #FFFFFF; font-size: 18px; font-weight: 600;">
                Hey <strong style="color: #F5C518;">${firstName}</strong>!
              </p>
              <p style="margin: 0 0 32px 0; color: #D4D4D4; font-size: 16px;">
                Your beta access is confirmed! Follow these steps to join our exclusive Discord community and start receiving trading signals.
              </p>

              <h2 style="margin: 0 0 20px 0; color: #F5C518; font-size: 22px; font-weight: 700;">How to Join:</h2>
              
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 0 0 32px 0;">
                <tr>
                  <td style="padding: 24px; background-color: rgba(245, 197, 24, 0.05); border: 1px solid rgba(245, 197, 24, 0.15); border-radius: 10px;">
                    <p style="margin: 0 0 16px 0; color: #F5C518; font-size: 16px; font-weight: 700;">Step 1: Join the Server</p>
                    <p style="margin: 0 0 20px 0; color: #D4D4D4; font-size: 14px;">Click the button below to join our Discord server.</p>
                    
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 0 0 24px 0;">
                      <tr>
                        <td align="center">
                          <a href="${discordServerInvite}" style="display: inline-block; padding: 14px 32px; background: #5865F2; color: #FFFFFF; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px;">
                            Join Discord Server →
                          </a>
                        </td>
                      </tr>
                    </table>

                    <p style="margin: 0 0 16px 0; color: #F5C518; font-size: 16px; font-weight: 700;">Step 2: Verify Your Access</p>
                    <p style="margin: 0 0 20px 0; color: #D4D4D4; font-size: 14px;">Choose one of these two methods:</p>
                    
                    <div style="margin: 0 0 20px 0; padding: 16px; background: rgba(34, 197, 94, 0.1); border: 1px solid rgba(34, 197, 94, 0.3); border-radius: 8px;">
                      <p style="margin: 0 0 12px 0; color: #22C55E; font-size: 14px; font-weight: 700;">Option A: One-Click Verification (Easiest)</p>
                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                        <tr>
                          <td align="center">
                            <a href="${frontendUrl}/api/beta/verify-discord?token=${discordToken}" style="display: inline-block; padding: 12px 24px; background: #22C55E; color: #FFFFFF; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 15px;">
                              ✓ Verify with One Click
                            </a>
                          </td>
                        </tr>
                      </table>
                    </div>

                    <div style="margin: 0 0 20px 0; padding: 16px; background: rgba(245, 197, 24, 0.1); border: 1px solid rgba(245, 197, 24, 0.3); border-radius: 8px;">
                      <p style="margin: 0 0 12px 0; color: #F5C518; font-size: 14px; font-weight: 700;">Option B: Manual Verification</p>
                      <p style="margin: 0 0 12px 0; color: #D4D4D4; font-size: 13px;">Send this code to our bot in Discord DMs:</p>
                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                        <tr>
                          <td style="padding: 12px; background: linear-gradient(135deg, #F5C518 0%, #D4A90E 100%); border-radius: 6px; text-align: center;">
                            <p style="margin: 0; color: #0A0A0A; font-size: 16px; font-weight: 800; font-family: monospace; word-break: break-all;">${discordToken}</p>
                          </td>
                        </tr>
                      </table>
                    </div>

                    <p style="margin: 0 0 16px 0; color: #F5C518; font-size: 16px; font-weight: 700;">Step 3: Get Access</p>
                    <p style="margin: 0; color: #D4D4D4; font-size: 14px;">Once verified, you'll automatically get the Beta Tester role and access to all channels!</p>
                  </td>
                </tr>
              </table>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 0 0 32px 0;">
                <tr>
                  <td style="padding: 20px; background: rgba(245, 197, 24, 0.08); border-left: 4px solid #F5C518; border-radius: 8px;">
                    <p style="margin: 0 0 8px 0; color: #F5C518; font-size: 14px; font-weight: 700;">💡 Pro Tips:</p>
                    <p style="margin: 0 0 8px 0; color: #D4D4D4; font-size: 13px;">• Make sure your Discord DMs are enabled</p>
                    <p style="margin: 0 0 8px 0; color: #D4D4D4; font-size: 13px;">• Copy your verification code (it's unique to you)</p>
                    <p style="margin: 0; color: #D4D4D4; font-size: 13px;">• This code expires in 7 days</p>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 8px 0; color: #D4D4D4; font-size: 15px;">
                Need help? Reply to this email or tag @admin in Discord.
              </p>
              <p style="margin: 24px 0 0 0; color: #D4D4D4; font-size: 15px;">
                <strong style="color: #FFFFFF;">See you in Discord!</strong><br>
                <span style="color: #A3A3A3;">The Helwa AI Team</span>
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px 48px; background: linear-gradient(180deg, #111213 0%, #0A0A0A 100%); border-top: 1px solid rgba(245, 197, 24, 0.15); border-radius: 0 0 12px 12px;">
              <p style="margin: 0; color: #737373; font-size: 12px; text-align: center;">
                © ${new Date().getFullYear()} Helwa AI. All rights reserved.
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
    })

    console.log('✅ [EMAIL SUCCESS] Discord invite email sent!')
    console.log(`   → Email ID: ${data.id}`)
    return true
  } catch (error) {
    console.error('❌ [EMAIL ERROR] Failed to send Discord invite email')
    console.error(`   → Error: ${error.message}`)
    return false
  }
}

/**
 * Send payment confirmation email
 * @param {string} email - User's email
 * @param {string} firstName - User's first name
 * @returns {Promise<boolean>}
 */
const sendPaymentConfirmationEmail = async (email, firstName) => {
  console.log('📧 [EMAIL] Sending payment confirmation email...')
  console.log(`   → To: ${email}`)

  try {
    const resendClient = getResendClient()
    if (!resendClient) {
      console.error('❌ [EMAIL] Cannot send - Resend client not initialized')
      return false
    }

    const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'
    const fromName = process.env.EMAIL_FROM_NAME || 'Helwa AI'

    const data = await resendClient.emails.send({
      from: `${fromName} <${fromEmail}>`,
      to: [email],
      subject: `✅ Payment Confirmed - Welcome to Helwa AI Beta!`,
      html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payment Confirmed</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0A0A0A;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #0A0A0A; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #111213; border-radius: 12px; max-width: 600px; border: 1px solid rgba(245, 197, 24, 0.2);">
          <tr>
            <td style="background: linear-gradient(90deg, #F5C518 0%, #D4A90E 50%, #F5C518 100%); height: 4px; border-radius: 12px 12px 0 0;"></td>
          </tr>
          <tr>
            <td style="padding: 48px 48px 32px 48px; text-align: center;">
              <div style="font-size: 64px; margin-bottom: 16px;">✅</div>
              <h1 style="margin: 0; color: #FFFFFF; font-size: 32px; font-weight: 700;">Payment Confirmed!</h1>
              <p style="margin: 8px 0 0 0; color: #A3A3A3; font-size: 14px;">Beta Access Activated</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 48px; background-color: #111213;">
              <p style="margin: 0 0 16px 0; color: #FFFFFF; font-size: 18px; font-weight: 600;">
                Welcome <strong style="color: #F5C518;">${firstName}</strong>!
              </p>
              <p style="margin: 0 0 32px 0; color: #D4D4D4; font-size: 16px;">
                Your payment of $49.99 (one-time) has been confirmed and your beta access is now active! Check your inbox for your Discord invite.
              </p>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 0 0 32px 0;">
                <tr>
                  <td style="padding: 24px; background: linear-gradient(135deg, rgba(245, 197, 24, 0.15) 0%, rgba(212, 169, 14, 0.08) 100%); border: 1px solid rgba(245, 197, 24, 0.3); border-radius: 10px;">
                    <p style="margin: 0 0 16px 0; color: #F5C518; font-size: 16px; font-weight: 700;">✓ Payment Complete</p>
                    <p style="margin: 0 0 8px 0; color: #D4D4D4; font-size: 14px;">Amount: $49.99 (one-time payment)</p>
                    <p style="margin: 0 0 8px 0; color: #D4D4D4; font-size: 14px;">Access valid until: December 31, 2025</p>
                    <p style="margin: 0; color: #A3A3A3; font-size: 13px;">No recurring charges - you're all set!</p>
                  </td>
                </tr>
              </table>

              <h2 style="margin: 0 0 16px 0; color: #F5C518; font-size: 20px; font-weight: 700;">What's Next?</h2>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 0 0 32px 0;">
                <tr>
                  <td style="padding: 20px; background-color: rgba(245, 197, 24, 0.05); border-left: 4px solid #F5C518; border-radius: 8px;">
                    <p style="margin: 0 0 12px 0; color: #E5E5E5; font-size: 14px;">✓ Check your email for Discord invite</p>
                    <p style="margin: 0 0 12px 0; color: #E5E5E5; font-size: 14px;">✓ Join our exclusive Discord server</p>
                    <p style="margin: 0 0 12px 0; color: #E5E5E5; font-size: 14px;">✓ Complete verification to get beta role</p>
                    <p style="margin: 0; color: #E5E5E5; font-size: 14px;">✓ Start receiving trading signals!</p>
                  </td>
                </tr>
              </table>

              <p style="margin: 24px 0 0 0; color: #D4D4D4; font-size: 15px;">
                <strong style="color: #FFFFFF;">Welcome aboard!</strong><br>
                <span style="color: #A3A3A3;">The Helwa AI Team</span>
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px 48px; background: linear-gradient(180deg, #111213 0%, #0A0A0A 100%); border-top: 1px solid rgba(245, 197, 24, 0.15); border-radius: 0 0 12px 12px;">
              <p style="margin: 0; color: #737373; font-size: 12px; text-align: center;">
                © ${new Date().getFullYear()} Helwa AI. All rights reserved.
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
    })

    console.log('✅ [EMAIL SUCCESS] Payment confirmation email sent!')
    console.log(`   → Email ID: ${data.id}`)
    return true
  } catch (error) {
    console.error('❌ [EMAIL ERROR] Failed to send payment confirmation email')
    console.error(`   → Error: ${error.message}`)
    return false
  }
}

/**
 * Send password reset email
 * @param {string} email - User's email
 * @param {string} firstName - User's first name
 * @param {string} resetToken - Password reset token
 * @returns {Promise<boolean>}
 */
const sendPasswordResetEmail = async (email, firstName, resetToken) => {
  console.log('📧 [EMAIL] Sending password reset email...')
  console.log(`   → To: ${email}`)

  try {
    const resendClient = getResendClient()
    if (!resendClient) {
      console.error('❌ [EMAIL] Cannot send - Resend client not initialized')
      return false
    }

    const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'
    const fromName = process.env.EMAIL_FROM_NAME || 'Helwa AI'
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000'
    const resetUrl = `${frontendUrl}/auth/reset-password?token=${resetToken}`

    const data = await resendClient.emails.send({
      from: `${fromName} <${fromEmail}>`,
      to: [email],
      subject: `🔐 Reset Your Password - Helwa AI`,
      html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0A0A0A;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #0A0A0A; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #111213; border-radius: 12px; max-width: 600px; border: 1px solid rgba(245, 197, 24, 0.2);">
          <tr>
            <td style="background: linear-gradient(90deg, #F5C518 0%, #D4A90E 50%, #F5C518 100%); height: 4px; border-radius: 12px 12px 0 0;"></td>
          </tr>
          <tr>
            <td style="padding: 48px 48px 32px 48px; text-align: center;">
              <div style="font-size: 64px; margin-bottom: 16px;">🔐</div>
              <h1 style="margin: 0; color: #FFFFFF; font-size: 32px; font-weight: 700;">Reset Your Password</h1>
              <p style="margin: 8px 0 0 0; color: #A3A3A3; font-size: 14px;">Secure access to your account</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 48px; background-color: #111213;">
              <p style="margin: 0 0 16px 0; color: #FFFFFF; font-size: 18px; font-weight: 600;">
                Hi <strong style="color: #F5C518;">${firstName}</strong>,
              </p>
              <p style="margin: 0 0 32px 0; color: #D4D4D4; font-size: 16px;">
                We received a request to reset your password for your Helwa AI account. Click the button below to create a new password.
              </p>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 0 0 32px 0;">
                <tr>
                  <td align="center">
                    <a href="${resetUrl}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(90deg, #F5C518 0%, #D4A90E 100%); color: #0A0A0A; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 16px;">
                      Reset Password
                    </a>
                  </td>
                </tr>
              </table>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 0 0 32px 0;">
                <tr>
                  <td style="padding: 20px; background: rgba(239, 68, 68, 0.1); border-left: 4px solid #EF4444; border-radius: 8px;">
                    <p style="margin: 0 0 8px 0; color: #EF4444; font-size: 14px; font-weight: 700;">⏱️  This link expires in 1 hour</p>
                    <p style="margin: 0; color: #D4D4D4; font-size: 13px;">For your security, this password reset link will expire in 60 minutes.</p>
                  </td>
                </tr>
              </table>

              <div style="background: rgba(245, 197, 24, 0.05); border: 1px solid rgba(245, 197, 24, 0.2); border-radius: 8px; padding: 16px; margin: 0 0 32px 0;">
                <p style="margin: 0 0 8px 0; color: #F5C518; font-size: 13px; font-weight: 700;">Or copy and paste this link:</p>
                <p style="margin: 0; color: #A3A3A3; font-size: 12px; word-break: break-all; font-family: monospace;">${resetUrl}</p>
              </div>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 0 0 24px 0;">
                <tr>
                  <td style="padding: 20px; background: rgba(245, 197, 24, 0.08); border-left: 4px solid #F5C518; border-radius: 8px;">
                    <p style="margin: 0 0 8px 0; color: #F5C518; font-size: 14px; font-weight: 700;">Didn't request this?</p>
                    <p style="margin: 0; color: #D4D4D4; font-size: 13px;">If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
                  </td>
                </tr>
              </table>

              <p style="margin: 0; color: #A3A3A3; font-size: 13px; line-height: 1.6;">
                Need help? Reply to this email or contact us at support@helwa.ai
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px 48px; background: linear-gradient(180deg, #111213 0%, #0A0A0A 100%); border-top: 1px solid rgba(245, 197, 24, 0.15); border-radius: 0 0 12px 12px;">
              <p style="margin: 0; color: #737373; font-size: 12px; text-align: center;">
                © ${new Date().getFullYear()} Helwa AI. All rights reserved.
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
    })

    console.log('✅ [EMAIL SUCCESS] Password reset email sent!')
    console.log(`   → Email ID: ${data.id}`)
    return true
  } catch (error) {
    console.error('❌ [EMAIL ERROR] Failed to send password reset email')
    console.error(`   → Error: ${error.message}`)
    return false
  }
}

/**
 * Send password changed confirmation email
 * @param {string} email - User's email
 * @param {string} firstName - User's first name
 * @returns {Promise<boolean>}
 */
const sendPasswordChangedEmail = async (email, firstName) => {
  console.log('📧 [EMAIL] Sending password changed confirmation...')
  console.log(`   → To: ${email}`)

  try {
    const resendClient = getResendClient()
    if (!resendClient) {
      console.error('❌ [EMAIL] Cannot send - Resend client not initialized')
      return false
    }

    const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'
    const fromName = process.env.EMAIL_FROM_NAME || 'Helwa AI'

    const data = await resendClient.emails.send({
      from: `${fromName} <${fromEmail}>`,
      to: [email],
      subject: `✅ Password Successfully Changed - Helwa AI`,
      html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Changed</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0A0A0A;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #0A0A0A; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #111213; border-radius: 12px; max-width: 600px; border: 1px solid rgba(34, 197, 94, 0.3);">
          <tr>
            <td style="background: linear-gradient(90deg, #22C55E 0%, #16A34A 100%); height: 4px; border-radius: 12px 12px 0 0;"></td>
          </tr>
          <tr>
            <td style="padding: 48px 48px 32px 48px; text-align: center;">
              <div style="font-size: 64px; margin-bottom: 16px;">✅</div>
              <h1 style="margin: 0; color: #FFFFFF; font-size: 32px; font-weight: 700;">Password Changed</h1>
              <p style="margin: 8px 0 0 0; color: #A3A3A3; font-size: 14px;">Your account is secure</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 48px; background-color: #111213;">
              <p style="margin: 0 0 16px 0; color: #FFFFFF; font-size: 18px; font-weight: 600;">
                Hi <strong style="color: #22C55E;">${firstName}</strong>,
              </p>
              <p style="margin: 0 0 32px 0; color: #D4D4D4; font-size: 16px;">
                Your password for your Helwa AI account has been successfully changed.
              </p>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 0 0 32px 0;">
                <tr>
                  <td style="padding: 24px; background: rgba(34, 197, 94, 0.1); border: 1px solid rgba(34, 197, 94, 0.3); border-radius: 10px;">
                    <p style="margin: 0 0 12px 0; color: #22C55E; font-size: 16px; font-weight: 700;">✓ Password Updated</p>
                    <p style="margin: 0 0 8px 0; color: #D4D4D4; font-size: 14px;">Time: ${new Date().toLocaleString('en-US', { timeZone: 'UTC' })} UTC</p>
                    <p style="margin: 0; color: #A3A3A3; font-size: 13px;">You can now log in with your new password.</p>
                  </td>
                </tr>
              </table>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 0 0 24px 0;">
                <tr>
                  <td style="padding: 20px; background: rgba(239, 68, 68, 0.1); border-left: 4px solid #EF4444; border-radius: 8px;">
                    <p style="margin: 0 0 8px 0; color: #EF4444; font-size: 14px; font-weight: 700;">⚠️  Didn't make this change?</p>
                    <p style="margin: 0; color: #D4D4D4; font-size: 13px;">If you didn't change your password, please contact us immediately at <a href="mailto:support@helwa.ai" style="color: #F5C518; text-decoration: none;">support@helwa.ai</a></p>
                  </td>
                </tr>
              </table>

              <p style="margin: 0; color: #D4D4D4; font-size: 15px;">
                <strong style="color: #FFFFFF;">Stay secure!</strong><br>
                <span style="color: #A3A3A3;">The Helwa AI Team</span>
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px 48px; background: linear-gradient(180deg, #111213 0%, #0A0A0A 100%); border-top: 1px solid rgba(34, 197, 94, 0.15); border-radius: 0 0 12px 12px;">
              <p style="margin: 0; color: #737373; font-size: 12px; text-align: center;">
                © ${new Date().getFullYear()} Helwa AI. All rights reserved.
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
    })

    console.log('✅ [EMAIL SUCCESS] Password changed confirmation sent!')
    console.log(`   → Email ID: ${data.id}`)
    return true
  } catch (error) {
    console.error('❌ [EMAIL ERROR] Failed to send password changed confirmation')
    console.error(`   → Error: ${error.message}`)
    return false
  }
}

module.exports = {
  sendWaitlistConfirmation,
  sendContactNotification,
  sendAffiliateApplicationEmail,
  sendAffiliateApprovalEmail,
  sendAffiliateWelcomeEmail,
  sendAffiliateSetupCompleteEmail,
  // Beta program emails
  sendBetaWelcomeEmail,
  sendDiscordInviteEmail,
  sendPaymentConfirmationEmail,
  // Auth emails
  sendPasswordResetEmail,
  sendPasswordChangedEmail,
}
