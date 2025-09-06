import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Agent, CreateAgentData } from '../types/database'

export function useCreateAgent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (agentData: CreateAgentData): Promise<Agent> => {
      const { data, error } = await supabase
        .from('agents')
        .insert(agentData)
        .select()
        .single()

      if (error) {
        throw new Error(error.message)
      }

      return data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['department', variables.department_id] })
    }
  })
}

export function useUpdateAgent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ 
      id, 
      updates 
    }: { 
      id: string; 
      updates: Partial<Agent> 
    }): Promise<Agent> => {
      const { data, error } = await supabase
        .from('agents')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        throw new Error(error.message)
      }

      return data
    },
    onSuccess: (agent) => {
      queryClient.invalidateQueries({ queryKey: ['department', agent.department_id] })
    }
  })
}

export function useDeleteAgent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const { error } = await supabase
        .from('agents')
        .delete()
        .eq('id', id)

      if (error) {
        throw new Error(error.message)
      }
    },
    onSuccess: (_, agentId) => {
      // Invalidate all department queries as we don't know which department this belonged to
      queryClient.invalidateQueries({ queryKey: ['department'] })
    }
  })
}

export function useTriggerAgent() {
  return useMutation({
    mutationFn: async ({ 
      agent, 
      payload = {} 
    }: { 
      agent: Agent; 
      payload?: Record<string, any> 
    }): Promise<any> => {
      const response = await fetch(agent.webhook_url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agent_id: agent.id,
          agent_name: agent.name,
          trigger_type: agent.trigger_type,
          return_type: agent.return_type,
          payload,
          timestamp: new Date().toISOString()
        })
      })

      if (!response.ok) {
        throw new Error(`Webhook request failed: ${response.statusText}`)
      }

      if (agent.return_type === 'none') {
        return null
      }

      const result = await response.json()
      return result
    }
  })
}