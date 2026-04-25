import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface Task {
  description: string
  startDate: string
  endDate: string
}

export default function WorkOrderForm() {
  const [workOrderDetails, setWorkOrderDetails] = useState({
    workOrderNumber: '',
    projectName: '',
    clientName: '',
    contractorName: '',
    startDate: '',
    endDate: '',
    totalValue: ''
  })

  const [tasks, setTasks] = useState<Task[]>([
    { description: '', startDate: '', endDate: '' }
  ])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setWorkOrderDetails(prev => ({ ...prev, [name]: value }))
  }

  const handleTaskChange = (index: number, field: keyof Task, value: string) => {
    const newTasks = [...tasks]
    newTasks[index][field] = value
    setTasks(newTasks)
  }

  const addTask = () => {
    setTasks([...tasks, { description: '', startDate: '', endDate: '' }])
  }

  const removeTask = (index: number) => {
    const newTasks = tasks.filter((_, i) => i !== index)
    setTasks(newTasks)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Work Order Details:', workOrderDetails)
    console.log('Tasks:', tasks)
    // Here you would typically send this data to your backend
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="workOrderNumber">Work Order Number</Label>
          <Input
            id="workOrderNumber"
            name="workOrderNumber"
            value={workOrderDetails.workOrderNumber}
            onChange={handleInputChange}
            required
          />
        </div>
        <div>
          <Label htmlFor="projectName">Project Name</Label>
          <Input
            id="projectName"
            name="projectName"
            value={workOrderDetails.projectName}
            onChange={handleInputChange}
            required
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="clientName">Client Name</Label>
          <Input
            id="clientName"
            name="clientName"
            value={workOrderDetails.clientName}
            onChange={handleInputChange}
            required
          />
        </div>
        <div>
          <Label htmlFor="contractorName">Contractor Name</Label>
          <Input
            id="contractorName"
            name="contractorName"
            value={workOrderDetails.contractorName}
            onChange={handleInputChange}
            required
          />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="startDate">Start Date</Label>
          <Input
            id="startDate"
            name="startDate"
            type="date"
            value={workOrderDetails.startDate}
            onChange={handleInputChange}
            required
          />
        </div>
        <div>
          <Label htmlFor="endDate">End Date</Label>
          <Input
            id="endDate"
            name="endDate"
            type="date"
            value={workOrderDetails.endDate}
            onChange={handleInputChange}
            required
          />
        </div>
        <div>
          <Label htmlFor="totalValue">Total Value</Label>
          <Input
            id="totalValue"
            name="totalValue"
            type="number"
            value={workOrderDetails.totalValue}
            onChange={handleInputChange}
            required
          />
        </div>
      </div>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Task Description</TableHead>
            <TableHead>Start Date</TableHead>
            <TableHead>End Date</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((task, index) => (
            <TableRow key={index}>
              <TableCell>
                <Input
                  value={task.description}
                  onChange={(e) => handleTaskChange(index, 'description', e.target.value)}
                  required
                />
              </TableCell>
              <TableCell>
                <Input
                  type="date"
                  value={task.startDate}
                  onChange={(e) => handleTaskChange(index, 'startDate', e.target.value)}
                  required
                />
              </TableCell>
              <TableCell>
                <Input
                  type="date"
                  value={task.endDate}
                  onChange={(e) => handleTaskChange(index, 'endDate', e.target.value)}
                  required
                />
              
              </TableCell>
              <TableCell>
                <Button type="button" variant="destructive" onClick={() => removeTask(index)}>Remove</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Button type="button" onClick={addTask}>Add Task</Button>
      <Button type="submit">Generate Work Order</Button>
    </form>
  )
}