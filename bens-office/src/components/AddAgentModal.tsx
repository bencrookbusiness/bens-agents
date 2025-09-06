import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/dialog'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { useCreateAgent } from '../hooks/useAgents'
import type { TriggerType, ReturnType } from '../types/database'

interface AddAgentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  departmentId: string
}

const triggerTypeOptions: { value: TriggerType; label: string; description: string }[] = [
  {
    value: 'click',
    label: 'Click to Trigger',
    description: 'User clicks a button to run the agent'
  },
  {
    value: 'chat',
    label: 'Chat to Trigger',
    description: 'User sends a message to trigger the agent'
  },
  {
    value: 'upload',
    label: 'Upload to Trigger',
    description: 'User uploads a file to trigger the agent'
  },
  {
    value: 'automatic',
    label: 'Automatic',
    description: 'Agent runs automatically on a schedule'
  },
  {
    value: 'none',
    label: 'No Trigger',
    description: 'Agent is triggered externally'
  }
]

const returnTypeOptions: { value: ReturnType; label: string; description: string }[] = [
  {
    value: 'none',
    label: 'No Return',
    description: 'Agent processes but returns nothing'
  },
  {
    value: 'text',
    label: 'Text Response',
    description: 'Agent returns text or data'
  },
  {
    value: 'chat',
    label: 'Chat Response',
    description: 'Agent responds in a chat interface'
  }
]

export function AddAgentModal({ open, onOpenChange, departmentId }: AddAgentModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    trigger_type: 'click' as TriggerType,
    return_type: 'text' as ReturnType,
    webhook_url: '',
    workflow_url: '',
  })
  
  const createAgent = useCreateAgent()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.name.trim() && formData.webhook_url.trim()) {
      try {
        await createAgent.mutateAsync({
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
          trigger_type: formData.trigger_type,
          return_type: formData.return_type,
          webhook_url: formData.webhook_url.trim(),
          workflow_url: formData.workflow_url.trim() || undefined,
          department_id: departmentId
        })
        
        // Reset form
        setFormData({
          name: '',
          description: '',
          trigger_type: 'click',
          return_type: 'text',
          webhook_url: '',
          workflow_url: '',
        })
        onOpenChange(false)
      } catch (error) {
        console.error('Failed to create agent:', error)
      }
    }
  }

  const selectedTriggerType = triggerTypeOptions.find(option => option.value === formData.trigger_type)
  const selectedReturnType = returnTypeOptions.find(option => option.value === formData.return_type)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Agent</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Agent Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Code Review Agent"
              required
              disabled={createAgent.isPending}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="What does this agent do?"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="trigger_type">Trigger Type</Label>
            <Select
              value={formData.trigger_type}
              onValueChange={(value: TriggerType) => setFormData({ ...formData, trigger_type: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select trigger type" />
              </SelectTrigger>
              <SelectContent>
                {triggerTypeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex flex-col items-start">
                      <span>{option.label}</span>
                      <span className="text-xs text-muted-foreground">{option.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedTriggerType && (
              <p className="text-xs text-muted-foreground">
                {selectedTriggerType.description}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="return_type">Return Format</Label>
            <Select
              value={formData.return_type}
              onValueChange={(value: ReturnType) => setFormData({ ...formData, return_type: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select return format" />
              </SelectTrigger>
              <SelectContent>
                {returnTypeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex flex-col items-start">
                      <span>{option.label}</span>
                      <span className="text-xs text-muted-foreground">{option.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedReturnType && (
              <p className="text-xs text-muted-foreground">
                {selectedReturnType.description}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="webhook_url">Webhook URL</Label>
            <Input
              id="webhook_url"
              type="url"
              value={formData.webhook_url || ''}
              onChange={(e) => setFormData({ ...formData, webhook_url: e.target.value })}
              placeholder="https://hooks.zapier.com/hooks/catch/..."
              required
            />
            <p className="text-xs text-muted-foreground">
              This is where we'll send POST requests to trigger your workflow
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="workflow_url">Workflow URL (Optional)</Label>
            <Input
              id="workflow_url"
              type="url"
              value={formData.workflow_url || ''}
              onChange={(e) => setFormData({ ...formData, workflow_url: e.target.value })}
              placeholder="https://app.n8n.io/workflow/123"
            />
            <p className="text-xs text-muted-foreground">
              Link to your workflow for easy access
            </p>
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={createAgent.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createAgent.isPending}>
              {createAgent.isPending ? 'Creating...' : 'Create Agent'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}