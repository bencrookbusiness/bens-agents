import { useState } from 'react'
import { Plus, Building2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { DepartmentCard } from '../components/DepartmentCard'
import { AddDepartmentModal } from '../components/AddDepartmentModal'
import { useOffice } from '../contexts/OfficeContext'
import { useDepartments } from '../hooks/useDepartments'

export function OfficeFloor() {
  const [isAddDepartmentOpen, setIsAddDepartmentOpen] = useState(false)
  const navigate = useNavigate()
  const { selectedOffice, createDefaultOffice } = useOffice()
  const { data: departments = [], isLoading, error } = useDepartments(selectedOffice?.id)

  const handleDepartmentClick = (departmentId: string) => {
    navigate(`/department/${departmentId}`)
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Office Floor</h1>
            <p className="text-muted-foreground">Loading departments...</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-gray-200 animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">Error loading departments: {error.message}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    )
  }

  // Show no office selected state
  if (!selectedOffice) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <Building2 className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-xl font-medium mb-2">No Office Selected</h2>
          <p className="text-muted-foreground mb-4">
            Create your first office to get started
          </p>
          <Button onClick={createDefaultOffice}>
            <Plus className="h-4 w-4 mr-2" />
            Create My First Office
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{selectedOffice.name}</h1>
          <p className="text-muted-foreground">
            {selectedOffice.description || 'Manage your departments and their AI agents'}
          </p>
        </div>
        <Button onClick={() => setIsAddDepartmentOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Department
        </Button>
      </div>

      {departments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.map((department) => (
            <DepartmentCard
              key={department.id}
              department={department}
              onClick={() => handleDepartmentClick(department.id)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border-2 border-dashed border-muted rounded-lg">
          <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-lg font-medium mb-2">No departments yet</p>
          <p className="text-muted-foreground mb-4">
            Get started by creating your first department
          </p>
          <Button onClick={() => setIsAddDepartmentOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Your First Department
          </Button>
        </div>
      )}

      <AddDepartmentModal
        open={isAddDepartmentOpen}
        onOpenChange={setIsAddDepartmentOpen}
      />
    </div>
  )
}