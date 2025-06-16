'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '@/hooks/use-auth'
import { useState } from 'react'

const signInSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type SignInForm = z.infer<typeof signInSchema>

export default function SignInPage() {
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { signIn, isSigningIn } = useAuth()

  const { register, handleSubmit, formState: { errors } } = useForm<SignInForm>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = (data: SignInForm) => {
    setError(null)
    signIn(data, {
      onSuccess: () => {
        router.push('/dashboard')
      },
      onError: (error) => {
        setError('Invalid email or password')
        console.error('Sign in error:', error)
      },
    })
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
          <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
            <div className='space-y-2'>
              <label htmlFor='email' className='text-sm font-medium text-foreground'>
                Email
              </label>
              <input
                id='email'
                type='email'
                {...register('email')}
                className='w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary'
              />
              {errors.email && (
                <p className='text-sm text-destructive'>{errors.email.message}</p>
              )}
            </div>

            <div className='space-y-2'>
              <label htmlFor='password' className='text-sm font-medium text-foreground'>
                Password
              </label>
              <input
                id='password'
                type='password'
                {...register('password')}
                className='w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary'
              />
              {errors.password && (
                <p className='text-sm text-destructive'>{errors.password.message}</p>
              )}
            </div>

            {error && <p className='text-destructive text-sm'>{error}</p>}

            <button
              type='submit'
              disabled={isSigningIn}
              className='w-full bg-primary text-primary-foreground py-2 px-4 rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {isSigningIn ? 'Signing in...' : 'Sign In'}
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
