export interface Project {
  id: string
  name: string
  description: string
  status: 'planning' | 'active' | 'on-hold' | 'completed' | 'cancelled'
  startDate: string
  endDate: string
  budget: number
  actualCost: number
  clientId: string
  userId: string
  createdAt: string
  updatedAt: string
}

export interface Milestone {
  id: string
  projectId: string
  name: string
  description: string
  dueDate: string
  status: 'pending' | 'in-progress' | 'completed' | 'overdue'
  progress: number
  userId: string
  createdAt: string
}

export interface Resource {
  id: string
  projectId: string
  name: string
  type: 'material' | 'equipment' | 'subcontractor'
  quantity: number
  unit: string
  costPerUnit: number
  totalCost: number
  supplier: string
  status: 'ordered' | 'delivered' | 'in-use' | 'completed'
  userId: string
  createdAt: string
}

export interface Client {
  id: string
  name: string
  email: string
  phone: string
  address: string
  company: string
  userId: string
  createdAt: string
}

export interface Document {
  id: string
  projectId: string
  name: string
  type: 'plan' | 'permit' | 'contract' | 'photo' | 'invoice' | 'other'
  fileUrl: string
  fileSize: number
  uploadedBy: string
  userId: string
  createdAt: string
}

export interface Task {
  id: string
  projectId: string
  milestoneId?: string
  name: string
  description: string
  status: 'todo' | 'in-progress' | 'completed'
  priority: 'low' | 'medium' | 'high'
  assignedTo: string
  dueDate: string
  userId: string
  createdAt: string
}