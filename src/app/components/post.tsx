'use client'

import { useState } from 'react'
import { usePosts } from '@/hooks/use-posts'

export const RecentPost = () => {
  const [name, setName] = useState<string>('')
  const { recentPost, loading: isLoadingPosts, createPost, isCreating } = usePosts()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createPost({ name })
    setName('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      createPost({ name })
      setName('')
    }
  }

  return (
    <div className='w-full max-w-sm backdrop-blur-lg bg-black/15 px-8 py-6 rounded-md text-zinc-100/75 space-y-2'>
      {isLoadingPosts ? (
        <p className='text-[#ececf399] text-base/6'>Loading posts...</p>
      ) : recentPost ? (
        <p className='text-[#ececf399] text-base/6'>Your recent post: "{recentPost.name}"</p>
      ) : (
        <p className='text-[#ececf399] text-base/6'>You have no posts yet.</p>
      )}
      <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} className='flex flex-col gap-4'>
        <input
          type='text'
          placeholder='Enter a title...'
          value={name}
          onChange={(e) => setName(e.target.value)}
          className='w-full text-base/6 rounded-md bg-black/50 hover:bg-black/75 focus-visible:outline-none ring-2 ring-transparent  hover:ring-zinc-800 focus:ring-zinc-800 focus:bg-black/75 transition h-12 px-4 py-2 text-zinc-100'
        />
        <button
          disabled={isCreating}
          type='submit'
          className='rounded-md text-base/6 ring-2 ring-offset-2 ring-offset-black focus-visible:outline-none focus-visible:ring-zinc-100 ring-transparent hover:ring-zinc-100 h-12 px-10 py-3 bg-brand-700 text-zinc-800 font-medium bg-gradient-to-tl from-zinc-300 to-zinc-200 transition hover:bg-brand-800'
        >
          {isCreating ? 'Creating...' : 'Create Post'}
        </button>
      </form>
    </div>
  )
}
