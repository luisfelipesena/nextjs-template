import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { client } from '@/lib/client'

interface CreatePostInput {
  name: string
}

export function usePosts() {
  const queryClient = useQueryClient()

  const { data: recentPost, isPending: loading, error } = useQuery({
    queryKey: ['get-recent-post'],
    queryFn: async () => {
      const res = await client.post.recent.$get()
      return await res.json()
    },
  })

  const createPostMutation = useMutation({
    mutationFn: async (input: CreatePostInput) => {
      const res = await client.post.create.$post(input)
      return await res.json()
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['get-recent-post'] })
    },
  })

  const refetch = () => {
    return queryClient.invalidateQueries({ queryKey: ['get-recent-post'] })
  }

  return {
    recentPost,
    loading,
    error: error?.message || null,
    refetch,
    createPost: createPostMutation.mutate,
    createPostAsync: createPostMutation.mutateAsync,
    isCreating: createPostMutation.isPending,
  }
}
