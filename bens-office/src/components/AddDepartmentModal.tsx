import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/dialog'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { useOffice } from '../contexts/OfficeContext'
import { useCreateDepartment } from '../hooks/useDepartments'

interface AddDepartmentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddDepartmentModal({ open, onOpenChange }: AddDepartmentModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  })
  const { selectedOffice } = useOffice()
  const createDepartment = useCreateDepartment()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.name.trim() && selectedOffice) {
      try {
        await createDepartment.mutateAsync({
          name: formData.name.trim(),
          office_id: selectedOffice.id
        })
        setFormData({ name: '', description: '' })
        onOpenChange(false)
      } catch (error) {
        console.error('Failed to create department:', error)
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Department</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Department Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Development, Marketing, Support"
              required
            />
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={createDepartment.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createDepartment.isPending || !selectedOffice}>
              {createDepartment.isPending ? 'Creating...' : 'Create Department'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}