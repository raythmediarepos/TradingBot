/**
 * Authentication utilities for frontend
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: 'user' | 'admin'
  position?: number
  isFree?: boolean
  status?: string
  paymentStatus?: string
  emailVerified?: boolean
  discordJoined?: boolean
  createdAt?: any
}

export interface LoginResponse {
  success: boolean
  data?: {
    token: string
    user: User
  }
  message?: string
}

/**
 * Store auth token
 */
export const setAuthToken = (token: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('auth_token', token)
  }
}

/**
 * Get auth token
 */
export const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('auth_token')
  }
  return null
}

/**
 * Remove auth token
 */
export const removeAuthToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user_data')
  }
}

/**
 * Store user data
 */
export const setUserData = (user: User) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('user_data', JSON.stringify(user))
  }
}

/**
 * Get user data
 */
export const getUserData = (): User | null => {
  if (typeof window !== 'undefined') {
    const data = localStorage.getItem('user_data')
    return data ? JSON.parse(data) : null
  }
  return null
}

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  return !!getAuthToken()
}

/**
 * Check if user is admin
 */
export const isAdmin = (): boolean => {
  const user = getUserData()
  return user?.role === 'admin'
}

/**
 * Login user
 */
export const login = async (email: string, password: string): Promise<LoginResponse> => {
  try {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    })

    const data = await response.json()

    if (data.success && data.data) {
      setAuthToken(data.data.token)
      setUserData(data.data.user)
    }

    return data
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Login failed',
    }
  }
}

/**
 * Login admin
 */
export const adminLogin = async (email: string, password: string): Promise<LoginResponse> => {
  try {
    const response = await fetch(`${API_URL}/api/auth/admin-login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    })

    const data = await response.json()

    if (data.success && data.data) {
      setAuthToken(data.data.token)
      setUserData(data.data.user)
    }

    return data
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Admin login failed',
    }
  }
}

/**
 * Logout user
 */
export const logout = async () => {
  try {
    const token = getAuthToken()
    if (token) {
      await fetch(`${API_URL}/api/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      })
    }
  } catch (error) {
    console.error('Logout error:', error)
  } finally {
    removeAuthToken()
  }
}

/**
 * Get current user from API
 */
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const token = getAuthToken()
    if (!token) return null

    const response = await fetch(`${API_URL}/api/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })

    const data = await response.json()

    if (data.success && data.data) {
      setUserData(data.data)
      return data.data
    }

    return null
  } catch (error) {
    console.error('Get current user error:', error)
    return null
  }
}

/**
 * Make authenticated API request
 */
export const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const token = getAuthToken()

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  return fetch(`${API_URL}${url}`, {
    ...options,
    headers,
  })
}

