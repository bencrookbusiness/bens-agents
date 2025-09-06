import { useState } from 'react'
import { Upload, MessageCircle, Send } from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { Card, CardContent } from './ui/card'
import { useTriggerAgent } from '../hooks/useAgents'
import type { Agent } from '../types/database'

interface AgentTriggerProps {
  agent: Agent
  onResult?: (result: any) => void
}

export function AgentTrigger({ agent, onResult }: AgentTriggerProps) {
  const [chatMessage, setChatMessage] = useState('')
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [result, setResult] = useState<any>(null)
  
  const triggerAgent = useTriggerAgent()

  const handleTrigger = async (payload?: Record<string, any>) => {
    try {
      const result = await triggerAgent.mutateAsync({ agent, payload })
      setResult(result)
      onResult?.(result)
      
      // Reset form
      setChatMessage('')
      setUploadedFile(null)
    } catch (error) {
      console.error('Failed to trigger agent:', error)
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setUploadedFile(file)
      // Convert file to base64 for transmission
      const reader = new FileReader()
      reader.onload = () => {
        handleTrigger({
          file: {
            name: file.name,
            type: file.type,
            size: file.size,
            content: reader.result
          }
        })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (chatMessage.trim()) {
      handleTrigger({ message: chatMessage.trim() })
    }
  }

  if (agent.trigger_type === 'click') {
    return (
      <div className="space-y-4">
        <Button 
          onClick={() => handleTrigger()} 
          disabled={triggerAgent.isPending}
          className="w-full"
        >
          {triggerAgent.isPending ? 'Running...' : `Trigger ${agent.name}`}
        </Button>
        {result && agent.return_type !== 'none' && (
          <Card>
            <CardContent className="p-4">
              <pre className="text-sm whitespace-pre-wrap">
                {typeof result === 'string' ? result : JSON.stringify(result, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  if (agent.trigger_type === 'chat') {
    return (
      <div className="space-y-4">
        <form onSubmit={handleChatSubmit} className="flex space-x-2">
          <Input
            value={chatMessage}
            onChange={(e) => setChatMessage(e.target.value)}
            placeholder="Type your message..."
            disabled={triggerAgent.isPending}
          />
          <Button 
            type="submit" 
            disabled={!chatMessage.trim() || triggerAgent.isPending}
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
        
        {result && agent.return_type === 'chat' && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-start space-x-2">
                <MessageCircle className="h-5 w-5 mt-1 text-blue-600" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-1">{agent.name}</p>
                  <p className="text-sm">
                    {typeof result === 'string' ? result : JSON.stringify(result)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  if (agent.trigger_type === 'upload') {
    return (
      <div className="space-y-4">
        <div className="border-2 border-dashed border-muted rounded-lg p-6 text-center">
          <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground mb-2">
            Upload a file to trigger {agent.name}
          </p>
          <input
            type="file"
            onChange={handleFileUpload}
            disabled={triggerAgent.isPending}
            className="hidden"
            id={`file-upload-${agent.id}`}
          />
          <label htmlFor={`file-upload-${agent.id}`}>
            <Button variant="outline" disabled={triggerAgent.isPending} asChild>
              <span>
                {triggerAgent.isPending ? 'Processing...' : 'Choose File'}
              </span>
            </Button>
          </label>
        </div>
        
        {uploadedFile && (
          <p className="text-sm text-muted-foreground">
            Uploaded: {uploadedFile.name}
          </p>
        )}
        
        {result && agent.return_type !== 'none' && (
          <Card>
            <CardContent className="p-4">
              <pre className="text-sm whitespace-pre-wrap">
                {typeof result === 'string' ? result : JSON.stringify(result, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  if (agent.trigger_type === 'automatic' || agent.trigger_type === 'none') {
    return (
      <Card>
        <CardContent className="p-4 text-center">
          <p className="text-sm text-muted-foreground">
            This agent {agent.trigger_type === 'automatic' ? 'runs automatically' : 'is triggered externally'}
          </p>
        </CardContent>
      </Card>
    )
  }

  return null
}