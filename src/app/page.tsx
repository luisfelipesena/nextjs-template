'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '@/hooks/use-auth'
import { usePosts } from '@/hooks/use-posts'

const noteSchema = z.object({
  content: z.string().min(1, 'Note cannot be empty').max(500, 'Note is too long'),
})

type NoteForm = z.infer<typeof noteSchema>

export default function HomePage() {
  const { loading: authLoading, isAuthenticated } = useAuth()
  const { recentPost, loading: postsLoading, createPostAsync, isCreating } = usePosts()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<NoteForm>({
    resolver: zodResolver(noteSchema),
    defaultValues: {
      content: '',
    },
  })

  const onSubmit = async (data: NoteForm) => {
    try {
      await createPostAsync({ name: data.content })
      reset()
    } catch (error) {
      console.error('Failed to create post:', error)
    }
  }

  if (authLoading) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className='flex min-h-screen flex-col items-center justify-center gap-8 p-4'>
      <h1 className='text-4xl font-bold'>Welcome to Next.js Template</h1>

      {isAuthenticated && (
        <Link href='/dashboard' className='rounded-md bg-primary px-4 py-2 text-white hover:bg-primary/90'>
          Go to Dashboard
        </Link>
      )}

      <div className='w-full max-w-lg space-y-6'>
        <form onSubmit={handleSubmit(onSubmit)} className='flex gap-2'>
          <div className='flex-1'>
            <Input {...register('content')} placeholder='Write a note...' className='flex-1' />
            {errors.content && <p className='text-sm text-destructive mt-1'>{errors.content.message}</p>}
          </div>
          <Button type='submit' disabled={isCreating}>
            {isCreating ? 'Adding...' : 'Add Note'}
          </Button>
        </form>
      </div>

      <div className='space-y-4'>
        {postsLoading ? (
          <p>Loading posts...</p>
        ) : recentPost ? (
          <div className='rounded-lg border bg-card p-4 text-card-foreground shadow-sm'>
            <p>{recentPost.name}</p>
          </div>
        ) : (
          <p>No posts yet</p>
        )}
      </div>

      {!isAuthenticated && (
        <div className='flex gap-4'>
          <Button variant='outline'>
            <Link href='/sign-in'>Sign In</Link>
          </Button>
          <Button variant='outline'>
            <Link href='/sign-up'>Sign Up</Link>
          </Button>
        </div>
      )}
    </div>
  )
}
