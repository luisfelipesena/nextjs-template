'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'

export default function DashboardPage() {
  const router = useRouter()
  const { user, loading, signOut, isSigningOut } = useAuth()

  const handleSignOut = () => {
    signOut(undefined, {
      onSuccess: () => {
        router.push('/')
      },
    })
  }

  if (loading) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className='p-4'>
      <div className='flex items-center justify-between'>
        <h1 className='text-2xl font-bold'>Dashboard</h1>
        <Button 
          onClick={handleSignOut} 
          variant='outline'
          disabled={isSigningOut}
        >
          {isSigningOut ? 'Signing out...' : 'Sign Out'}
        </Button>
      </div>
      <div className='mt-4'>
        <p>This is a protected page. Only authenticated users can see this content.</p>
        {user && <p className='mt-2 text-muted-foreground'>Logged in as: {user.email}</p>}
      </div>
    </div>
  )
}
