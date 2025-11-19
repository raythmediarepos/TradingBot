const { sendEmail } = require('./emailService')
const { getAffiliateStats } = require('./affiliateService')

/**
 * Send notification when someone signs up through affiliate link
 */
const sendSignupNotification = async (affiliateCode, affiliateName, affiliateEmail, newUser) => {
  try {
    // Get current stats
    const statsResult = await getAffiliateStats(affiliateCode)
    const stats = statsResult.success ? statsResult.stats : null

    const isFree = newUser.position <= 20
    const potentialCommission = isFree ? 0 : 12.50

    const subject = '🎉 New signup through your Helwa AI affiliate link!'

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .stats-box { background: white; border: 2px solid #667eea; border-radius: 8px; padding: 20px; margin: 20px 0; }
          .stat-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
          .stat-label { font-weight: 600; color: #555; }
          .stat-value { font-weight: 700; color: #667eea; }
          .link-box { background: #fff3cd; border: 2px solid #ffc107; border-radius: 8px; padding: 15px; margin: 20px 0; text-align: center; }
          .link { color: #667eea; word-break: break-all; }
          .footer { text-align: center; margin-top: 20px; color: #888; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">🎉 New Signup!</h1>
            <p style="margin: 10px 0 0 0;">Someone just used your affiliate link</p>
          </div>
          
          <div class="content">
            <p>Hi ${affiliateName},</p>
            
            <p><strong>Great news!</strong> Someone just signed up for Helwa AI using your affiliate link.</p>
            
            <div class="stats-box">
              <h3 style="margin-top: 0; color: #667eea;">📊 New Signup Details</h3>
              <div class="stat-row">
                <span class="stat-label">Position:</span>
                <span class="stat-value">#${newUser.position}</span>
              </div>
              <div class="stat-row">
                <span class="stat-label">Status:</span>
                <span class="stat-value">${isFree ? 'FREE Beta Tester' : 'Pending Payment'}</span>
              </div>
              <div class="stat-row">
                <span class="stat-label">Your Potential Commission:</span>
                <span class="stat-value">${isFree ? '$0.00 (Free slot)' : '$12.50 (if they pay)'}</span>
              </div>
            </div>
            
            ${stats ? `
            <div class="stats-box">
              <h3 style="margin-top: 0; color: #667eea;">📈 Your Month-to-Date Stats</h3>
              <div class="stat-row">
                <span class="stat-label">Total Clicks:</span>
                <span class="stat-value">${stats.totalClicks}</span>
              </div>
              <div class="stat-row">
                <span class="stat-label">Total Signups:</span>
                <span class="stat-value">${stats.totalSignups}</span>
              </div>
              <div class="stat-row">
                <span class="stat-label">Paid Users:</span>
                <span class="stat-value">${stats.paidUsers}</span>
              </div>
              <div class="stat-row">
                <span class="stat-label">Total Commission Earned:</span>
                <span class="stat-value">$${stats.totalCommission.toFixed(2)}</span>
              </div>
              <div class="stat-row">
                <span class="stat-label">Conversion Rate:</span>
                <span class="stat-value">${stats.conversionRates.clickToSignup}%</span>
              </div>
            </div>
            ` : ''}
            
            <div class="link-box">
              <p style="margin: 0 0 10px 0;"><strong>Your Affiliate Link:</strong></p>
              <a href="${process.env.FRONTEND_URL}/beta/signup?ref=${affiliateCode}" class="link">
                ${process.env.FRONTEND_URL}/beta/signup?ref=${affiliateCode}
              </a>
            </div>
            
            <p style="text-align: center; margin-top: 30px;">
              <strong>Keep sharing to earn more! 🚀</strong>
            </p>
          </div>
          
          <div class="footer">
            <p>Helwa AI Affiliate Program</p>
            <p>Questions? Reply to this email or contact support@helwa.ai</p>
          </div>
        </div>
      </body>
      </html>
    `

    const text = `
Hi ${affiliateName},

Great news! Someone just signed up for Helwa AI using your affiliate link.

New Signup Details:
- Position: #${newUser.position}
- Status: ${isFree ? 'FREE Beta Tester' : 'Pending Payment'}
- Your Potential Commission: ${isFree ? '$0.00 (Free slot)' : '$12.50 (if they pay)'}

${stats ? `
Your Month-to-Date Stats:
- Total Clicks: ${stats.totalClicks}
- Total Signups: ${stats.totalSignups}
- Paid Users: ${stats.paidUsers}
- Total Commission Earned: $${stats.totalCommission.toFixed(2)}
- Conversion Rate: ${stats.conversionRates.clickToSignup}%
` : ''}

Your Affiliate Link:
${process.env.FRONTEND_URL}/beta/signup?ref=${affiliateCode}

Keep sharing to earn more! 🚀

- Helwa AI Team
    `

    await sendEmail(affiliateEmail, subject, text, html)

    console.log(`📧 [AFFILIATE EMAIL] Signup notification sent to ${affiliateName} (${affiliateEmail})`)

    return {
      success: true,
    }
  } catch (error) {
    console.error('❌ [AFFILIATE EMAIL] Error sending signup notification:', error)
    return {
      success: false,
      error: error.message,
    }
  }
}

/**
 * Send notification when user completes payment
 */
const sendCommissionEarnedNotification = async (affiliateCode, affiliateName, affiliateEmail, paidUser, commissionAmount) => {
  try {
    const subject = '💰 You earned a commission on Helwa AI!'

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .commission-box { background: #d1fae5; border: 3px solid #10b981; border-radius: 12px; padding: 30px; margin: 20px 0; text-align: center; }
          .commission-amount { font-size: 48px; font-weight: 900; color: #10b981; margin: 10px 0; }
          .footer { text-align: center; margin-top: 20px; color: #888; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">💰 Commission Earned!</h1>
            <p style="margin: 10px 0 0 0;">A user you referred just completed payment</p>
          </div>
          
          <div class="content">
            <p>Hi ${affiliateName},</p>
            
            <p><strong>Congratulations!</strong> One of your referred users just completed their payment.</p>
            
            <div class="commission-box">
              <p style="margin: 0; font-size: 18px; color: #059669;">You earned:</p>
              <div class="commission-amount">$${commissionAmount.toFixed(2)}</div>
              <p style="margin: 0; color: #666;">25% commission on $49.99</p>
            </div>
            
            <p style="text-align: center;">
              Your commission will be included in your monthly payout report.<br>
              Payouts are processed at the beginning of each month.
            </p>
            
            <p style="text-align: center; margin-top: 30px;">
              <strong>Keep sharing to earn more! 🚀</strong><br>
              <a href="${process.env.FRONTEND_URL}/beta/signup?ref=${affiliateCode}" style="color: #667eea;">
                ${process.env.FRONTEND_URL}/beta/signup?ref=${affiliateCode}
              </a>
            </p>
          </div>
          
          <div class="footer">
            <p>Helwa AI Affiliate Program</p>
            <p>Questions? Reply to this email or contact support@helwa.ai</p>
          </div>
        </div>
      </body>
      </html>
    `

    const text = `
Hi ${affiliateName},

Congratulations! One of your referred users just completed their payment.

You earned: $${commissionAmount.toFixed(2)}
(25% commission on $49.99)

Your commission will be included in your monthly payout report.
Payouts are processed at the beginning of each month.

Keep sharing to earn more! 🚀
Your Link: ${process.env.FRONTEND_URL}/beta/signup?ref=${affiliateCode}

- Helwa AI Team
    `

    await sendEmail(affiliateEmail, subject, text, html)

    console.log(`📧 [AFFILIATE EMAIL] Commission notification sent to ${affiliateName} (${affiliateEmail})`)

    return {
      success: true,
    }
  } catch (error) {
    console.error('❌ [AFFILIATE EMAIL] Error sending commission notification:', error)
    return {
      success: false,
      error: error.message,
    }
  }
}

module.exports = {
  sendSignupNotification,
  sendCommissionEarnedNotification,
}

