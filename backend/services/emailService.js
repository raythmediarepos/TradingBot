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
      subject: `You're on the Honeypot AI Waitlist – Position #${position}`,
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
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background: linear-gradient(135deg, #FFF9E6 0%, #FFF4D6 100%); line-height: 1.6;">
  
  <!-- Main Container -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background: linear-gradient(135deg, #FFF9E6 0%, #FFF4D6 100%); padding: 20px 0;">
    <tr>
      <td align="center">
        
        <!-- Decorative Bees at Top -->
        <div style="text-align: center; font-size: 24px; margin-bottom: 16px; letter-spacing: 40px;">
          🐝🐝🐝
        </div>
        
        <!-- Email Content -->
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 16px; box-shadow: 0 8px 24px rgba(245, 158, 11, 0.15); max-width: 600px; border: 3px solid #FBBF24; position: relative; overflow: hidden;">
          
          <!-- Honey Drip Effect Header -->
          <tr>
            <td style="background: linear-gradient(180deg, #FBBF24 0%, #F59E0B 100%); padding: 0; position: relative;">
              <!-- Dripping honey SVG effect -->
              <div style="position: relative; height: 8px; background: #FBBF24;">
                <div style="position: absolute; bottom: -6px; left: 10%; width: 30px; height: 12px; background: #FBBF24; border-radius: 0 0 50% 50%;"></div>
                <div style="position: absolute; bottom: -8px; left: 30%; width: 25px; height: 14px; background: #F59E0B; border-radius: 0 0 50% 50%;"></div>
                <div style="position: absolute; bottom: -10px; left: 50%; width: 35px; height: 16px; background: #FBBF24; border-radius: 0 0 50% 50%;"></div>
                <div style="position: absolute; bottom: -7px; left: 70%; width: 28px; height: 13px; background: #F59E0B; border-radius: 0 0 50% 50%;"></div>
                <div style="position: absolute; bottom: -9px; left: 85%; width: 32px; height: 15px; background: #FBBF24; border-radius: 0 0 50% 50%;"></div>
              </div>
            </td>
          </tr>
          
          <!-- Header with Logo and Honeycomb Pattern -->
          <tr>
            <td style="padding: 40px 48px 32px 48px; text-align: center; background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%); border-bottom: 3px solid #FBBF24; position: relative;">
              <!-- Honeycomb Background Pattern -->
              <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; opacity: 0.1; background-image: repeating-linear-gradient(30deg, #F59E0B 0px, #F59E0B 1px, transparent 1px, transparent 10px), repeating-linear-gradient(-30deg, #F59E0B 0px, #F59E0B 1px, transparent 1px, transparent 10px);"></div>
              
              <div style="position: relative; z-index: 1;">
                <div style="font-size: 48px; margin-bottom: 12px; text-shadow: 2px 2px 4px rgba(0,0,0,0.1);">
                  🐝🍯
                </div>
                <h1 style="margin: 0; color: #78350F; font-size: 32px; font-weight: 700; letter-spacing: -0.5px; text-shadow: 1px 1px 2px rgba(255,255,255,0.8);">
                  Honeypot AI
                </h1>
                <p style="margin: 8px 0 0 0; color: #92400E; font-size: 15px; font-weight: 600; letter-spacing: 1px;">
                  🌙 Halal-First Trading Intelligence
                </p>
              </div>
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="padding: 40px 48px;">
              
              <!-- Greeting with Bee -->
              <p style="margin: 0 0 8px 0; color: #1f2937; font-size: 16px; line-height: 1.5;">
                <span style="font-size: 20px; margin-right: 8px;">🐝</span> Hi <strong>${firstName}</strong>,
              </p>
              
              <p style="margin: 0 0 32px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                Thank you for joining the Honeypot AI waitlist! We're excited to have you as part of our early <strong style="color: #F59E0B;">hive</strong>. 🍯
              </p>
              
              <!-- Position Badge with Honeycomb Design -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 0 0 32px 0;">
                <tr>
                  <td align="center" style="padding: 32px; background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 50%, #FCD34D 100%); border-radius: 16px; border: 4px solid #FBBF24; box-shadow: 0 4px 12px rgba(251, 191, 36, 0.3); position: relative;">
                    <!-- Honeycomb Pattern Overlay -->
                    <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; opacity: 0.15; background-image: repeating-linear-gradient(30deg, #F59E0B 0px, #F59E0B 2px, transparent 2px, transparent 12px), repeating-linear-gradient(-30deg, #F59E0B 0px, #F59E0B 2px, transparent 2px, transparent 12px); border-radius: 12px;"></div>
                    
                    <!-- Badge Content -->
                    <div style="position: relative; z-index: 1;">
                      <div style="font-size: 32px; margin-bottom: 8px;">
                        🍯
                      </div>
                      <p style="margin: 0 0 12px 0; color: #78350f; font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">
                        Your Spot in the Hive
                      </p>
                      <p style="margin: 0; color: #1f2937; font-size: 48px; font-weight: 800; line-height: 1; text-shadow: 2px 2px 0px rgba(255,255,255,0.5);">
                        #${position}
                      </p>
                      <div style="margin-top: 12px; display: inline-block; background-color: #10B981; color: white; padding: 6px 16px; border-radius: 20px; font-size: 12px; font-weight: 700; box-shadow: 0 2px 4px rgba(16, 185, 129, 0.3);">
                        ✓ CONFIRMED
                      </div>
                    </div>
                    
                    <!-- Decorative Bees -->
                    <div style="position: absolute; top: -10px; right: -10px; font-size: 28px; transform: rotate(15deg);">
                      🐝
                    </div>
                    <div style="position: absolute; bottom: -8px; left: -8px; font-size: 24px; transform: rotate(-25deg);">
                      🐝
                    </div>
                  </td>
                </tr>
              </table>
              
              <!-- About Section with Honey Jar -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 0 0 32px 0;">
                <tr>
                  <td style="text-align: center;">
                    <div style="font-size: 40px; margin-bottom: 16px;">🍯</div>
                    <h2 style="margin: 0 0 16px 0; color: #78350F; font-size: 22px; font-weight: 700; line-height: 1.3;">
                      About Honeypot AI
                    </h2>
                    <p style="margin: 0; color: #4b5563; font-size: 15px; line-height: 1.7;">
                      We're building the first AI-powered trading assistant designed with Islamic principles at its core. Our platform provides real-time, halal-compliant trading signals with complete transparency on every recommendation.
                    </p>
                  </td>
                </tr>
              </table>
              
              <!-- Features Section with Honeycomb Cells -->
              <h2 style="margin: 0 0 20px 0; color: #78350F; font-size: 22px; font-weight: 700; line-height: 1.3; text-align: center;">
                🐝 What You'll Get
              </h2>
              
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 0 0 32px 0;">
                <tr>
                  <td style="padding: 20px; background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%); border: 3px solid #FBBF24; border-radius: 12px; position: relative;">
                    <!-- Honeycomb pattern background -->
                    <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; opacity: 0.08; background-image: repeating-linear-gradient(30deg, #F59E0B 0px, #F59E0B 2px, transparent 2px, transparent 15px), repeating-linear-gradient(-30deg, #F59E0B 0px, #F59E0B 2px, transparent 2px, transparent 15px); border-radius: 9px;"></div>
                    
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="position: relative; z-index: 1;">
                      <tr>
                        <td style="padding: 12px 0;">
                          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                            <tr>
                              <td width="30" valign="top">
                                <div style="width: 26px; height: 26px; background: linear-gradient(135deg, #10B981 0%, #059669 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px; color: white; font-weight: bold; box-shadow: 0 2px 4px rgba(16, 185, 129, 0.3);">✓</div>
                              </td>
                              <td style="color: #1F2937; font-size: 15px; line-height: 1.6; font-weight: 500;">
                                Real-time buy/sell signals for halal-compliant stocks
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 12px 0;">
                          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                            <tr>
                              <td width="30" valign="top">
                                <div style="width: 26px; height: 26px; background: linear-gradient(135deg, #10B981 0%, #059669 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px; color: white; font-weight: bold; box-shadow: 0 2px 4px rgba(16, 185, 129, 0.3);">✓</div>
                              </td>
                              <td style="color: #1F2937; font-size: 15px; line-height: 1.6; font-weight: 500;">
                                Detailed rationale and risk analysis for every trade
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 12px 0;">
                          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                            <tr>
                              <td width="30" valign="top">
                                <div style="width: 26px; height: 26px; background: linear-gradient(135deg, #10B981 0%, #059669 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px; color: white; font-weight: bold; box-shadow: 0 2px 4px rgba(16, 185, 129, 0.3);">✓</div>
                              </td>
                              <td style="color: #1F2937; font-size: 15px; line-height: 1.6; font-weight: 500;">
                                Automatic screening: No options, no haram sectors
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 12px 0;">
                          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                            <tr>
                              <td width="30" valign="top">
                                <div style="width: 26px; height: 26px; background: linear-gradient(135deg, #10B981 0%, #059669 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px; color: white; font-weight: bold; box-shadow: 0 2px 4px rgba(16, 185, 129, 0.3);">✓</div>
                              </td>
                              <td style="color: #1F2937; font-size: 15px; line-height: 1.6; font-weight: 500;">
                                Direct delivery to your Discord server
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 12px 0;">
                          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                            <tr>
                              <td width="30" valign="top">
                                <div style="width: 26px; height: 26px; background: linear-gradient(135deg, #10B981 0%, #059669 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px; color: white; font-weight: bold; box-shadow: 0 2px 4px rgba(16, 185, 129, 0.3);">✓</div>
                              </td>
                              <td style="color: #1F2937; font-size: 15px; line-height: 1.6; font-weight: 500;">
                                Educational resources on halal investing
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              <!-- Timeline Section with Honey Drips -->
              <h2 style="margin: 0 0 20px 0; color: #78350F; font-size: 22px; font-weight: 700; line-height: 1.3; text-align: center;">
                📅 Launch Timeline
              </h2>
              
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 0 0 32px 0; border: 3px solid #FBBF24; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 8px rgba(251, 191, 36, 0.2);">
                <tr>
                  <td style="padding: 18px 24px; background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%); border-bottom: 2px solid #FBBF24;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td width="40" style="font-size: 24px;">🍯</td>
                        <td>
                          <p style="margin: 0 0 4px 0; color: #78350F; font-size: 15px; font-weight: 700;">November 15, 2025</p>
                          <p style="margin: 0; color: #92400E; font-size: 13px; font-weight: 500;">Discord community opens</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 18px 24px; background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%); border-bottom: 2px solid #FBBF24;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td width="40" style="font-size: 24px;">🐝</td>
                        <td>
                          <p style="margin: 0 0 4px 0; color: #78350F; font-size: 15px; font-weight: 700;">December 1, 2025</p>
                          <p style="margin: 0; color: #92400E; font-size: 13px; font-weight: 500;">Beta access for first 100 members</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 18px 24px; background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%);">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td width="40" style="font-size: 24px;">🎉</td>
                        <td>
                          <p style="margin: 0 0 4px 0; color: #78350F; font-size: 15px; font-weight: 700;">January 1, 2026</p>
                          <p style="margin: 0; color: #92400E; font-size: 13px; font-weight: 500;">Full platform launch (v1.0)</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              <!-- Next Steps with Honeycomb -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 0 0 32px 0; background: linear-gradient(135deg, #DBEAFE 0%, #BFDBFE 100%); border-radius: 12px; padding: 24px; border: 2px solid #3B82F6; position: relative; overflow: hidden;">
                <tr>
                  <td>
                    <!-- Light honeycomb pattern -->
                    <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; opacity: 0.05; background-image: repeating-linear-gradient(30deg, #3B82F6 0px, #3B82F6 1px, transparent 1px, transparent 10px), repeating-linear-gradient(-30deg, #3B82F6 0px, #3B82F6 1px, transparent 1px, transparent 10px); border-radius: 10px;"></div>
                    
                    <div style="position: relative; z-index: 1; text-align: center;">
                      <p style="margin: 0 0 4px 0; font-size: 32px;">
                        🐝
                      </p>
                      <p style="margin: 0 0 12px 0; color: #1E40AF; font-size: 16px; font-weight: 700;">
                        What Happens Next?
                      </p>
                      <p style="margin: 0; color: #1E3A8A; font-size: 14px; line-height: 1.7; font-weight: 500;">
                        We'll email you as soon as it's your turn to join. In the meantime, you can follow our progress and connect with early members on our social channels.
                      </p>
                    </div>
                  </td>
                </tr>
              </table>
              
              <!-- CTA Button with Honey Drip -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 0 0 32px 0;">
                <tr>
                  <td align="center">
                    <a href="https://honeypotai.com" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #FCD34D 0%, #FBBF24 50%, #F59E0B 100%); color: #1F2937; text-decoration: none; border-radius: 50px; font-weight: 700; font-size: 16px; box-shadow: 0 4px 12px rgba(251, 191, 36, 0.4); border: 3px solid #F59E0B; text-transform: uppercase; letter-spacing: 0.5px;">
                      🐝 Visit Our Hive →
                    </a>
                  </td>
                </tr>
              </table>
              
              <!-- Closing with Bee -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 0 0 16px 0; background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%); border-radius: 12px; padding: 20px; border: 2px solid #FBBF24;">
                <tr>
                  <td style="text-align: center;">
                    <p style="margin: 0 0 12px 0; color: #78350F; font-size: 15px; line-height: 1.6;">
                      <strong>Have questions?</strong> Just reply to this email – we read every message! 📧
                    </p>
                    <p style="margin: 0; font-size: 24px;">
                      🐝
                    </p>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 0; color: #4b5563; font-size: 15px; line-height: 1.6; text-align: center;">
                <strong style="color: #78350F;">Sweet regards,</strong><br>
                <span style="color: #6b7280;">The Honeypot AI Team 🍯</span>
              </p>
              
            </td>
          </tr>
          
          <!-- Footer with Honeycomb Pattern -->
          <tr>
            <td style="padding: 32px 48px; background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%); border-top: 3px solid #FBBF24; border-radius: 0 0 13px 13px; position: relative;">
              <!-- Honeycomb Pattern -->
              <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; opacity: 0.1; background-image: repeating-linear-gradient(30deg, #F59E0B 0px, #F59E0B 2px, transparent 2px, transparent 12px), repeating-linear-gradient(-30deg, #F59E0B 0px, #F59E0B 2px, transparent 2px, transparent 12px); border-radius: 0 0 10px 10px;"></div>
              
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="position: relative; z-index: 1;">
                <tr>
                  <td align="center">
                    <!-- Bee Divider -->
                    <p style="margin: 0 0 16px 0; font-size: 20px; letter-spacing: 20px;">
                      🐝🍯🐝
                    </p>
                    
                    <p style="margin: 0 0 12px 0; color: #78350F; font-size: 13px; font-weight: 600;">
                      <a href="https://honeypotai.com" style="color: #F59E0B; text-decoration: none; font-weight: 700;">🏠 Website</a>
                      <span style="color: #D97706; margin: 0 10px; font-weight: 700;">•</span>
                      <a href="https://twitter.com/HoneypotAI" style="color: #F59E0B; text-decoration: none; font-weight: 700;">🐦 Twitter</a>
                      <span style="color: #D97706; margin: 0 10px; font-weight: 700;">•</span>
                      <span style="color: #92400E; font-weight: 600;">💬 Discord (Soon)</span>
                    </p>
                    
                    <p style="margin: 0 0 8px 0; color: #92400E; font-size: 12px; line-height: 1.5; font-weight: 600;">
                      © ${new Date().getFullYear()} Honeypot AI. All rights reserved.
                    </p>
                    
                    <p style="margin: 0; color: #B45309; font-size: 11px; line-height: 1.5;">
                      You're receiving this because you joined our hive at honeypotai.com 🍯
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
        </table>
        
        <!-- Bottom Decorative Bees -->
        <div style="text-align: center; font-size: 20px; margin-top: 16px; letter-spacing: 30px;">
          🐝🍯🐝
        </div>
        
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
