import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Edit, Zap, Loader2 } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { AgentCard } from '../components/AgentCard'
import { AddAgentModal } from '../components/AddAgentModal'
import { useDepartment, useUpdateDepartment } from '../hooks/useDepartments'
import { useUpdateAgent, useDeleteAgent } from '../hooks/useAgents'
import type { Agent } from '../types/database'

export function Department() {
  const { departmentId } = useParams()
  const navigate = useNavigate()
  const [isAddAgentOpen, setIsAddAgentOpen] = useState(false)
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [departmentName, setDepartmentName] = useState('')
  
  const { data: department, isLoading, error } = useDepartment(departmentId!)
  const updateAgent = useUpdateAgent()
  const deleteAgent = useDeleteAgent()
  const updateDepartment = useUpdateDepartment()

  // Initialize department name when department loads
  useEffect(() => {
    if (department && !departmentName) {
      setDepartmentName(department.name)
    }
  }, [department, departmentName])

  // Loading state
  if (isLoading) {
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
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
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
          <p className="text-red-600 mb-4">Error loading department: {error.message}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    )
  }

  // Not found state
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

  const handleTitleSave = async () => {
    if (department && departmentName.trim() !== department.name) {
      try {
        await updateDepartment.mutateAsync({
          id: department.id,
          updates: { name: departmentName.trim() }
        })
      } catch (error) {
        console.error('Failed to update department name:', error)
        // Reset to original name on error
        setDepartmentName(department.name)
      }
    }
    setIsEditingTitle(false)
  }

  const handleAgentToggle = async (agent: Agent) => {
    try {
      await updateAgent.mutateAsync({
        id: agent.id,
        updates: { is_active: !agent.is_active }
      })
    } catch (error) {
      console.error('Failed to toggle agent:', error)
    }
  }

  const handleAgentDelete = async (agentId: string) => {
    if (confirm('Are you sure you want to delete this agent?')) {
      try {
        await deleteAgent.mutateAsync(agentId)
      } catch (error) {
        console.error('Failed to delete agent:', error)
      }
    }
  }

  const handleAgentTrigger = (agent: Agent) => {
    // This is already handled in AgentTrigger component
    console.log('Triggering agent:', agent)
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
              <h1 className="text-3xl font-bold">{department.name}</h1>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setDepartmentName(department.name)
                  setIsEditingTitle(true)
                }}
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
              onToggle={() => handleAgentToggle(agent)}
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