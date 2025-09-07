import type { Agent, TriggerType, ReturnType } from '../../types/database'

export interface AgentCardState {
  inputValue: string
  fileInput: File | null
  outputValue: string | null
  isLoading: boolean
  error: string | null
  responses: AgentResponse[]
}

export interface AgentResponse {
  id: string
  timestamp: Date
  input: string | File | null
  output: string | null
  status: 'success' | 'error'
}

export interface AgentInputProps {
  agent: Agent
  value: string
  file: File | null
  isLoading: boolean
  error: string | null
  onTextChange: (value: string) => void
  onFileChange: (file: File | null) => void
  onTrigger: (payload?: any) => void
}

export interface AgentOutputProps {
  agent: Agent
  value: string | null
  responses: AgentResponse[]
  isLoading: boolean
  // Optional props for unified chat interface (chat → chat)
  onTextChange?: (value: string) => void
  onTrigger?: (payload?: any) => void
  inputValue?: string
  error?: string | null
}

export interface AgentCardProps {
  agent: Agent
  onToggle: () => void
  onDelete: () => void
  onTrigger: (payload?: any) => Promise<any>
}