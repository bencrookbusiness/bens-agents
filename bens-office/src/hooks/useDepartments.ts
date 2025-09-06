import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Department, CreateDepartmentData } from '../types/database'

export function useDepartments(officeId?: string) {
  return useQuery({
    queryKey: ['departments', officeId],
    queryFn: async (): Promise<Department[]> => {
      let query = supabase
        .from('departments')
        .select(`
          *,
          agents (
            *
          )
        `)
        .order('created_at', { ascending: false })

      if (officeId) {
        query = query.eq('office_id', officeId)
      }

      const { data, error } = await query

      if (error) {
        throw new Error(error.message)
      }

      return data || []
    },
    enabled: !!officeId
  })
}

export function useDepartment(departmentId: string) {
  return useQuery({
    queryKey: ['department', departmentId],
    queryFn: async (): Promise<Department> => {
      const { data, error } = await supabase
        .from('departments')
        .select(`
          *,
          agents (
            *
          )
        `)
        .eq('id', departmentId)
        .single()

      if (error) {
        throw new Error(error.message)
      }

      return data
    },
    enabled: !!departmentId
  })
}

export function useCreateDepartment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (departmentData: CreateDepartmentData): Promise<Department> => {
      const { data, error } = await supabase
        .from('departments')
        .insert(departmentData)
        .select()
        .single()

      if (error) {
        throw new Error(error.message)
      }

      return data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['departments', variables.office_id] })
    }
  })
}