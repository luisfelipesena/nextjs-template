import { useEffect, useState } from 'react'
import { authClient } from '@/lib/auth-client'
import type { User } from 'better-auth/types'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const session = await authClient.getSession()
        if (session?.data?.user) {
          setUser(session.data.user)
        } else {
          setUser(null)
        }
      } catch (_error) {
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    fetchSession()
  }, [])

  return { user, loading, isAuthenticated: !!user }
}
