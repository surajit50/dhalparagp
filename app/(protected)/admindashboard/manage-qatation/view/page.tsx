"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Search, Eye, Edit, Trash2, FileText } from "lucide-react"
import { getQuotations } from "@/lib/actions/quotations"

// Replace mock data with state
const ViewQuotationsPage = () => {
  const [quotations, setQuotations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredQuotations, setFilteredQuotations] = useState(quotations)

  // Add data fetching
  useEffect(() => {
    const fetchQuotations = async () => {
      setLoading(true)
      try {
        const result = await getQuotations()
        if (result.success) {
          setQuotations(result.data || [])
          setFilteredQuotations(result.data || []) // Initialize filteredQuotations with all data
        } else {
          setError(result.error || "Failed to fetch quotations")
        }
      } catch (error) {
        setError("An unexpected error occurred")
        console.error("Error fetching quotations:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchQuotations()
  }, [])

  // Update the search function to work with real data
  const handleSearch = (value: string) => {
    setSearchTerm(value)
    // For now, client-side filtering - you can move this to server-side later
    const filtered = quotations.filter(
      (quotation) =>
        quotation.nitNo.toLowerCase().includes(value.toLowerCase()) ||
        quotation.workName.toLowerCase().includes(value.toLowerCase()),
    )
    setFilteredQuotations(filtered)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Draft":
        return "bg-yellow-100 text-yellow-800"
      case "Published":
        return "bg-green-100 text-green-800"
      case "Closed":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-blue-100 text-blue-800"
    }
  }

  return (
    <div className="min-h-screen bg-muted/40 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-6">
        
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <FileText className="h-6 w-6" />
              View All Quotations
            </CardTitle>
            <CardDescription>Manage and view all quotation notices</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center mb-6">
              <div className="relative w-72">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by NIT No. or Work Name..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button asChild>
                <Link href="/quotations/create">Create New Quotation</Link>
              </Button>
            </div>

            {loading && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Loading quotations...</p>
              </div>
            )}

            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>NIT/NIQ No.</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Work/Item Name</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Estimated Amount</TableHead>
                    <TableHead>Submission Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredQuotations.map((quotation) => (
                    <TableRow key={quotation.id}>
                      <TableCell className="font-medium">{quotation.nitNo}</TableCell>
                      <TableCell>{new Date(quotation.nitDate).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge
                          className={
                            quotation.quotationType === "WORK"
                              ? "bg-blue-100 text-blue-800"
                              : quotation.quotationType === "SUPPLY"
                                ? "bg-green-100 text-green-800"
                                : "bg-orange-100 text-orange-800"
                          }
                        >
                          {quotation.quotationType === "WORK"
                            ? "Work"
                            : quotation.quotationType === "SUPPLY"
                              ? "Supply"
                              : "SALE"}
                        </Badge>
                      </TableCell>
                      <TableCell>{quotation.workName}</TableCell>
                      <TableCell>
                        {quotation.quantity && quotation.unit ? `${quotation.quantity} ${quotation.unit}` : "-"}
                      </TableCell>
                      <TableCell>₹{quotation.estimatedAmount.toLocaleString()}</TableCell>
                      <TableCell>{new Date(quotation.submissionDate).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(quotation.status)}>{quotation.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" asChild>
                            <Link href={`/admindashboard/manage-qatation/view/${quotation.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button size="sm" variant="outline" asChild>
                            <Link href={`/admindashboard/manage-qatation/modify/${quotation.id}`}>
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:text-red-700 bg-transparent"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {filteredQuotations.length === 0 && !loading && !error && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No quotations found matching your search.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default ViewQuotationsPage
