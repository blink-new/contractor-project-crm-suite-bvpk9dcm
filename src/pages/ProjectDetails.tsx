import React, { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Calendar, DollarSign, MapPin, Users, FileText, MessageSquare, Plus, CheckCircle, Clock, AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { blink } from '@/blink/client'
import { supabase } from '@/lib/supabase'
import { Project, Milestone, Resource, Task, ClientUpdate } from '@/types'
import { format } from 'date-fns'

export default function ProjectDetails() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [project, setProject] = useState<Project | null>(null)
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [resources, setResources] = useState<Resource[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [clientUpdates, setClientUpdates] = useState<ClientUpdate[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  // Dialog states
  const [showMilestoneDialog, setShowMilestoneDialog] = useState(false)
  const [showResourceDialog, setShowResourceDialog] = useState(false)
  const [showTaskDialog, setShowTaskDialog] = useState(false)
  const [showUpdateDialog, setShowUpdateDialog] = useState(false)

  // Form states
  const [milestoneForm, setMilestoneForm] = useState({
    title: '',
    description: '',
    dueDate: '',
    status: 'pending' as const
  })

  const [resourceForm, setResourceForm] = useState({
    name: '',
    type: 'material' as const,
    quantity: '',
    cost: '',
    supplier: '',
    status: 'ordered' as const
  })

  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    assignedTo: '',
    dueDate: '',
    priority: 'medium' as const,
    status: 'todo' as const,
    milestoneId: ''
  })

  const [updateForm, setUpdateForm] = useState({
    title: '',
    message: '',
    type: 'progress' as const
  })

  const loadProjectData = useCallback(async () => {
    try {
      setLoading(true)
      const user = await blink.auth.me()
      
      // Load project
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .eq('id', id)
        .single()
      
      if (projectError || !projectData) {
        navigate('/projects')
        return
      }
      
      // Transform project data
      const transformedProject = {
        id: projectData.id,
        name: projectData.name,
        description: projectData.description,
        client: projectData.client,
        location: projectData.location,
        budget: projectData.budget || 0,
        startDate: projectData.start_date,
        endDate: projectData.end_date,
        status: projectData.status,
        userId: projectData.user_id,
        createdAt: projectData.created_at
      }
      setProject(transformedProject)

      // Load milestones
      const { data: milestonesData } = await supabase
        .from('milestones')
        .select('*')
        .eq('project_id', id)
        .order('due_date', { ascending: true })
      
      const transformedMilestones = milestonesData?.map(milestone => ({
        id: milestone.id,
        projectId: milestone.project_id,
        userId: milestone.user_id,
        title: milestone.title,
        description: milestone.description,
        dueDate: milestone.due_date,
        status: milestone.status,
        createdAt: milestone.created_at
      })) || []
      setMilestones(transformedMilestones)

      // Load resources
      const { data: resourcesData } = await supabase
        .from('resources')
        .select('*')
        .eq('project_id', id)
        .order('created_at', { ascending: false })
      
      const transformedResources = resourcesData?.map(resource => ({
        id: resource.id,
        projectId: resource.project_id,
        userId: resource.user_id,
        name: resource.name,
        type: resource.type,
        quantity: resource.quantity || 0,
        unit: resource.unit,
        cost: resource.cost || 0,
        supplier: resource.supplier,
        status: resource.status,
        createdAt: resource.created_at
      })) || []
      setResources(transformedResources)

      // Load tasks
      const { data: tasksData } = await supabase
        .from('tasks')
        .select('*')
        .eq('project_id', id)
        .order('created_at', { ascending: false })
      
      const transformedTasks = tasksData?.map(task => ({
        id: task.id,
        projectId: task.project_id,
        milestoneId: task.milestone_id,
        userId: task.user_id,
        title: task.title,
        description: task.description,
        priority: task.priority,
        status: task.status,
        assignedTo: task.assigned_to,
        dueDate: task.due_date,
        createdAt: task.created_at
      })) || []
      setTasks(transformedTasks)

      // Load client updates
      const { data: updatesData } = await supabase
        .from('client_updates')
        .select('*')
        .eq('project_id', id)
        .order('created_at', { ascending: false })
      
      const transformedUpdates = updatesData?.map(update => ({
        id: update.id,
        projectId: update.project_id,
        userId: update.user_id,
        type: update.type,
        title: update.title,
        message: update.message,
        createdAt: update.created_at
      })) || []
      setClientUpdates(transformedUpdates)

    } catch (error) {
      console.error('Error loading project data:', error)
    } finally {
      setLoading(false)
    }
  }, [id, navigate])

  useEffect(() => {
    if (id) {
      loadProjectData()
    }
  }, [id, loadProjectData])

  const createMilestone = async () => {
    try {
      const user = await blink.auth.me()
      const { error } = await supabase
        .from('milestones')
        .insert([{
          title: milestoneForm.title,
          description: milestoneForm.description || null,
          due_date: milestoneForm.dueDate || null,
          status: milestoneForm.status,
          project_id: id!,
          user_id: user.id
        }])
      
      if (error) throw error
      
      setMilestoneForm({ title: '', description: '', dueDate: '', status: 'pending' })
      setShowMilestoneDialog(false)
      loadProjectData()
    } catch (error) {
      console.error('Error creating milestone:', error)
    }
  }

  const createResource = async () => {
    try {
      const user = await blink.auth.me()
      const { error } = await supabase
        .from('resources')
        .insert([{
          name: resourceForm.name,
          type: resourceForm.type,
          quantity: parseInt(resourceForm.quantity) || null,
          cost: parseFloat(resourceForm.cost) || null,
          supplier: resourceForm.supplier || null,
          status: resourceForm.status,
          project_id: id!,
          user_id: user.id
        }])
      
      if (error) throw error
      
      setResourceForm({ name: '', type: 'material', quantity: '', cost: '', supplier: '', status: 'ordered' })
      setShowResourceDialog(false)
      loadProjectData()
    } catch (error) {
      console.error('Error creating resource:', error)
    }
  }

  const createTask = async () => {
    try {
      const user = await blink.auth.me()
      const { error } = await supabase
        .from('tasks')
        .insert([{
          title: taskForm.title,
          description: taskForm.description || null,
          assigned_to: taskForm.assignedTo || null,
          due_date: taskForm.dueDate || null,
          priority: taskForm.priority,
          status: taskForm.status === 'todo' ? 'pending' : taskForm.status,
          milestone_id: taskForm.milestoneId || null,
          project_id: id!,
          user_id: user.id
        }])
      
      if (error) throw error
      
      setTaskForm({ title: '', description: '', assignedTo: '', dueDate: '', priority: 'medium', status: 'todo', milestoneId: '' })
      setShowTaskDialog(false)
      loadProjectData()
    } catch (error) {
      console.error('Error creating task:', error)
    }
  }

  const createClientUpdate = async () => {
    try {
      const user = await blink.auth.me()
      const { error } = await supabase
        .from('client_updates')
        .insert([{
          title: updateForm.title,
          message: updateForm.message,
          type: updateForm.type,
          project_id: id!,
          user_id: user.id
        }])
      
      if (error) throw error
      
      setUpdateForm({ title: '', message: '', type: 'progress' })
      setShowUpdateDialog(false)
      loadProjectData()
    } catch (error) {
      console.error('Error creating client update:', error)
    }
  }

  const toggleTaskStatus = async (taskId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'completed' ? 'pending' : 'completed'
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status: newStatus })
        .eq('id', taskId)
      
      if (error) throw error
      loadProjectData()
    } catch (error) {
      console.error('Error updating task:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'in-progress': return 'bg-blue-100 text-blue-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'on-hold': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600'
      case 'medium': return 'text-yellow-600'
      case 'low': return 'text-green-600'
      default: return 'text-gray-600'
    }
  }

  const calculateProjectProgress = () => {
    if (milestones.length === 0) return 0
    const completedMilestones = milestones.filter(m => m.status === 'completed').length
    return Math.round((completedMilestones / milestones.length) * 100)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading project details...</div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Project not found</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/projects')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Projects
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
            <p className="text-gray-600">{project.description}</p>
          </div>
        </div>
        <Badge className={getStatusColor(project.status)}>
          {project.status.replace('-', ' ').toUpperCase()}
        </Badge>
      </div>

      {/* Project Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Timeline</p>
                <p className="text-lg font-semibold">
                  {format(new Date(project.startDate), 'MMM d')} - {format(new Date(project.endDate), 'MMM d, yyyy')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Budget</p>
                <p className="text-lg font-semibold">${project.budget.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Location</p>
                <p className="text-lg font-semibold">{project.location}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Client</p>
                <p className="text-lg font-semibold">{project.client}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Project Progress</CardTitle>
          <CardDescription>Overall completion based on milestones</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{calculateProjectProgress()}%</span>
            </div>
            <Progress value={calculateProjectProgress()} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Tabs for different sections */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="milestones">Milestones</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="communication">Communication</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Tasks Overview */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Tasks</CardTitle>
                <CardDescription>Latest project tasks and their status</CardDescription>
              </div>
              <Dialog open={showTaskDialog} onOpenChange={setShowTaskDialog}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Task
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Task</DialogTitle>
                    <DialogDescription>Add a new task to this project</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="task-title">Title</Label>
                      <Input
                        id="task-title"
                        value={taskForm.title}
                        onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                        placeholder="Task title"
                      />
                    </div>
                    <div>
                      <Label htmlFor="task-description">Description</Label>
                      <Textarea
                        id="task-description"
                        value={taskForm.description}
                        onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                        placeholder="Task description"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="task-assigned">Assigned To</Label>
                        <Input
                          id="task-assigned"
                          value={taskForm.assignedTo}
                          onChange={(e) => setTaskForm({ ...taskForm, assignedTo: e.target.value })}
                          placeholder="Person or team"
                        />
                      </div>
                      <div>
                        <Label htmlFor="task-due">Due Date</Label>
                        <Input
                          id="task-due"
                          type="date"
                          value={taskForm.dueDate}
                          onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="task-priority">Priority</Label>
                        <Select value={taskForm.priority} onValueChange={(value: any) => setTaskForm({ ...taskForm, priority: value })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="task-milestone">Milestone</Label>
                        <Select value={taskForm.milestoneId} onValueChange={(value) => setTaskForm({ ...taskForm, milestoneId: value })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select milestone" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">No milestone</SelectItem>
                            {milestones.map((milestone) => (
                              <SelectItem key={milestone.id} value={milestone.id}>
                                {milestone.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setShowTaskDialog(false)}>
                        Cancel
                      </Button>
                      <Button onClick={createTask}>Create Task</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {tasks.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No tasks yet. Create your first task to get started.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {tasks.slice(0, 5).map((task) => (
                    <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleTaskStatus(task.id, task.status)}
                          className="p-0 h-6 w-6"
                        >
                          {task.status === 'completed' ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : (
                            <Clock className="h-5 w-5 text-gray-400" />
                          )}
                        </Button>
                        <div>
                          <p className={`font-medium ${task.status === 'completed' ? 'line-through text-gray-500' : ''}`}>
                            {task.title}
                          </p>
                          <p className="text-sm text-gray-600">{task.assignedTo}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className={`h-4 w-4 ${getPriorityColor(task.priority)}`} />
                        {task.dueDate && (
                          <span className="text-sm text-gray-500">
                            {format(new Date(task.dueDate), 'MMM d')}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="milestones" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Project Milestones</CardTitle>
                <CardDescription>Track major project milestones and deadlines</CardDescription>
              </div>
              <Dialog open={showMilestoneDialog} onOpenChange={setShowMilestoneDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Milestone
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Milestone</DialogTitle>
                    <DialogDescription>Add a new milestone to track project progress</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="milestone-title">Title</Label>
                      <Input
                        id="milestone-title"
                        value={milestoneForm.title}
                        onChange={(e) => setMilestoneForm({ ...milestoneForm, title: e.target.value })}
                        placeholder="Milestone title"
                      />
                    </div>
                    <div>
                      <Label htmlFor="milestone-description">Description</Label>
                      <Textarea
                        id="milestone-description"
                        value={milestoneForm.description}
                        onChange={(e) => setMilestoneForm({ ...milestoneForm, description: e.target.value })}
                        placeholder="Milestone description"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="milestone-due">Due Date</Label>
                        <Input
                          id="milestone-due"
                          type="date"
                          value={milestoneForm.dueDate}
                          onChange={(e) => setMilestoneForm({ ...milestoneForm, dueDate: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="milestone-status">Status</Label>
                        <Select value={milestoneForm.status} onValueChange={(value: any) => setMilestoneForm({ ...milestoneForm, status: value })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="in-progress">In Progress</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setShowMilestoneDialog(false)}>
                        Cancel
                      </Button>
                      <Button onClick={createMilestone}>Create Milestone</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {milestones.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No milestones yet. Create your first milestone to track progress.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {milestones.map((milestone, index) => (
                    <div key={milestone.id} className="relative">
                      {index < milestones.length - 1 && (
                        <div className="absolute left-4 top-8 w-0.5 h-16 bg-gray-200"></div>
                      )}
                      <div className="flex items-start space-x-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          milestone.status === 'completed' ? 'bg-green-100' : 
                          milestone.status === 'in-progress' ? 'bg-blue-100' : 'bg-gray-100'
                        }`}>
                          {milestone.status === 'completed' ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : milestone.status === 'in-progress' ? (
                            <Clock className="h-5 w-5 text-blue-600" />
                          ) : (
                            <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-gray-900">{milestone.title}</h3>
                            <Badge className={getStatusColor(milestone.status)}>
                              {milestone.status.replace('-', ' ')}
                            </Badge>
                          </div>
                          <p className="text-gray-600 mt-1">{milestone.description}</p>
                          <p className="text-sm text-gray-500 mt-2">
                            Due: {format(new Date(milestone.dueDate), 'MMM d, yyyy')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resources" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Project Resources</CardTitle>
                <CardDescription>Manage materials, equipment, and subcontractors</CardDescription>
              </div>
              <Dialog open={showResourceDialog} onOpenChange={setShowResourceDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Resource
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Resource</DialogTitle>
                    <DialogDescription>Add materials, equipment, or subcontractor to this project</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="resource-name">Name</Label>
                      <Input
                        id="resource-name"
                        value={resourceForm.name}
                        onChange={(e) => setResourceForm({ ...resourceForm, name: e.target.value })}
                        placeholder="Resource name"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="resource-type">Type</Label>
                        <Select value={resourceForm.type} onValueChange={(value: any) => setResourceForm({ ...resourceForm, type: value })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="material">Material</SelectItem>
                            <SelectItem value="equipment">Equipment</SelectItem>
                            <SelectItem value="subcontractor">Subcontractor</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="resource-quantity">Quantity</Label>
                        <Input
                          id="resource-quantity"
                          type="number"
                          value={resourceForm.quantity}
                          onChange={(e) => setResourceForm({ ...resourceForm, quantity: e.target.value })}
                          placeholder="Quantity"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="resource-cost">Cost</Label>
                        <Input
                          id="resource-cost"
                          type="number"
                          step="0.01"
                          value={resourceForm.cost}
                          onChange={(e) => setResourceForm({ ...resourceForm, cost: e.target.value })}
                          placeholder="Cost per unit"
                        />
                      </div>
                      <div>
                        <Label htmlFor="resource-supplier">Supplier</Label>
                        <Input
                          id="resource-supplier"
                          value={resourceForm.supplier}
                          onChange={(e) => setResourceForm({ ...resourceForm, supplier: e.target.value })}
                          placeholder="Supplier name"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="resource-status">Status</Label>
                      <Select value={resourceForm.status} onValueChange={(value: any) => setResourceForm({ ...resourceForm, status: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ordered">Ordered</SelectItem>
                          <SelectItem value="delivered">Delivered</SelectItem>
                          <SelectItem value="in-use">In Use</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setShowResourceDialog(false)}>
                        Cancel
                      </Button>
                      <Button onClick={createResource}>Add Resource</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {resources.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No resources yet. Add materials, equipment, or subcontractors.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Cost</TableHead>
                      <TableHead>Supplier</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {resources.map((resource) => (
                      <TableRow key={resource.id}>
                        <TableCell className="font-medium">{resource.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {resource.type}
                          </Badge>
                        </TableCell>
                        <TableCell>{resource.quantity}</TableCell>
                        <TableCell>${resource.cost.toFixed(2)}</TableCell>
                        <TableCell>{resource.supplier}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(resource.status)}>
                            {resource.status.replace('-', ' ')}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="communication" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Client Communication</CardTitle>
                <CardDescription>Project updates and messages for your client</CardDescription>
              </div>
              <Dialog open={showUpdateDialog} onOpenChange={setShowUpdateDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Send Update
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Send Client Update</DialogTitle>
                    <DialogDescription>Share project progress with your client</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="update-title">Title</Label>
                      <Input
                        id="update-title"
                        value={updateForm.title}
                        onChange={(e) => setUpdateForm({ ...updateForm, title: e.target.value })}
                        placeholder="Update title"
                      />
                    </div>
                    <div>
                      <Label htmlFor="update-message">Message</Label>
                      <Textarea
                        id="update-message"
                        value={updateForm.message}
                        onChange={(e) => setUpdateForm({ ...updateForm, message: e.target.value })}
                        placeholder="Update message for client"
                        rows={4}
                      />
                    </div>
                    <div>
                      <Label htmlFor="update-type">Type</Label>
                      <Select value={updateForm.type} onValueChange={(value: any) => setUpdateForm({ ...updateForm, type: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="progress">Progress Update</SelectItem>
                          <SelectItem value="milestone">Milestone Completed</SelectItem>
                          <SelectItem value="issue">Issue/Delay</SelectItem>
                          <SelectItem value="completion">Project Completion</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setShowUpdateDialog(false)}>
                        Cancel
                      </Button>
                      <Button onClick={createClientUpdate}>Send Update</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {clientUpdates.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No client updates yet. Send your first update to keep clients informed.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {clientUpdates.map((update) => (
                    <div key={update.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-900">{update.title}</h3>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">{update.type.replace('-', ' ')}</Badge>
                          <span className="text-sm text-gray-500">
                            {format(new Date(update.createdAt), 'MMM d, yyyy')}
                          </span>
                        </div>
                      </div>
                      <p className="text-gray-700">{update.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}