/**
 * Affiliate Cookie Management
 * 
 * Handles storing and retrieving affiliate referral codes in cookies
 * Cookies last 30 days to give fair attribution window
 */

const COOKIE_NAME = 'helwa_affiliate_ref'
const COOKIE_EXPIRY_DAYS = 30

/**
 * Set affiliate code in cookie
 */
export const setAffiliateCookie = (affiliateCode: string): void => {
  if (typeof window === 'undefined') return

  const expiryDate = new Date()
  expiryDate.setDate(expiryDate.getDate() + COOKIE_EXPIRY_DAYS)

  document.cookie = `${COOKIE_NAME}=${affiliateCode.toUpperCase()}; expires=${expiryDate.toUTCString()}; path=/; SameSite=Lax`
  
  console.log(`🍪 [AFFILIATE COOKIE] Set: ${affiliateCode.toUpperCase()} (expires in ${COOKIE_EXPIRY_DAYS} days)`)
}

/**
 * Get affiliate code from cookie
 */
export const getAffiliateCookie = (): string | null => {
  if (typeof window === 'undefined') return null

  const cookies = document.cookie.split(';')
  
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=')
    if (name === COOKIE_NAME) {
      console.log(`🍪 [AFFILIATE COOKIE] Retrieved: ${value}`)
      return value
    }
  }

  return null
}

/**
 * Clear affiliate cookie
 */
export const clearAffiliateCookie = (): void => {
  if (typeof window === 'undefined') return

  document.cookie = `${COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
  
  console.log(`🍪 [AFFILIATE COOKIE] Cleared`)
}

/**
 * Check if affiliate cookie exists
 */
export const hasAffiliateCookie = (): boolean => {
  return getAffiliateCookie() !== null
}

/**
 * Track affiliate click via API
 */
export const trackAffiliateClick = async (affiliateCode: string): Promise<boolean> => {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'
    
    const response = await fetch(`${API_URL}/api/affiliate/track-click?ref=${affiliateCode}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()

    if (data.success) {
      console.log(`🖱️  [AFFILIATE CLICK] Tracked: ${affiliateCode}`)
      return true
    } else {
      console.error(`❌ [AFFILIATE CLICK] Failed:`, data.message)
      return false
    }
  } catch (error) {
    console.error('❌ [AFFILIATE CLICK] Error tracking click:', error)
    return false
  }
}

/**
 * Handle affiliate link (track click + set cookie)
 * Call this when user lands on page with ?ref= parameter
 */
export const handleAffiliateLink = async (affiliateCode: string): Promise<void> => {
  if (!affiliateCode) return

  // Set cookie first (works even if API call fails)
  setAffiliateCookie(affiliateCode)

  // Track click via API
  await trackAffiliateClick(affiliateCode)
}

