import { Bot, Users } from 'lucide-react'
import { cn } from '../lib/utils'
import type { Department } from '../types/database'

interface DepartmentCardProps {
  department: Department
  onClick: () => void
}

export function DepartmentCard({ department, onClick }: DepartmentCardProps) {
  const agentCount = department.agents?.length || 0
  const activeAgents = department.agents?.filter(agent => agent.is_active).length || 0

  return (
    <div
      onClick={onClick}
      className={cn(
        "p-6 rounded-lg border bg-card cursor-pointer transition-all",
        "hover:shadow-md hover:border-primary/50"
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">{department.name}</h3>
        <div className="flex items-center space-x-2">
          <div className="flex items-center text-sm text-muted-foreground">
            <Bot className="h-4 w-4 mr-1" />
            <span>{activeAgents}/{agentCount}</span>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center text-sm text-muted-foreground">
          <Users className="h-4 w-4 mr-2" />
          <span>
            {agentCount === 0 ? 'No agents' : 
             agentCount === 1 ? '1 agent' : 
             `${agentCount} agents`}
          </span>
        </div>
        
        {activeAgents > 0 && (
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
            <span className="text-sm text-green-600">
              {activeAgents} active
            </span>
          </div>
        )}
      </div>

      {department.agents && department.agents.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1">
          {department.agents.slice(0, 3).map((agent) => (
            <div
              key={agent.id}
              className={cn(
                "px-2 py-1 rounded text-xs",
                agent.is_active 
                  ? "bg-green-100 text-green-700" 
                  : "bg-gray-100 text-gray-600"
              )}
            >
              {agent.name}
            </div>
          ))}
          {department.agents.length > 3 && (
            <div className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-600">
              +{department.agents.length - 3} more
            </div>
          )}
        </div>
      )}
    </div>
  )
}