"use client"

import { useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Search, ChevronLeft, ChevronRight, Eye } from "lucide-react"

type CitizenRequest = {
  id: string;
  applicantName: string;
  serviceType: string;
  dateSubmitted: string;
  status: 'Pending' | 'In Progress' | 'Completed' | 'Rejected';
  details: string;
}

const mockRequests: CitizenRequest[] = [
  { id: 'CR001', applicantName: 'Rahul Sharma', serviceType: 'Birth Certificate', dateSubmitted: '2023-10-15', status: 'Pending', details: 'Request for birth certificate for newborn child.' },
  { id: 'CR002', applicantName: 'Priya Patel', serviceType: 'Death Certificate', dateSubmitted: '2023-10-14', status: 'In Progress', details: 'Death certificate request for deceased family member.' },
  { id: 'CR003', applicantName: 'Amit Kumar', serviceType: 'Marriage Registration', dateSubmitted: '2023-10-13', status: 'Completed', details: 'Marriage registration completed and certificate issued.' },
  { id: 'CR004', applicantName: 'Sneha Gupta', serviceType: 'Income Certificate', dateSubmitted: '2023-10-12', status: 'Pending', details: 'Income certificate required for scholarship application.' },
  { id: 'CR005', applicantName: 'Vikram Singh', serviceType: 'Residence Certificate', dateSubmitted: '2023-10-11', status: 'Rejected', details: 'Insufficient proof of residence provided.' },
]

export default function ViewCitizenRequests() {
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedRequest, setSelectedRequest] = useState<CitizenRequest | null>(null)
  const requestsPerPage = 10

  const filteredRequests = mockRequests.filter(req => 
    req.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    req.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    req.serviceType.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const indexOfLastRequest = currentPage * requestsPerPage
  const indexOfFirstRequest = indexOfLastRequest - requestsPerPage
  const currentRequests = filteredRequests.slice(indexOfFirstRequest, indexOfLastRequest)

  const totalPages = Math.ceil(filteredRequests.length / requestsPerPage)

  const statusColor = {
    'Pending': 'bg-yellow-500',
    'In Progress': 'bg-blue-500',
    'Completed': 'bg-green-500',
    'Rejected': 'bg-red-500'
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">View Citizen Service Requests</h1>
      
      <div className="flex justify-between items-center mb-4">
        <div className="relative w-64">
          <Input
            type="text"
            placeholder="Search requests..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
        <div className="flex items-center space-x-2">
          <Button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            size="icon"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span>Page {currentPage} of {totalPages}</span>
          <Button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            size="icon"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Service Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Applicant</TableHead>
                  <TableHead>Service Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>{request.id}</TableCell>
                    <TableCell>{request.applicantName}</TableCell>
                    <TableCell>{request.serviceType}</TableCell>
                    <TableCell>
                      <Badge className={statusColor[request.status]}>{request.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" onClick={() => setSelectedRequest(request)}>
                        <Eye className="mr-2 h-4 w-4" /> View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Request Details</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedRequest ? (
              <Tabs defaultValue="details">
                <TabsList>
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="history">History</TabsTrigger>
                </TabsList>
                <TabsContent value="details">
                  <div className="space-y-4">
                    <div>
                      <Label>Request ID</Label>
                      <Input value={selectedRequest.id} readOnly />
                    </div>
                    <div>
                      <Label>Applicant Name</Label>
                      <Input value={selectedRequest.applicantName} readOnly />
                    </div>
                    <div>
                      <Label>Service Type</Label>
                      <Input value={selectedRequest.serviceType} readOnly />
                    </div>
                    <div>
                      <Label>Date Submitted</Label>
                      <Input value={selectedRequest.dateSubmitted} readOnly />
                    </div>
                    <div>
                      <Label>Status</Label>
                      <Input value={selectedRequest.status} readOnly />
                    </div>
                    <div>
                      <Label>Details</Label>
                      <Textarea value={selectedRequest.details} readOnly />
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="history">
                  <div className="space-y-4">
                    <p>Request history will be displayed here.</p>
                    {/* In a real application, you would fetch and display the request history here */}
                  </div>
                </TabsContent>
              </Tabs>
            ) : (
              <div className="text-center py-4">
                Select a request to view its details.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
