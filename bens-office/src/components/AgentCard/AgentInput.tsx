import { useState, useCallback } from 'react'
import { 
  MousePointer, 
  MessageCircle, 
  Upload, 
  Clock, 
  Minus,
  Send,
  X
} from 'lucide-react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { cn } from '../../lib/utils'
import type { AgentInputProps } from './types'

export function AgentInput({ 
  agent, 
  value, 
  file, 
  isLoading, 
  error,
  onTextChange, 
  onFileChange, 
  onTrigger 
}: AgentInputProps) {
  const [isDragOver, setIsDragOver] = useState(false)

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (value.trim() || file) {
        onTrigger({ 
          message: value.trim(),
          file: file ? {
            name: file.name,
            type: file.type,
            size: file.size
          } : undefined
        })
      }
    }
  }

  const handleFileUpload = useCallback((uploadedFile: File) => {
    onFileChange(uploadedFile)
  }, [onFileChange])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) {
      handleFileUpload(droppedFile)
    }
  }, [handleFileUpload])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const renderInput = () => {
    switch (agent.trigger_type) {
      case 'chat':
        return (
          <div className="space-y-3">
            <div className="flex space-x-2">
              <div className="flex-1">
                <Textarea
                  value={value}
                  onChange={(e) => onTextChange(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="min-h-[40px] resize-none"
                  disabled={isLoading}
                />
              </div>
              <Button
                size="sm"
                onClick={() => onTrigger({ message: value.trim() })}
                disabled={isLoading || !value.trim()}
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
              <p className="text-sm text-red-600">{error}</p>
            )}
          </div>
        )

      case 'click':
        return (
          <div className="space-y-2">
            <Button
              onClick={() => onTrigger()}
              disabled={isLoading}
              className="w-full flex items-center space-x-2"
            >
              <MousePointer className="h-4 w-4" />
              <span>{isLoading ? 'Running...' : 'Trigger Agent'}</span>
            </Button>
            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}
          </div>
        )

      case 'upload':
        return (
          <div className="space-y-3">
            <div
              className={cn(
                "border-2 border-dashed rounded-lg p-4 text-center transition-colors",
                isDragOver ? "border-blue-400 bg-blue-50" : "border-gray-300",
                isLoading && "opacity-50 pointer-events-none"
              )}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              {file ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Upload className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium">{file.name}</span>
                    <span className="text-xs text-gray-500">
                      ({Math.round(file.size / 1024)}KB)
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onFileChange(null)}
                    disabled={isLoading}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div>
                  <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">
                    Drop a file here or click to upload
                  </p>
                  <input
                    type="file"
                    className="hidden"
                    id={`file-${agent.id}`}
                    onChange={(e) => {
                      const selectedFile = e.target.files?.[0]
                      if (selectedFile) {
                        handleFileUpload(selectedFile)
                      }
                    }}
                    disabled={isLoading}
                  />
                  <label
                    htmlFor={`file-${agent.id}`}
                    className="mt-2 inline-block cursor-pointer text-blue-600 hover:text-blue-800"
                  >
                    Choose file
                  </label>
                </div>
              )}
            </div>
            {file && (
              <Button
                onClick={() => onTrigger({ 
                  file: file  // Pass the actual File object
                })}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? 'Processing...' : 'Upload & Process'}
              </Button>
            )}
            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}
          </div>
        )

      case 'automatic':
        return (
          <div className="flex items-center justify-center p-4 bg-orange-50 rounded-lg border">
            <Clock className="h-5 w-5 text-orange-600 mr-2" />
            <span className="text-sm text-orange-700">Automatic trigger enabled</span>
          </div>
        )

      case 'none':
        return (
          <div className="flex items-center justify-center p-4 bg-gray-50 rounded-lg border">
            <Minus className="h-5 w-5 text-gray-600 mr-2" />
            <span className="text-sm text-gray-600">No manual trigger</span>
          </div>
        )

      default:
        return null
    }
  }

  // For chat triggers, return the input directly without extra header
  if (agent.trigger_type === 'chat') {
    return renderInput()
  }

  // For none and automatic, return the input directly  
  if (agent.trigger_type === 'none' || agent.trigger_type === 'automatic') {
    return renderInput()
  }

  // For other trigger types (click, upload), show the header
  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2 mb-2">
        <MessageCircle className="h-4 w-4 text-blue-600" />
        <span className="text-sm font-medium text-gray-700">Input</span>
      </div>
      {renderInput()}
    </div>
  )
}