"use client"



import React,{useState} from 'react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { CalendarDays, Search, PlusCircle, Edit, Trash2 } from 'lucide-react'

type Festival = {
  id: string
  name: string
  date: string
  location: string
  attendees: number
  status: 'upcoming' | 'ongoing' | 'completed'
}

const festivals: Festival[] = [
  { id: '1', name: 'Summer Music Festival', date: '2024-07-15', location: 'Central Park', attendees: 5000, status: 'upcoming' },
  { id: '2', name: 'Food and Wine Fest', date: '2024-08-22', location: 'Downtown Square', attendees: 3000, status: 'upcoming' },
  { id: '3', name: 'Cultural Heritage Days', date: '2024-09-05', location: 'City Museum', attendees: 2000, status: 'upcoming' },
  { id: '4', name: 'Winter Lights Festival', date: '2023-12-01', location: 'Main Street', attendees: 10000, status: 'completed' },
  { id: '5', name: 'Spring Flower Show', date: '2024-04-10', location: 'Botanical Gardens', attendees: 1500, status: 'upcoming' },
]

export default function Component() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<Festival['status'] | 'all'>('all')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  const filteredFestivals = festivals.filter(festival => 
    festival.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (statusFilter === 'all' || festival.status === statusFilter)
  )

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Festival Management</h1>
          <p className="text-muted-foreground mt-2">Organize and manage cultural festivals and events.</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add New Festival
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Festival</DialogTitle>
              <DialogDescription>Enter the details for the new festival.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">Name</Label>
                <Input id="name" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="date" className="text-right">Date</Label>
                <Input id="date" type="date" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="location" className="text-right">Location</Label>
                <Input id="location" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="attendees" className="text-right">Expected Attendees</Label>
                <Input id="attendees" type="number" className="col-span-3" />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Add Festival</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="flex space-x-4">
        <Input
          placeholder="Search festivals..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as Festival['status'] | 'all')}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="upcoming">Upcoming</SelectItem>
            <SelectItem value="ongoing">Ongoing</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline">
          <Search className="mr-2 h-4 w-4" />
          Search
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Expected Attendees</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredFestivals.map(festival => (
            <TableRow key={festival.id}>
              <TableCell>{festival.name}</TableCell>
              <TableCell>{festival.date}</TableCell>
              <TableCell>{festival.location}</TableCell>
              <TableCell>{festival.attendees.toLocaleString()}</TableCell>
              <TableCell>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  festival.status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                  festival.status === 'ongoing' ? 'bg-green-100 text-green-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {festival.status.charAt(0).toUpperCase() + festival.status.slice(1)}
                </span>
              </TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button variant="outline" size="icon">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
