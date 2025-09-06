import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Edit, Zap } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { AgentCard } from '../components/AgentCard'
import { AddAgentModal } from '../components/AddAgentModal'
import type { Department as DepartmentType, Agent } from '../types/database'

// Mock data - same as OfficeFloor for now
const mockDepartments: DepartmentType[] = [
  {
    id: '1',
    name: 'Development',
    office_id: '1',
    position_x: 0,
    position_y: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    agents: [
      {
        id: '1',
        name: 'Code Review Agent',
        description: 'Reviews pull requests and provides feedback',
        trigger_type: 'upload',
        return_type: 'text',
        webhook_url: 'https://webhook.site/test',
        workflow_url: 'https://app.n8n.io/workflow/123',
        department_id: '1',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    ]
  },
  {
    id: '2',
    name: 'Marketing',
    office_id: '1',
    position_x: 1,
    position_y: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    agents: [
      {
        id: '2',
        name: 'Content Generator',
        description: 'Generates marketing content based on prompts',
        trigger_type: 'chat',
        return_type: 'chat',
        webhook_url: 'https://webhook.site/test2',
        workflow_url: null,
        department_id: '2',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: '3',
        name: 'Analytics Parser',
        description: 'Processes analytics data daily',
        trigger_type: 'automatic',
        return_type: 'none',
        webhook_url: 'https://webhook.site/test3',
        workflow_url: null,
        department_id: '2',
        is_active: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    ]
  }
]

export function Department() {
  const { departmentId } = useParams()
  const navigate = useNavigate()
  const [isAddAgentOpen, setIsAddAgentOpen] = useState(false)
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  
  const department = mockDepartments.find(d => d.id === departmentId)
  const [departmentName, setDepartmentName] = useState(department?.name || '')

  if (!department) {
    return (
      <div className="space-y-4">
        <Button
          variant="outline"
          onClick={() => navigate('/')}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Office</span>
        </Button>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Department not found</p>
        </div>
      </div>
    )
  }

  const handleTitleSave = () => {
    setIsEditingTitle(false)
    // TODO: Save to backend
  }

  const handleAgentToggle = (agentId: string) => {
    // TODO: Toggle agent active status
    console.log('Toggle agent', agentId)
  }

  const handleAgentDelete = (agentId: string) => {
    // TODO: Delete agent
    console.log('Delete agent', agentId)
  }

  const handleAgentTrigger = (agent: Agent) => {
    // TODO: Trigger agent based on type
    console.log('Trigger agent', agent)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button
          variant="outline"
          onClick={() => navigate('/')}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Office</span>
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {isEditingTitle ? (
            <div className="flex items-center space-x-2">
              <Input
                value={departmentName}
                onChange={(e) => setDepartmentName(e.target.value)}
                className="text-3xl font-bold"
                onBlur={handleTitleSave}
                onKeyPress={(e) => e.key === 'Enter' && handleTitleSave()}
                autoFocus
              />
              <Button size="sm" onClick={handleTitleSave}>
                Save
              </Button>
            </div>
          ) : (
            <>
              <h1 className="text-3xl font-bold">{departmentName}</h1>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditingTitle(true)}
              >
                <Edit className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
        <Button onClick={() => setIsAddAgentOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Agent
        </Button>
      </div>

      {department.agents && department.agents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {department.agents.map((agent) => (
            <AgentCard
              key={agent.id}
              agent={agent}
              onToggle={() => handleAgentToggle(agent.id)}
              onDelete={() => handleAgentDelete(agent.id)}
              onTrigger={() => handleAgentTrigger(agent)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border-2 border-dashed border-muted rounded-lg">
          <Zap className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-lg font-medium mb-2">No agents yet</p>
          <p className="text-muted-foreground mb-4">
            Get started by adding your first AI agent to this department
          </p>
          <Button onClick={() => setIsAddAgentOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Agent
          </Button>
        </div>
      )}

      <AddAgentModal
        open={isAddAgentOpen}
        onOpenChange={setIsAddAgentOpen}
        departmentId={departmentId!}
      />
    </div>
  )
}