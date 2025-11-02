'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { isAuthenticated, isAdmin, getCurrentUser } from '@/lib/auth'
import { Loader2 } from 'lucide-react'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAuth?: boolean
  requireAdmin?: boolean
}

export default function ProtectedRoute({ 
  children, 
  requireAuth = true,
  requireAdmin = false 
}: ProtectedRouteProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      // Check if auth is required
      if (!requireAuth) {
        setIsAuthorized(true)
        setIsLoading(false)
        return
      }

      // Check if user is authenticated
      if (!isAuthenticated()) {
        router.push(`/login?redirect=${encodeURIComponent(pathname)}`)
        return
      }

      // If admin is required, check admin role
      if (requireAdmin) {
        const user = await getCurrentUser()
        if (!user || user.role !== 'admin') {
          router.push('/dashboard')
          return
        }
      }

      setIsAuthorized(true)
      setIsLoading(false)
    }

    checkAuth()
  }, [requireAuth, requireAdmin, router, pathname])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-hp-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-hp-yellow animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthorized) {
    return null
  }

  return <>{children}</>
}

