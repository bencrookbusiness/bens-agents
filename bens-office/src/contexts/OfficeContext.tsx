import { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext'
import { useOffices, useCreateOffice } from '../hooks/useOffices'
import type { Office } from '../types/database'

interface OfficeContextType {
  selectedOffice: Office | null
  setSelectedOffice: (office: Office | null) => void
  offices: Office[]
  isLoading: boolean
  createDefaultOffice: () => Promise<void>
}

const OfficeContext = createContext<OfficeContextType | undefined>(undefined)

export function useOffice() {
  const context = useContext(OfficeContext)
  if (context === undefined) {
    throw new Error('useOffice must be used within an OfficeProvider')
  }
  return context
}

interface OfficeProviderProps {
  children: React.ReactNode
}

export function OfficeProvider({ children }: OfficeProviderProps) {
  const { user } = useAuth()
  const { data: offices = [], isLoading } = useOffices()
  const createOfficeMutation = useCreateOffice()
  const [selectedOffice, setSelectedOffice] = useState<Office | null>(null)

  // Auto-select first office or create one if none exist
  useEffect(() => {
    if (!isLoading && offices.length > 0 && !selectedOffice) {
      const storedOfficeId = localStorage.getItem('selectedOfficeId')
      const office = storedOfficeId 
        ? offices.find(o => o.id === storedOfficeId) || offices[0]
        : offices[0]
      setSelectedOffice(office)
    }
  }, [offices, isLoading, selectedOffice])

  // Save selected office to localStorage
  useEffect(() => {
    if (selectedOffice) {
      localStorage.setItem('selectedOfficeId', selectedOffice.id)
    }
  }, [selectedOffice])

  const createDefaultOffice = async () => {
    if (!user) return
    
    try {
      const newOffice = await createOfficeMutation.mutateAsync({
        name: 'My Office',
        description: 'Your default office workspace'
      })
      setSelectedOffice(newOffice)
    } catch (error) {
      console.error('Failed to create default office:', error)
    }
  }

  const value = {
    selectedOffice,
    setSelectedOffice,
    offices,
    isLoading,
    createDefaultOffice,
  }

  return <OfficeContext.Provider value={value}>{children}</OfficeContext.Provider>
}