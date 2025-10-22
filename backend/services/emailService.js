const nodemailer = require('nodemailer')
require('dotenv').config()

// Create Gmail SMTP transporter
const createTransporter = () => {
  const gmailUser = process.env.GMAIL_USER
  const gmailAppPassword = process.env.GMAIL_APP_PASSWORD

  if (!gmailUser || !gmailAppPassword) {
    console.error('❌ [EMAIL CONFIG] Missing Gmail credentials!')
    console.error('   → GMAIL_USER:', gmailUser ? '✓ Set' : '✗ Missing')
    console.error('   → GMAIL_APP_PASSWORD:', gmailAppPassword ? '✓ Set' : '✗ Missing')
    return null
  }

  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // use SSL
    auth: {
      user: gmailUser,
      pass: gmailAppPassword,
    },
    connectionTimeout: 10000, // 10 seconds
    greetingTimeout: 10000,
    socketTimeout: 10000,
  })
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
    const transporter = createTransporter()
    if (!transporter) {
      console.error('❌ [EMAIL] Cannot create transporter - missing credentials')
      return false
    }

    const fromEmail = process.env.GMAIL_USER
    const fromName = process.env.EMAIL_FROM_NAME || 'Honeypot AI'

    console.log(`   → From: ${fromName} <${fromEmail}>`)
    console.log(`   → Gmail User: ${fromEmail ? '✓ Set' : '✗ Missing'}`)
    console.log(`   → Gmail App Password: ${process.env.GMAIL_APP_PASSWORD ? '✓ Set' : '✗ Missing'}`)

    const mailOptions = {
      from: `"${fromName}" <${fromEmail}>`,
      to: `"${firstName} ${lastName}" <${email}>`,
      subject: `Welcome to Honeypot AI Waitlist - Position #${position}`,
      text: `
Hi ${firstName},

Welcome to the Honeypot AI Trading Bot Waitlist!

You're confirmed at position #${position}.

What's Next?
We're working hard to launch our halal-compliant trading signals platform. You'll be among the first to get access when we go live.

Key Features:
✓ Real-time halal-compliant buy/sell signals
✓ Transparent rationale for every trade
✓ No options, no haram sectors
✓ Delivered directly to Discord

Launch Timeline:
• November 15, 2025: Discord community launch
• December 1, 2025: First 100 beta testers get access
• January 1, 2026: Full Trading Bot v1 release

We'll notify you as soon as it's your turn!

Stay Connected:
• Discord: [Coming Soon]
• Twitter: @HoneypotAI
• Website: https://honeypotai.com

Questions? Just reply to this email.

Best regards,
The Honeypot AI Team

---
Honeypot AI - Halal-first trading alerts
      `.trim(),
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Honeypot AI Waitlist</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0A0A0A; color: #FFFFFF;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #0A0A0A;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color: #111213; border-radius: 12px; border: 1px solid #F5C518;">
          
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(to bottom, #111213, #0A0A0A); border-radius: 12px 12px 0 0;">
              <h1 style="margin: 0; color: #F5C518; font-size: 28px; font-weight: bold;">🍯 Honeypot AI</h1>
              <p style="margin: 10px 0 0; color: #9CA3AF; font-size: 14px;">Halal-first Trading Signals</p>
            </td>
          </tr>
          
          <!-- Welcome Message -->
          <tr>
            <td style="padding: 30px 40px;">
              <h2 style="margin: 0 0 20px; color: #FFFFFF; font-size: 24px;">Hi ${firstName},</h2>
              <p style="margin: 0 0 20px; color: #D1D5DB; font-size: 16px; line-height: 1.6;">
                Welcome to the <strong style="color: #F5C518;">Honeypot AI Trading Bot Waitlist!</strong>
              </p>
              
              <!-- Position Badge -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <div style="display: inline-block; background-color: #F5C518; color: #0A0A0A; padding: 15px 30px; border-radius: 8px; font-weight: bold; font-size: 18px;">
                      ✅ You're Position #${position}
                    </div>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 20px 0; color: #D1D5DB; font-size: 16px; line-height: 1.6;">
                You're confirmed! We're working hard to launch our halal-compliant trading signals platform, and you'll be among the first to get access.
              </p>
            </td>
          </tr>
          
          <!-- Key Features -->
          <tr>
            <td style="padding: 0 40px 30px;">
              <h3 style="margin: 0 0 15px; color: #F5C518; font-size: 20px;">Key Features:</h3>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding: 10px 0;">
                    <span style="color: #10B981; font-size: 18px; margin-right: 10px;">✓</span>
                    <span style="color: #D1D5DB; font-size: 15px;">Real-time halal-compliant buy/sell signals</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 0;">
                    <span style="color: #10B981; font-size: 18px; margin-right: 10px;">✓</span>
                    <span style="color: #D1D5DB; font-size: 15px;">Transparent rationale for every trade</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 0;">
                    <span style="color: #10B981; font-size: 18px; margin-right: 10px;">✓</span>
                    <span style="color: #D1D5DB; font-size: 15px;">No options, no haram sectors</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 0;">
                    <span style="color: #10B981; font-size: 18px; margin-right: 10px;">✓</span>
                    <span style="color: #D1D5DB; font-size: 15px;">Delivered directly to Discord</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Timeline -->
          <tr>
            <td style="padding: 0 40px 30px;">
              <h3 style="margin: 0 0 15px; color: #F5C518; font-size: 20px;">Launch Timeline:</h3>
              <div style="background-color: #0A0A0A; padding: 20px; border-radius: 8px; border-left: 3px solid #F5C518;">
                <p style="margin: 0 0 10px; color: #D1D5DB; font-size: 14px;">
                  <strong style="color: #FFFFFF;">November 15, 2025:</strong> Discord community launch
                </p>
                <p style="margin: 0 0 10px; color: #D1D5DB; font-size: 14px;">
                  <strong style="color: #FFFFFF;">December 1, 2025:</strong> First 100 beta testers get access
                </p>
                <p style="margin: 0; color: #D1D5DB; font-size: 14px;">
                  <strong style="color: #FFFFFF;">January 1, 2026:</strong> Full Trading Bot v1 release
                </p>
              </div>
            </td>
          </tr>
          
          <!-- CTA -->
          <tr>
            <td style="padding: 0 40px 40px;" align="center">
              <p style="margin: 0 0 20px; color: #9CA3AF; font-size: 14px;">
                We'll notify you as soon as it's your turn!
              </p>
              <a href="https://honeypotai.com" style="display: inline-block; background-color: #F5C518; color: #0A0A0A; text-decoration: none; padding: 12px 30px; border-radius: 6px; font-weight: bold; font-size: 16px;">
                Visit Our Website
              </a>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #0A0A0A; border-radius: 0 0 12px 12px; border-top: 1px solid #374151;">
              <p style="margin: 0 0 10px; color: #9CA3AF; font-size: 12px; text-align: center;">
                Questions? Just reply to this email.
              </p>
              <p style="margin: 0; color: #6B7280; font-size: 11px; text-align: center;">
                Honeypot AI - Halal-first trading alerts<br>
                © 2025 Honeypot AI. All rights reserved.
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
    }

    console.log('   → Sending email via Gmail SMTP...')
    const info = await transporter.sendMail(mailOptions)
    
    console.log('✅ [EMAIL SUCCESS] Confirmation email sent!')
    console.log(`   → To: ${email}`)
    console.log(`   → Position: #${position}`)
    console.log(`   → Message ID: ${info.messageId}`)
    console.log(`   → Response: ${info.response}`)
    return true
  } catch (error) {
    console.error('❌ [EMAIL ERROR] Failed to send confirmation email')
    console.error(`   → Recipient: ${email}`)
    console.error(`   → Error: ${error.message}`)
    if (error.code) {
      console.error(`   → Error Code: ${error.code}`)
    }
    if (error.command) {
      console.error(`   → SMTP Command: ${error.command}`)
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
    const transporter = createTransporter()
    if (!transporter) {
      console.error('❌ [EMAIL] Cannot create transporter - missing credentials')
      return false
    }

    const fromEmail = process.env.GMAIL_USER
    const fromName = process.env.EMAIL_FROM_NAME || 'Honeypot AI'
    const adminEmail = process.env.ADMIN_EMAIL || fromEmail // Send to same account if ADMIN_EMAIL not set

    console.log(`   → To Admin: ${adminEmail}`)

    const mailOptions = {
      from: `"${fromName}" <${fromEmail}>`,
      to: adminEmail,
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
    }

    const info = await transporter.sendMail(mailOptions)
    console.log(`✅ [EMAIL SUCCESS] Contact notification sent!`)
    console.log(`   → Message ID: ${info.messageId}`)
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
