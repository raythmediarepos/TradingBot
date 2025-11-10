/**
 * Retry utility with exponential backoff
 * Handles transient failures gracefully
 */

/**
 * Retry a function with exponential backoff
 * @param {Function} fn - The async function to retry
 * @param {Object} options - Retry options
 * @param {number} options.maxRetries - Maximum number of retries (default: 3)
 * @param {number} options.initialDelay - Initial delay in ms (default: 1000)
 * @param {number} options.maxDelay - Maximum delay in ms (default: 10000)
 * @param {number} options.factor - Exponential backoff factor (default: 2)
 * @param {Function} options.onRetry - Callback called before each retry
 * @returns {Promise<any>} - Result of the function
 */
const retryWithBackoff = async (fn, options = {}) => {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    factor = 2,
    onRetry = null,
  } = options

  let lastError
  let delay = initialDelay

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error

      // Don't retry on last attempt
      if (attempt === maxRetries) {
        throw error
      }

      // Call onRetry callback if provided
      if (onRetry) {
        onRetry(attempt + 1, maxRetries, delay, error)
      }

      // Log retry attempt
      console.log(`🔄 [RETRY] Attempt ${attempt + 1}/${maxRetries} failed. Retrying in ${delay}ms...`)
      console.log(`   → Error: ${error.message}`)

      // Wait before retrying
      await sleep(delay)

      // Calculate next delay with exponential backoff
      delay = Math.min(delay * factor, maxDelay)
    }
  }

  // This should never be reached, but just in case
  throw lastError
}

/**
 * Sleep for specified milliseconds
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise<void>}
 */
const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Retry a Firestore transaction with exponential backoff
 * Handles specific Firestore transaction errors
 * @param {Function} transactionFn - The transaction function
 * @param {Object} options - Retry options
 * @returns {Promise<any>} - Result of the transaction
 */
const retryTransaction = async (transactionFn, options = {}) => {
  return retryWithBackoff(transactionFn, {
    maxRetries: 5, // More retries for transactions
    initialDelay: 500, // Shorter initial delay
    maxDelay: 5000,
    factor: 2,
    onRetry: (attempt, maxRetries, delay, error) => {
      console.log(`🔄 [TRANSACTION RETRY] Attempt ${attempt}/${maxRetries}`)
      console.log(`   → Error: ${error.message}`)
      console.log(`   → Waiting ${delay}ms before retry...`)
    },
    ...options,
  })
}

/**
 * Check if an error is retryable
 * @param {Error} error - The error to check
 * @returns {boolean} - True if error is retryable
 */
const isRetryableError = (error) => {
  if (!error) return false

  const retryableMessages = [
    'DEADLINE_EXCEEDED',
    'UNAVAILABLE',
    'ABORTED',
    'RESOURCE_EXHAUSTED',
    'INTERNAL',
    'transaction lock',
    'contention',
    'Connection reset',
    'ECONNRESET',
    'ETIMEDOUT',
  ]

  const errorMessage = error.message || error.toString()
  return retryableMessages.some((msg) => errorMessage.includes(msg))
}

module.exports = {
  retryWithBackoff,
  retryTransaction,
  sleep,
  isRetryableError,
}

