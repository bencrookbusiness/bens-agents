import { useState } from 'react'
import { 
  Bot, 
  Power, 
  ExternalLink, 
  MoreHorizontal,
} from 'lucide-react'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader } from '../ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import { cn } from '../../lib/utils'
import { AgentInput } from './AgentInput'
import { AgentOutput } from './AgentOutput'
import type { AgentCardProps, AgentCardState, AgentResponse } from './types'

export function AgentCard({ agent, onToggle, onDelete, onTrigger }: AgentCardProps) {
  const [state, setState] = useState<AgentCardState>({
    inputValue: '',
    fileInput: null,
    outputValue: null,
    isLoading: false,
    error: null,
    responses: []
  })

  const handleTrigger = async (payload?: any) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      const result = await onTrigger(payload)
      
      // Create response record with better JSON handling
      let outputText: string | null = null
      
      if (typeof result === 'string') {
        outputText = result
      } else if (result && typeof result === 'object') {
        // Try common response property names
        outputText = result.message || result.text || result.response || result.data || result.output
        
        // If none found, stringify the entire object
        if (!outputText) {
          outputText = JSON.stringify(result, null, 2)
        }
      }
      
      const response: AgentResponse = {
        id: Date.now().toString(),
        timestamp: new Date(),
        input: payload?.message || payload?.file?.name || 'Clicked',
        output: outputText,
        status: 'success'
      }

      setState(prev => ({
        ...prev,
        outputValue: response.output,
        responses: [response, ...prev.responses].slice(0, 10), // Keep last 10 responses
        inputValue: agent.trigger_type === 'chat' ? '' : prev.inputValue, // Clear input for chat type
        fileInput: agent.trigger_type === 'upload' ? null : prev.fileInput, // Clear file for upload type
        isLoading: false
      }))

    } catch (error: any) {
      const errorResponse: AgentResponse = {
        id: Date.now().toString(),
        timestamp: new Date(),
        input: payload?.message || payload?.file?.name || 'Clicked',
        output: null,
        status: 'error'
      }

      setState(prev => ({
        ...prev,
        error: error.message || 'Failed to trigger agent',
        responses: [errorResponse, ...prev.responses].slice(0, 10),
        isLoading: false
      }))
    }
  }

  const shouldShowInput = () => {
    return ['chat', 'upload', 'click'].includes(agent.trigger_type)
  }

  const shouldShowOutput = () => {
    return agent.return_type !== 'none'
  }

  const getLayoutClasses = () => {
    const hasInput = shouldShowInput()
    const hasOutput = shouldShowOutput()

    // Special case: chat → chat should be single unified interface
    if (agent.trigger_type === 'chat' && agent.return_type === 'chat') {
      return 'space-y-4'
    }

    if (hasInput && hasOutput) {
      return 'grid grid-cols-1 lg:grid-cols-2 gap-4'
    }
    return 'space-y-4'
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
              <div className="flex items-center space-x-2 mt-1">
                <span className={cn(
                  "text-xs px-2 py-0.5 rounded-full border capitalize",
                  shouldShowInput() ? "bg-blue-50 border-blue-200 text-blue-700" : "bg-gray-50 border-gray-200 text-gray-600"
                )}>
                  {agent.trigger_type}
                </span>
                <span className="text-xs text-gray-400">→</span>
                <span className={cn(
                  "text-xs px-2 py-0.5 rounded-full border capitalize",
                  shouldShowOutput() ? "bg-green-50 border-green-200 text-green-700" : "bg-gray-50 border-gray-200 text-gray-600"
                )}>
                  {agent.return_type}
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
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {agent.description}
          </p>
        )}

        {!agent.is_active ? (
          <div className="text-center py-8 text-gray-500">
            <Power className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm">Agent is inactive</p>
            <p className="text-xs text-gray-400">Click the power button to activate</p>
          </div>
        ) : (
          <div className={getLayoutClasses()}>
            {/* Special case: chat → chat uses unified chat interface */}
            {agent.trigger_type === 'chat' && agent.return_type === 'chat' ? (
              <div>
                <AgentOutput
                  agent={agent}
                  value={state.outputValue}
                  responses={state.responses}
                  isLoading={state.isLoading}
                  onTextChange={(value) => setState(prev => ({ ...prev, inputValue: value }))}
                  onTrigger={handleTrigger}
                  inputValue={state.inputValue}
                  error={state.error}
                />
              </div>
            ) : (
              <>
                {shouldShowInput() && (
                  <div>
                    <AgentInput
                      agent={agent}
                      value={state.inputValue}
                      file={state.fileInput}
                      isLoading={state.isLoading}
                      error={state.error}
                      onTextChange={(value) => setState(prev => ({ ...prev, inputValue: value }))}
                      onFileChange={(file) => setState(prev => ({ ...prev, fileInput: file }))}
                      onTrigger={handleTrigger}
                    />
                  </div>
                )}

                {shouldShowOutput() && (
                  <div>
                    <AgentOutput
                      agent={agent}
                      value={state.outputValue}
                      responses={state.responses}
                      isLoading={state.isLoading}
                    />
                  </div>
                )}
              </>
            )}

            {/* Special case for automatic triggers */}
            {agent.trigger_type === 'automatic' && !shouldShowInput() && (
              <div className="col-span-full">
                <AgentInput
                  agent={agent}
                  value=""
                  file={null}
                  isLoading={false}
                  error={null}
                  onTextChange={() => {}}
                  onFileChange={() => {}}
                  onTrigger={() => {}}
                />
              </div>
            )}

            {agent.trigger_type === 'none' && agent.return_type === 'none' && (
              <div className="text-center py-8 text-gray-500">
                <Bot className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm">Agent configured for external triggers only</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}