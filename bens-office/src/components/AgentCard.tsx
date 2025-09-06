import { useState } from 'react'
import { 
  Bot, 
  Power, 
  ExternalLink, 
  MoreHorizontal,
  Upload,
  MessageCircle,
  MousePointer,
  Clock,
  Minus
} from 'lucide-react'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader } from './ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import { cn } from '../lib/utils'
import type { Agent, TriggerType } from '../types/database'

interface AgentCardProps {
  agent: Agent
  onToggle: () => void
  onDelete: () => void
  onTrigger: () => void
}

const getTriggerIcon = (triggerType: TriggerType) => {
  switch (triggerType) {
    case 'click':
      return MousePointer
    case 'chat':
      return MessageCircle
    case 'upload':
      return Upload
    case 'automatic':
      return Clock
    case 'none':
      return Minus
    default:
      return Bot
  }
}

const getTriggerColor = (triggerType: TriggerType) => {
  switch (triggerType) {
    case 'click':
      return 'text-blue-600'
    case 'chat':
      return 'text-green-600'
    case 'upload':
      return 'text-purple-600'
    case 'automatic':
      return 'text-orange-600'
    case 'none':
      return 'text-gray-600'
    default:
      return 'text-gray-600'
  }
}

const canTrigger = (triggerType: TriggerType) => {
  return triggerType === 'click' || triggerType === 'chat' || triggerType === 'upload'
}

export function AgentCard({ agent, onToggle, onDelete, onTrigger }: AgentCardProps) {
  const [isTriggering, setIsTriggering] = useState(false)
  
  const TriggerIcon = getTriggerIcon(agent.trigger_type)

  const handleTrigger = async () => {
    setIsTriggering(true)
    try {
      await onTrigger()
    } finally {
      setIsTriggering(false)
    }
  }

  return (
    <Card className={cn(
      "relative transition-all hover:shadow-md",
      agent.is_active ? "border-green-200" : "border-gray-200"
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            <div className={cn(
              "p-2 rounded-full",
              agent.is_active ? "bg-green-100" : "bg-gray-100"
            )}>
              <Bot className={cn(
                "h-4 w-4",
                agent.is_active ? "text-green-600" : "text-gray-600"
              )} />
            </div>
            <div>
              <h3 className="font-semibold text-sm">{agent.name}</h3>
              <div className="flex items-center space-x-1 mt-1">
                <TriggerIcon className={cn("h-3 w-3", getTriggerColor(agent.trigger_type))} />
                <span className={cn("text-xs capitalize", getTriggerColor(agent.trigger_type))}>
                  {agent.trigger_type}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggle}
              className="h-8 w-8 p-0"
            >
              <Power className={cn(
                "h-4 w-4",
                agent.is_active ? "text-green-600" : "text-gray-400"
              )} />
            </Button>
            
            {agent.workflow_url && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open(agent.workflow_url!, '_blank')}
                className="h-8 w-8 p-0"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            )}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Edit</DropdownMenuItem>
                <DropdownMenuItem>Duplicate</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="text-red-600"
                  onClick={onDelete}
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {agent.description && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {agent.description}
          </p>
        )}
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xs text-muted-foreground">
              Returns: {agent.return_type}
            </span>
          </div>
          
          {canTrigger(agent.trigger_type) && agent.is_active && (
            <Button 
              size="sm" 
              variant="outline"
              onClick={handleTrigger}
              disabled={isTriggering}
            >
              {isTriggering ? 'Running...' : 'Trigger'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}