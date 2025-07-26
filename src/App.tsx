import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Dashboard } from '@/pages/Dashboard'
import Projects from '@/pages/Projects'
import ProjectDetails from '@/pages/ProjectDetails'
import './App.css'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/:id" element={<ProjectDetails />} />
          <Route path="/clients" element={<div>Clients Page Coming Soon</div>} />
          <Route path="/resources" element={<div>Resources Page Coming Soon</div>} />
          <Route path="/budget" element={<div>Budget Page Coming Soon</div>} />
          <Route path="/documents" element={<div>Documents Page Coming Soon</div>} />
          <Route path="/calendar" element={<div>Calendar Page Coming Soon</div>} />
          <Route path="/reports" element={<div>Reports Page Coming Soon</div>} />
        </Routes>
        <Toaster />
      </div>
    </Router>
  )
}

export default App