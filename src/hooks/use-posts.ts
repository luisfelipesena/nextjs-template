import { useState, useEffect } from 'react'
import { client } from '@/lib/client'

interface Post {
  id: number
  name: string
  createdAt: Date
  updatedAt: Date
}

interface CreatePostInput {
  name: string
}

export function usePosts() {
  const [recentPost, setRecentPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRecentPost = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await client.post.recent.$get()
      const result = await res.json()
      setRecentPost(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar posts')
    } finally {
      setLoading(false)
    }
  }

  const createPost = async (input: CreatePostInput) => {
    try {
      setError(null)
      const res = await client.post.create.$post(input)
      const newPost = await res.json()
      // Atualiza o post recente após criar um novo
      await fetchRecentPost()
      return newPost
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar post'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  useEffect(() => {
    fetchRecentPost()
  }, [])

  return {
    recentPost,
    loading,
    error,
    refetch: fetchRecentPost,
    createPost,
  }
}
