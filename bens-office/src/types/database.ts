export type TriggerType = 'click' | 'chat' | 'upload' | 'automatic' | 'none'
export type ReturnType = 'none' | 'text' | 'chat'

export interface Office {
  id: string
  name: string
  description: string | null
  owner_id: string
  created_at: string
  updated_at: string
}

export interface Department {
  id: string
  name: string
  office_id: string
  position_x: number | null
  position_y: number | null
  created_at: string
  updated_at: string
  agents?: Agent[]
}

export interface Agent {
  id: string
  name: string
  description: string | null
  trigger_type: TriggerType
  return_type: ReturnType
  webhook_url: string
  workflow_url: string | null
  department_id: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CreateOfficeData {
  name: string
  description?: string
}

export interface CreateDepartmentData {
  name: string
  office_id: string
  position_x?: number
  position_y?: number
}

export interface CreateAgentData {
  name: string
  description?: string
  trigger_type: TriggerType
  return_type: ReturnType
  webhook_url: string
  workflow_url?: string
  department_id: string
}