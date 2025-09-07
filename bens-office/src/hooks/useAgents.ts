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
      // Prepare webhook payload based on trigger type
      const webhookPayload = {
        agent_id: agent.id,
        agent_name: agent.name,
        trigger_type: agent.trigger_type,
        return_type: agent.return_type,
        payload: {
          ...payload,
          // Ensure we always have these common fields
          timestamp: new Date().toISOString(),
          triggered_by: 'user'
        },
        metadata: {
          source: 'bens-office',
          version: '1.0.0'
        }
      }

      // Handle file uploads for 'upload' trigger type
      if (agent.trigger_type === 'upload' && payload?.file) {
        // In a real implementation, you might want to upload the file to a storage service
        // and pass the URL instead of the file data directly
        const fileData: any = {
          name: payload.file.name,
          type: payload.file.type,
          size: payload.file.size
        }

        // For small files (< 1MB), we can send as base64. For larger files, recommend cloud storage.
        if (payload.file.size < 1024 * 1024) {
          try {
            const base64 = await new Promise<string>((resolve, reject) => {
              const reader = new FileReader()
              reader.onload = () => resolve(reader.result as string)
              reader.onerror = reject
              reader.readAsDataURL(payload.file)
            })
            fileData.content = base64
          } catch (error) {
            console.error('Failed to read file content:', error)
            fileData.error = 'Failed to read file content'
          }
        } else {
          fileData.note = 'File too large for direct transfer. Consider using cloud storage.'
        }

        webhookPayload.payload.file = fileData
      }

      const response = await fetch(agent.webhook_url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(webhookPayload)
      })

      if (!response.ok) {
        throw new Error(`Webhook request failed: ${response.status} ${response.statusText}`)
      }

      // Handle different return types
      if (agent.return_type === 'none') {
        return { success: true, message: 'Agent triggered successfully' }
      }

      // Try to parse JSON response
      const contentType = response.headers.get('content-type')
      let result

      if (contentType && contentType.includes('application/json')) {
        result = await response.json()
      } else {
        // Handle plain text responses
        const textResult = await response.text()
        result = { message: textResult, text: textResult, response: textResult }
      }

      return result
    }
  })
}