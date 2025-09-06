import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { DepartmentCard } from '../components/DepartmentCard'
import { AddDepartmentModal } from '../components/AddDepartmentModal'
import type { Department } from '../types/database'

// Mock data for now
const mockDepartments: Department[] = [
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
        description: 'Reviews pull requests',
        trigger_type: 'upload',
        return_type: 'text',
        webhook_url: 'https://webhook.site/test',
        workflow_url: null,
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
        description: 'Generates marketing content',
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
        description: 'Processes analytics data',
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

export function OfficeFloor() {
  const [isAddDepartmentOpen, setIsAddDepartmentOpen] = useState(false)
  const [departments] = useState<Department[]>(mockDepartments)
  const navigate = useNavigate()

  const handleDepartmentClick = (departmentId: string) => {
    navigate(`/department/${departmentId}`)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Office Floor</h1>
          <p className="text-muted-foreground">
            Manage your departments and their AI agents
          </p>
        </div>
        <Button onClick={() => setIsAddDepartmentOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Department
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {departments.map((department) => (
          <DepartmentCard
            key={department.id}
            department={department}
            onClick={() => handleDepartmentClick(department.id)}
          />
        ))}
      </div>

      <AddDepartmentModal
        open={isAddDepartmentOpen}
        onOpenChange={setIsAddDepartmentOpen}
      />
    </div>
  )
}