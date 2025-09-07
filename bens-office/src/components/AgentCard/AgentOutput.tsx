import { useState } from 'react'
import { 
  Copy, 
  Check, 
  MessageSquare, 
  FileText, 
  Minus,
  ChevronDown,
  ChevronUp,
  Send
} from 'lucide-react'
import { Button } from '../ui/button'
import { Textarea } from '../ui/textarea'
import { cn } from '../../lib/utils'
import type { AgentOutputProps } from './types'

export function AgentOutput({ 
  agent, 
  value, 
  responses, 
  isLoading,
  // Optional props for unified chat interface
  onTextChange,
  onTrigger,
  inputValue = '',
  error
}: AgentOutputProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const [isExpanded, setIsExpanded] = useState(false)
  const [showAllResponses, setShowAllResponses] = useState(false)

  // Handler for unified chat interface
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && onTrigger && onTextChange) {
      e.preventDefault()
      if (inputValue.trim()) {
        onTrigger({ message: inputValue.trim() })
      }
    }
  }

  const copyToClipboard = async (text: string, index?: number) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedIndex(index ?? -1)
      setTimeout(() => setCopiedIndex(null), 2000)
    } catch (err) {
      console.error('Failed to copy text:', err)
    }
  }

  const renderOutput = () => {
    switch (agent.return_type) {
      case 'text':
        return (
          <div className="space-y-3">
            {/* Current/Latest Response */}
            {(value || isLoading) && (
              <div className="border rounded-lg p-3 bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Latest Response</span>
                  {value && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(value)}
                      className="h-6 px-2"
                    >
                      {copiedIndex === -1 ? (
                        <Check className="h-3 w-3 text-green-600" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </Button>
                  )}
                </div>
                {isLoading ? (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    <span>Processing...</span>
                  </div>
                ) : value ? (
                  <div className={cn(
                    "text-sm whitespace-pre-wrap",
                    value.length > 200 && !isExpanded && "line-clamp-3"
                  )}>
                    {value}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">No response yet</p>
                )}
                {value && value.length > 200 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="mt-2 h-6 px-2 text-xs"
                  >
                    {isExpanded ? (
                      <>
                        <ChevronUp className="h-3 w-3 mr-1" />
                        Show Less
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-3 w-3 mr-1" />
                        Show More
                      </>
                    )}
                  </Button>
                )}
              </div>
            )}

            {/* Response History */}
            {responses.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    Response History ({responses.length})
                  </span>
                  {responses.length > 3 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowAllResponses(!showAllResponses)}
                      className="h-6 px-2 text-xs"
                    >
                      {showAllResponses ? 'Show Less' : 'Show All'}
                    </Button>
                  )}
                </div>
                <div className="h-32 overflow-y-auto space-y-2">
                  {(showAllResponses ? responses : responses.slice(0, 3)).map((response, index) => (
                    <div
                      key={response.id}
                      className="border rounded p-2 bg-white text-xs"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-gray-500">
                          {response.timestamp.toLocaleTimeString()}
                        </span>
                        {response.output && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(response.output!, index)}
                            className="h-4 px-1"
                          >
                            {copiedIndex === index ? (
                              <Check className="h-2 w-2 text-green-600" />
                            ) : (
                              <Copy className="h-2 w-2" />
                            )}
                          </Button>
                        )}
                      </div>
                      {response.output ? (
                        <p className="text-gray-800 line-clamp-2">{response.output}</p>
                      ) : (
                        <p className="text-gray-500 italic">No response</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )

      case 'chat':
        return (
          <div className="space-y-3">
            <div className="border rounded-lg bg-white">
              <div className="flex items-center justify-between p-3 border-b">
                <span className="text-sm font-medium text-gray-700">Chat Output</span>
                <MessageSquare className="h-4 w-4 text-blue-600" />
              </div>
              <div className="h-48 p-3 overflow-y-auto">
                {responses.length === 0 && !value && !isLoading ? (
                  <p className="text-sm text-gray-500 italic text-center py-8">
                    Chat responses will appear here
                  </p>
                ) : (
                  <div className="space-y-2">
                    {responses.map((response) => (
                      <div key={response.id} className="space-y-1">
                        {response.input && (
                          <div className="text-sm bg-blue-100 rounded p-2 ml-8">
                            <strong>You:</strong> {response.input.toString()}
                          </div>
                        )}
                        {response.output && (
                          <div className="text-sm bg-gray-100 rounded p-2 mr-8">
                            <strong>Agent:</strong> {response.output}
                          </div>
                        )}
                      </div>
                    ))}
                    {isLoading && (
                      <div className="text-sm bg-gray-100 rounded p-2 mr-8">
                        <strong>Agent:</strong>
                        <div className="flex items-center space-x-2 mt-1">
                          <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" />
                          <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                          <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                        </div>
                      </div>
                    )}
                    {value && !isLoading && (
                      <div className="text-sm bg-gray-100 rounded p-2 mr-8">
                        <strong>Agent:</strong> {value}
                      </div>
                    )}
                  </div>
                )}
              </div>
              {/* Add input section for unified chat interface (chat → chat) */}
              {onTextChange && onTrigger && (
                <div className="border-t p-3">
                  <div className="flex space-x-2">
                    <div className="flex-1">
                      <Textarea
                        value={inputValue}
                        onChange={(e) => onTextChange(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type your message..."
                        className="min-h-[40px] resize-none"
                        disabled={isLoading}
                      />
                    </div>
                    <Button
                      size="sm"
                      onClick={() => onTrigger({ message: inputValue.trim() })}
                      disabled={isLoading || !inputValue.trim()}
                      className="px-3"
                    >
                      {isLoading ? (
                        <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {error && (
                    <p className="text-sm text-red-600 mt-2">{error}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        )

      case 'none':
        return (
          <div className="flex items-center justify-center p-4 bg-gray-50 rounded-lg border">
            <Minus className="h-5 w-5 text-gray-600 mr-2" />
            <span className="text-sm text-gray-600">No output expected</span>
          </div>
        )

      default:
        return null
    }
  }

  if (agent.return_type === 'none') {
    return renderOutput()
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2 mb-2">
        <FileText className="h-4 w-4 text-green-600" />
        <span className="text-sm font-medium text-gray-700">Output</span>
      </div>
      {renderOutput()}
    </div>
  )
}