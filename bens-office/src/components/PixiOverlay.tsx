import { useEffect, useRef } from 'react'
import { Application, Container, Graphics } from 'pixi.js'

interface PixiOverlayProps {
  departments: Array<{ id: string; name: string; position_x?: number; position_y?: number }>
  className?: string
}

export function PixiOverlay({ departments, className }: PixiOverlayProps) {
  const canvasRef = useRef<HTMLDivElement>(null)
  const appRef = useRef<Application | null>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    // Create PIXI application
    const app = new Application({
      width: 800,
      height: 600,
      backgroundColor: 0xf8fafc,
      alpha: 0.8
    })

    appRef.current = app
    canvasRef.current.appendChild(app.view as HTMLCanvasElement)

    // Create container for department sprites
    const departmentContainer = new Container()
    app.stage.addChild(departmentContainer)

    // Draw departments as simple desk sprites
    departments.forEach((dept, index) => {
      const desk = new Graphics()
      
      // Draw a simple desk rectangle
      desk.beginFill(0x8b5cf6) // Purple color
      desk.drawRoundedRect(0, 0, 80, 60, 8)
      desk.endFill()
      
      // Add a label background
      desk.beginFill(0xffffff)
      desk.drawRoundedRect(5, 5, 70, 20, 4)
      desk.endFill()

      // Position the desk
      const x = dept.position_x ?? (100 + (index % 4) * 120)
      const y = dept.position_y ?? (100 + Math.floor(index / 4) * 100)
      
      desk.x = x
      desk.y = y

      // Make it interactive for future features
      desk.eventMode = 'static'
      desk.cursor = 'pointer'
      
      desk.on('pointerdown', () => {
        console.log(`Clicked department: ${dept.name}`)
      })

      departmentContainer.addChild(desk)
    })

    // Cleanup function
    return () => {
      app.destroy(true)
    }
  }, [departments])

  return (
    <div 
      ref={canvasRef} 
      className={`absolute inset-0 pointer-events-none ${className || ''}`}
      style={{ zIndex: 1 }}
    />
  )
}