const { Resend } = require('resend')
require('dotenv').config()

const testEmailSending = async () => {
  console.log('🧪 Testing Resend Email Service...\n')
  
  const apiKey = process.env.RESEND_API_KEY
  console.log(`API Key: ${apiKey ? `${apiKey.substring(0, 10)}...` : '❌ MISSING'}`)
  
  if (!apiKey) {
    console.error('❌ RESEND_API_KEY is not set in .env file')
    return
  }
  
  const resend = new Resend(apiKey)
  
  try {
    console.log('\n📧 Attempting to send test email...')
    console.log(`From: ${process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'}`)
    console.log(`To: test@example.com\n`)
    
    const data = await resend.emails.send({
      from: `Helwa AI <${process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'}>`,
      to: ['delivered@resend.dev'], // Resend's test email
      subject: 'Test Email from Helwa AI',
      html: '<p>This is a test email to verify Resend is working.</p>',
    })
    
    console.log('✅ EMAIL SENT SUCCESSFULLY!')
    console.log(`Email ID: ${data.id}`)
    console.log('\n✅ Resend is configured correctly!')
  } catch (error) {
    console.error('\n❌ EMAIL FAILED!')
    console.error(`Error: ${error.message}`)
    
    if (error.message.includes('not a valid sending domain')) {
      console.error('\n🔴 DOMAIN NOT VERIFIED IN RESEND')
      console.error('\nTo fix this:')
      console.error('1. Go to https://resend.com/domains')
      console.error('2. Add and verify your domain "helwa.ai"')
      console.error('3. Add the required DNS records')
      console.error('\nOR use the default Resend domain:')
      console.error('Set RESEND_FROM_EMAIL=onboarding@resend.dev in your .env file')
    }
  }
}

testEmailSending()

