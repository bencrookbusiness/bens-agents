import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Office, CreateOfficeData } from '../types/database'

export function useOffices() {
  return useQuery({
    queryKey: ['offices'],
    queryFn: async (): Promise<Office[]> => {
      const { data, error } = await supabase
        .from('offices')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        throw new Error(error.message)
      }

      return data || []
    }
  })
}

export function useCreateOffice() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (officeData: CreateOfficeData): Promise<Office> => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('User not authenticated')
      }

      const { data, error } = await supabase
        .from('offices')
        .insert({
          ...officeData,
          owner_id: user.id
        })
        .select()
        .single()

      if (error) {
        throw new Error(error.message)
      }

      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['offices'] })
    }
  })
}