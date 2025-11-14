/**
 * AI Log Analyzer Service
 * Uses OpenAI to intelligently analyze logs and extract unique errors
 */

const OpenAI = require('openai')

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

/**
 * Analyze errors with OpenAI to extract unique, actionable issues
 * @param {string} errorsText - Formatted error text
 * @param {number} errorCount - Number of errors
 * @returns {Promise<Array>} - Array of unique error objects
 */
const analyzeLogsWithAI = async (errorsText, errorCount = 0) => {
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY not configured')
    }

    if (!errorsText || errorsText.trim().length === 0) {
      console.log('⚠️  [AI ANALYZER] No errors to analyze')
      return []
    }

    console.log('🤖 [AI ANALYZER] Sending errors to OpenAI for analysis...')
    console.log(`   → Error count: ${errorCount}`)
    console.log(`   → Data size: ${(errorsText.length / 1024).toFixed(2)} KB`)

    // Truncate if too large (OpenAI has token limits)
    const maxLength = 50000 // ~12,500 tokens (safe limit)
    const truncatedErrors = errorsText.length > maxLength 
      ? errorsText.slice(0, maxLength) // Take first 50K chars (most recent are at top)
      : errorsText

    if (errorsText.length > maxLength) {
      console.log(`   → Truncated to ${(maxLength / 1024).toFixed(2)} KB`)
    }

    const prompt = `You are an expert system administrator analyzing production application errors.

**YOUR TASK:**
Analyze the following errors from our Firebase error collection and identify which ones require immediate action.

**IGNORE (these are expected/already being handled):**
- Discord bot not configured (test environment)
- Firebase quota exceeded (free tier limit)
- Routine monitoring errors
- Health check failures during deployment
- Temporary network timeouts (< 3 occurrences)

**FOCUS ON (these need alerts):**
- Database connection failures
- Payment processing errors  
- User authentication failures
- Email delivery failures
- API crashes affecting users
- Data corruption or loss
- Repeated critical errors (3+ times)

**OUTPUT FORMAT:**
Return a JSON object with an "errors" array:
{
  "errors": [
    {
      "severity": "critical|error|warning",
      "service": "api|database|discord|email|payments|system",
      "message": "Brief summary (one sentence, under 100 chars)",
      "details": "Key technical details",
      "count": <number of similar occurrences>,
      "firstSeen": "ISO timestamp",
      "actionable": true
    }
  ]
}

**IMPORTANT:**
- Deduplicate similar errors (group by root cause)
- Count occurrences of the same error
- Only return errors that REQUIRE ACTION
- Return {"errors": []} if no actionable errors
- Valid JSON only, no markdown

**ERRORS TO ANALYZE:**
${truncatedErrors}`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Fast and cost-effective for log analysis
      messages: [
        {
          role: 'system',
          content: 'You are an expert system administrator. Analyze logs and return ONLY valid JSON array of unique errors. No markdown, no extra text, just JSON.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.1, // Low temperature for consistent, factual analysis
      max_tokens: 2000,
      response_format: { type: 'json_object' },
    })

    const responseText = completion.choices[0].message.content
    console.log('✅ [AI ANALYZER] OpenAI analysis complete')
    console.log(`   → Tokens used: ${completion.usage.total_tokens}`)
    console.log(`   → Cost: ~$${(completion.usage.total_tokens * 0.00015 / 1000).toFixed(4)}`)

    // Parse JSON response
    let analysisResult
    try {
      // Try to parse as-is
      analysisResult = JSON.parse(responseText)
      
      // If response is wrapped in an object, extract the array
      if (analysisResult.errors) {
        analysisResult = analysisResult.errors
      } else if (!Array.isArray(analysisResult)) {
        // If it's not an array, wrap it
        analysisResult = [analysisResult]
      }
    } catch (parseError) {
      console.error('❌ [AI ANALYZER] Failed to parse OpenAI response as JSON')
      console.error('   → Response:', responseText)
      return []
    }

    console.log(`   → Unique errors found: ${analysisResult.length}`)
    
    if (analysisResult.length > 0) {
      console.log('   → Errors:')
      analysisResult.forEach((error, i) => {
        console.log(`      ${i + 1}. [${error.severity}] ${error.service}: ${error.message}`)
      })
    }

    return analysisResult
  } catch (error) {
    console.error('❌ [AI ANALYZER] Error analyzing logs:', error.message)
    throw error
  }
}

/**
 * Test OpenAI connection
 */
const testOpenAIConnection = async () => {
  try {
    console.log('🔍 [AI ANALYZER] Testing OpenAI connection...')
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: 'Say "Connection successful"' }],
      max_tokens: 10,
    })

    console.log('✅ [AI ANALYZER] OpenAI connection successful!')
    console.log('   → Response:', completion.choices[0].message.content)
    
    return true
  } catch (error) {
    console.error('❌ [AI ANALYZER] OpenAI connection failed:', error.message)
    return false
  }
}

module.exports = {
  analyzeLogsWithAI,
  testOpenAIConnection,
}

