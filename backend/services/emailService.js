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
                Honeypot AI
              </h1>
              <p style="margin: 8px 0 0 0; color: #A3A3A3; font-size: 14px; font-weight: 500; letter-spacing: 0.5px;">
                Halal Trading Signals
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
                Thank you for joining the Honeypot AI waitlist! We're excited to have you as part of our early community.
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
                About Honeypot AI
              </h2>
              <p style="margin: 0 0 32px 0; color: #D4D4D4; font-size: 15px; line-height: 1.7;">
                We're building the first AI-powered trading assistant designed with Islamic principles at its core. Our platform provides real-time, halal-compliant trading signals with complete transparency on every recommendation.
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
                          <span style="color: #E5E5E5; font-size: 15px; line-height: 1.6;">Real-time buy/sell signals for halal-compliant stocks</span>
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
                          <span style="color: #E5E5E5; font-size: 15px; line-height: 1.6;">Educational resources on halal investing</span>
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
                    <a href="https://honeypotai.com" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #F5C518 0%, #D4A90E 100%); color: #0A0A0A; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 15px; box-shadow: 0 8px 24px rgba(245, 197, 24, 0.4); letter-spacing: 0.3px;">
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
                <span style="color: #A3A3A3;">The Honeypot AI Team</span>
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
                      <a href="https://honeypotai.com" style="color: #F5C518; text-decoration: none; font-weight: 600; transition: opacity 0.2s;">Website</a>
                      <span style="color: #525252; margin: 0 10px;">•</span>
                      <a href="https://twitter.com/HoneypotAI" style="color: #F5C518; text-decoration: none; font-weight: 600; transition: opacity 0.2s;">Twitter</a>
                      <span style="color: #525252; margin: 0 10px;">•</span>
                      <span style="color: #737373;">Discord (Coming Soon)</span>
                    </p>
                    <p style="margin: 0 0 8px 0; color: #737373; font-size: 12px; line-height: 1.5;">
                      © ${new Date().getFullYear()} Honeypot AI. All rights reserved.
                    </p>
                    <p style="margin: 0; color: #525252; font-size: 11px; line-height: 1.5;">
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
    const fromName = process.env.EMAIL_FROM_NAME || 'Honeypot AI'

    const data = await resendClient.emails.send({
      from: `${fromName} <${fromEmail}>`,
      to: [email],
      subject: `Affiliate Application Received - Honeypot AI`,
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
                Thank you for applying to become a Honeypot AI affiliate! We've received your application and are reviewing it.
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
                Questions? Reply to this email or contact us at <a href="mailto:affiliates@honeypotai.com" style="color: #F5C518; text-decoration: none;">affiliates@honeypotai.com</a>
              </p>
              <p style="margin: 24px 0 0 0; color: #D4D4D4; font-size: 15px;">
                <strong style="color: #FFFFFF;">Best regards,</strong><br>
                <span style="color: #A3A3A3;">The Honeypot AI Team</span>
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px 48px; background: linear-gradient(180deg, #111213 0%, #0A0A0A 100%); border-top: 1px solid rgba(245, 197, 24, 0.15); border-radius: 0 0 12px 12px;">
              <p style="margin: 0; color: #737373; font-size: 12px; text-align: center;">
                © ${new Date().getFullYear()} Honeypot AI. All rights reserved.
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
    const fromName = process.env.EMAIL_FROM_NAME || 'Honeypot AI'
    const frontendUrl = process.env.FRONTEND_URL || 'https://trading-bot-dusky-two.vercel.app'
    const affiliateLink = `${frontendUrl}/?ref=${affiliateCode}`
    const loginUrl = `${frontendUrl}/affiliates/login`

    const data = await resendClient.emails.send({
      from: `${fromName} <${fromEmail}>`,
      to: [email],
      subject: `🎉 You're Approved! Welcome to Honeypot AI Affiliates`,
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
                <span style="color: #A3A3A3;">The Honeypot AI Team</span>
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px 48px; background: linear-gradient(180deg, #111213 0%, #0A0A0A 100%); border-top: 1px solid rgba(245, 197, 24, 0.15); border-radius: 0 0 12px 12px;">
              <p style="margin: 0; color: #737373; font-size: 12px; text-align: center;">
                © ${new Date().getFullYear()} Honeypot AI. All rights reserved.
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
    const fromName = process.env.EMAIL_FROM_NAME || 'Honeypot AI'
    const frontendUrl = process.env.FRONTEND_URL || 'https://trading-bot-dusky-two.vercel.app'
    const loginUrl = `${frontendUrl}/affiliates/login`

    const data = await resendClient.emails.send({
      from: `${fromName} <${fromEmail}>`,
      to: [email],
      subject: `🎉 Welcome to Honeypot AI Affiliates!`,
      html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Honeypot AI Affiliates</title>
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
                Your Honeypot AI affiliate account has been created! To start earning 10% recurring commissions, please log in and complete your profile setup with your address and payment information.
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
                <span style="color: #A3A3A3;">The Honeypot AI Team</span>
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px 48px; background: linear-gradient(180deg, #111213 0%, #0A0A0A 100%); border-top: 1px solid rgba(245, 197, 24, 0.15); border-radius: 0 0 12px 12px;">
              <p style="margin: 0; color: #737373; font-size: 12px; text-align: center;">
                © ${new Date().getFullYear()} Honeypot AI. All rights reserved.
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
    const fromName = process.env.EMAIL_FROM_NAME || 'Honeypot AI'
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
                <span style="color: #A3A3A3;">The Honeypot AI Team</span>
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px 48px; background: linear-gradient(180deg, #111213 0%, #0A0A0A 100%); border-top: 1px solid rgba(245, 197, 24, 0.15); border-radius: 0 0 12px 12px;">
              <p style="margin: 0; color: #737373; font-size: 12px; text-align: center;">
                © ${new Date().getFullYear()} Honeypot AI. All rights reserved.
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

module.exports = {
  sendWaitlistConfirmation,
  sendContactNotification,
  sendAffiliateApplicationEmail,
  sendAffiliateApprovalEmail,
  sendAffiliateWelcomeEmail,
  sendAffiliateSetupCompleteEmail,
}
