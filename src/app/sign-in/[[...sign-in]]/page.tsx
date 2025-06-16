'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { authClient } from '@/lib/auth-client'

export default function SignInPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      await authClient.signIn.email({
        email,
        password,
      })
      router.push('/dashboard')
    } catch (_err) {
      setError('Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='flex min-h-screen flex-col items-center justify-center gap-8 p-4'>
      <Link href='/' className='text-sm text-muted-foreground hover:text-primary transition-colors'>
        ← Back to home
      </Link>

      <div className='flex w-full flex-col items-center space-y-6'>
        <div className='flex flex-col space-y-2 text-center'>
          <h1 className='text-2xl font-semibold tracking-tight'>Welcome back</h1>
          <p className='text-sm text-muted-foreground'>Enter your email to sign in to your account</p>
        </div>

        <div className='w-full mx-auto max-w-sm'>
          <form onSubmit={handleSubmit} className='space-y-4'>
            <div className='space-y-2'>
              <label htmlFor='email' className='text-sm font-medium text-foreground'>
                Email
              </label>
              <input
                id='email'
                type='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className='w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary'
                required
              />
            </div>

            <div className='space-y-2'>
              <label htmlFor='password' className='text-sm font-medium text-foreground'>
                Password
              </label>
              <input
                id='password'
                type='password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className='w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary'
                required
              />
            </div>

            {error && <p className='text-destructive text-sm'>{error}</p>}

            <button
              type='submit'
              disabled={loading}
              className='w-full bg-primary text-primary-foreground py-2 px-4 rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>

        <p className='px-8 text-center text-sm text-muted-foreground'>
          Don't have an account?{' '}
          <Link href='/sign-up' className='hover:text-brand underline underline-offset-4 hover:text-primary'>
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}
