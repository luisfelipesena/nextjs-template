import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { authClient } from '@/lib/auth-client'

interface SignInInput {
  email: string
  password: string
}

interface SignUpInput {
  name: string
  email: string
  password: string
}

export function useAuth() {
  const queryClient = useQueryClient()

  const { data: user, isPending: loading } = useQuery({
    queryKey: ['auth-session'],
    queryFn: async () => {
      try {
        const session = await authClient.getSession()
        return session?.data?.user || null
      } catch (_error) {
        return null
      }
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  })

  const { mutate: signIn, isPending: isSigningIn } = useMutation({
    mutationFn: async (input: SignInInput) => {
      return await authClient.signIn.email(input)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth-session'] })
    },
  })

  const { mutate: signUp, isPending: isSigningUp } = useMutation({
    mutationFn: async (input: SignUpInput) => {
      return await authClient.signUp.email(input)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth-session'] })
    },
  })

  const { mutate: signOut, isPending: isSigningOut } = useMutation({
    mutationFn: async () => {
      return await authClient.signOut()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth-session'] })
    },
  })

  return { 
    user, 
    loading, 
    isAuthenticated: !!user,
    signIn,
    isSigningIn,
    signUp,
    isSigningUp,
    signOut,
    isSigningOut,
  }
}
