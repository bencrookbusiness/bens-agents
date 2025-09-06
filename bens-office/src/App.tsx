import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './contexts/AuthContext'
import { OfficeProvider } from './contexts/OfficeContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Layout } from './components/Layout'
import { OfficeFloor } from './pages/OfficeFloor'
import { Department } from './pages/Department'
import { Login } from './pages/Login'

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <OfficeProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }>
                <Route index element={<OfficeFloor />} />
                <Route path="/department/:departmentId" element={<Department />} />
              </Route>
            </Routes>
          </Router>
        </OfficeProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App