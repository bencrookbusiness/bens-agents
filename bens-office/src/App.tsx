import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Layout } from './components/Layout'
import { OfficeFloor } from './pages/OfficeFloor'
import { Department } from './pages/Department'

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<OfficeFloor />} />
            <Route path="/department/:departmentId" element={<Department />} />
          </Route>
        </Routes>
      </Router>
    </QueryClientProvider>
  )
}

export default App