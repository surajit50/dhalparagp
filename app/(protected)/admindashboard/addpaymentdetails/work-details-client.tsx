"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Edit, FileText, Building2, IndianRupee, Hash, Filter, X, TrendingUp, TrendingDown } from "lucide-react"
import { ShowNitDetails } from "@/components/ShowNitDetails"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { AddPaymentDetailsForm } from "@/components/form/AddPaymentDetails"

interface WorkDetailsClientProps {
  initialWorkDetails: any[]
  schemeNames: string[]
}

export function WorkDetailsClient({ initialWorkDetails, schemeNames }: WorkDetailsClientProps) {
  const [selectedScheme, setSelectedScheme] = useState<string>("all")
  const [selectedNit, setSelectedNit] = useState<string>("all")
  const [selectedFundType, setSelectedFundType] = useState<string>("all") // NEW: tied/untied filter
  const [openDialog, setOpenDialog] = useState(false)
  const [selectedWorkId, setSelectedWorkId] = useState<string | null>(null)

  // Extract unique NITs
  const uniqueNits = useMemo(() => {
    const nits = initialWorkDetails
      .map((work) => work.nitDetails?.memoNumber)
      .filter((nit): nit is string => Boolean(nit))
    return Array.from(new Set(nits)).sort()
  }, [initialWorkDetails])

  // Filter work details based on selected scheme, NIT, and fund type
  const filteredWorkDetails = useMemo(() => {
    return initialWorkDetails.filter((work) => {
      const matchesScheme = selectedScheme === "all" || work.ApprovedActionPlanDetails?.schemeName === selectedScheme
      const matchesNit = selectedNit === "all" || work.nitDetails?.memoNumber === selectedNit
      
      // Fund type filter (tied/untied)
      let matchesFundType = true
      const fundType = work.ApprovedActionPlanDetails?.fundType?.toLowerCase()
      if (selectedFundType === "tied") {
        matchesFundType = fundType === "tied"
      } else if (selectedFundType === "untied") {
        matchesFundType = fundType === "untied"
      }
      
      return matchesScheme && matchesNit && matchesFundType
    })
  }, [initialWorkDetails, selectedScheme, selectedNit, selectedFundType])

  // Calculate totals based on filtered data
  const totalWorks = filteredWorkDetails.length
  const totalAwardedValue = filteredWorkDetails.reduce((sum, work) => {
    const amount = work.AwardofContract?.workorderdetails[0]?.Bidagency?.biddingAmount || 0
    return sum + amount
  }, 0)

  // Count tied/untied for stats display
  const tiedCount = useMemo(() => {
    return filteredWorkDetails.filter(work => 
      work.ApprovedActionPlanDetails?.fundType?.toLowerCase() === "tied"
    ).length
  }, [filteredWorkDetails])
  
  const untiedCount = useMemo(() => {
    return filteredWorkDetails.filter(work => 
      work.ApprovedActionPlanDetails?.fundType?.toLowerCase() === "untied"
    ).length
  }, [filteredWorkDetails])

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const clearFilter = () => {
    setSelectedScheme("all")
    setSelectedNit("all")
    setSelectedFundType("all")
  }

  const handleEditClick = (workId: string) => {
    setSelectedWorkId(workId)
    setOpenDialog(true)
  }

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      {/* Filter Section */}
      <Card className="bg-white border-none shadow-md">
        <CardHeader className="pb-4 border-b">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-primary/10 rounded-full">
              <Filter className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold text-gray-800">Filter Works</CardTitle>
              <CardDescription>Refine your search by scheme, NIT number, or fund type (Tied/Untied)</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Scheme Name</label>
              <Select value={selectedScheme} onValueChange={setSelectedScheme}>
                <SelectTrigger className="bg-gray-50 border-gray-200 focus:ring-primary">
                  <SelectValue placeholder="Select scheme name" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Schemes</SelectItem>
                  {schemeNames.map((scheme) => (
                    <SelectItem key={scheme} value={scheme}>
                      {scheme}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">NIT Number</label>
              <Select value={selectedNit} onValueChange={setSelectedNit}>
                <SelectTrigger className="bg-gray-50 border-gray-200 focus:ring-primary">
                  <SelectValue placeholder="Select NIT Number" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All NITs</SelectItem>
                  {uniqueNits.map((nit) => (
                    <SelectItem key={nit} value={nit}>
                      {nit}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* NEW: Fund Type Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Fund Type</label>
              <Select value={selectedFundType} onValueChange={setSelectedFundType}>
                <SelectTrigger className="bg-gray-50 border-gray-200 focus:ring-primary">
                  <SelectValue placeholder="Select fund type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="tied">Tied</SelectItem>
                  <SelectItem value="untied">Untied</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              {(selectedScheme !== "all" || selectedNit !== "all" || selectedFundType !== "all") && (
                <Button 
                  variant="outline" 
                  onClick={clearFilter} 
                  className="w-full md:w-auto border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                >
                  <X className="h-4 w-4 mr-2" />
                  Clear Filters
                </Button>
              )}
            </div>
          </div>

          {(selectedScheme !== "all" || selectedNit !== "all" || selectedFundType !== "all") && (
            <div className="mt-4 flex flex-wrap gap-2">
              {selectedScheme !== "all" && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
                  Scheme: {selectedScheme}
                  <button 
                    onClick={() => setSelectedScheme("all")}
                    className="ml-2 hover:text-purple-900 focus:outline-none"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {selectedNit !== "all" && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200">
                  NIT: {selectedNit}
                  <button 
                    onClick={() => setSelectedNit("all")}
                    className="ml-2 hover:text-orange-900 focus:outline-none"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {selectedFundType !== "all" && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                  Fund Type: {selectedFundType === "tied" ? "Tied" : "Untied"}
                  <button 
                    onClick={() => setSelectedFundType("all")}
                    className="ml-2 hover:text-blue-900 focus:outline-none"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats Cards - now includes tied/untied summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-none shadow-md bg-white hover:shadow-lg transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Works</p>
                <h3 className="text-3xl font-bold text-gray-900 mt-2">{totalWorks}</h3>
                {(selectedScheme !== "all" || selectedNit !== "all" || selectedFundType !== "all") && (
                  <p className="text-xs text-gray-400 mt-1">of {initialWorkDetails.length} total</p>
                )}
              </div>
              <div className="p-4 bg-orange-50 rounded-2xl">
                <FileText className="h-8 w-8 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md bg-white hover:shadow-lg transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Tied Works</p>
                <h3 className="text-3xl font-bold text-blue-600 mt-2">{tiedCount}</h3>
              </div>
              <div className="p-4 bg-blue-50 rounded-2xl">
                <TrendingUp className="h-8 w-8 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md bg-white hover:shadow-lg transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Untied Works</p>
                <h3 className="text-3xl font-bold text-amber-600 mt-2">{untiedCount}</h3>
              </div>
              <div className="p-4 bg-amber-50 rounded-2xl">
                <TrendingDown className="h-8 w-8 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md bg-white hover:shadow-lg transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Awarded Value</p>
                <h3 className="text-3xl font-bold text-green-700 mt-2">{formatCurrency(totalAwardedValue)}</h3>
              </div>
              <div className="p-4 bg-green-50 rounded-2xl">
                <IndianRupee className="h-8 w-8 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Table Card */}
      <Card className="border-none shadow-lg bg-white overflow-hidden">
        <CardHeader className="bg-gray-50 border-b border-gray-100 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold text-gray-900">
                Work Details
              </CardTitle>
              <CardDescription className="mt-1">
                Manage payment details for ongoing projects
              </CardDescription>
            </div>
            <div className="p-2 bg-white rounded-lg border shadow-sm">
              <Building2 className="h-5 w-5 text-gray-600" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead className="p-4 font-semibold text-gray-700">SL No</TableHead>
                  <TableHead className="p-4 font-semibold text-gray-700">NIT Details</TableHead>
                  <TableHead className="p-4 font-semibold text-gray-700">Work Name</TableHead>
                  <TableHead className="p-4 font-semibold text-gray-700">Scheme Name</TableHead>
                  <TableHead className="p-4 font-semibold text-gray-700">Fund Type</TableHead> {/* NEW COLUMN */}
                  <TableHead className="p-4 font-semibold text-gray-700">Agency Name</TableHead>
                  <TableHead className="p-4 font-semibold text-gray-700">Awarded Cost</TableHead>
                  <TableHead className="p-4 font-semibold text-gray-700 text-center">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredWorkDetails.length > 0 ? (
                  filteredWorkDetails.map((work, index) => (
                    <TableRow key={work.id} className="hover:bg-gray-50/50">
                      <TableCell className="p-4">
                        <div className="flex items-center">
                          <Hash className="h-4 w-4 text-gray-400 mr-2" />
                          {index + 1}
                        </div>
                      </TableCell>
                      <TableCell className="p-4">
                        <ShowNitDetails
                          nitdetails={work.nitDetails.memoNumber}
                          memoDate={work.nitDetails.memoDate}
                          workslno={work.workslno}
                        />
                      </TableCell>
                      <TableCell className="p-4 font-medium">
                        {work.ApprovedActionPlanDetails?.activityDescription}
                      </TableCell>
                      <TableCell className="p-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          {work.ApprovedActionPlanDetails?.schemeName || "N/A"}-{work.ApprovedActionPlanDetails?.activityCode || "na"}
                        </span>
                      </TableCell>
                      {/* NEW Fund Type cell */}
                      <TableCell className="p-4">
                        {work.ApprovedActionPlanDetails?.fundType ? (
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            work.ApprovedActionPlanDetails.fundType.toLowerCase() === "tied"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-amber-100 text-amber-800"
                          }`}>
                            {work.ApprovedActionPlanDetails.fundType}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs">—</span>
                        )}
                      </TableCell>
                      <TableCell className="p-4">
                        {work.AwardofContract?.workorderdetails[0]?.Bidagency?.agencydetails?.name}
                      </TableCell>
                      <TableCell className="p-4 font-semibold text-green-700">
                        {formatCurrency(work.AwardofContract?.workorderdetails[0]?.Bidagency?.biddingAmount || 0)}
                      </TableCell>
                      <TableCell className="text-center">
                        <Dialog open={openDialog && selectedWorkId === work.id} onOpenChange={setOpenDialog}>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              className="hover:bg-orange-50 hover:text-orange-700 transition-colors"
                              onClick={() => handleEditClick(work.id)}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle className="text-xl">Add Payment Details</DialogTitle>
                              <div className="text-sm text-gray-500">
                                Work: {work.ApprovedActionPlanDetails?.activityDescription}
                              </div>
                            </DialogHeader>
                            <div className="py-4">
                              {selectedWorkId && (
                                <AddPaymentDetailsForm 
                                  workId={selectedWorkId}
                                  awardedCost={work.AwardofContract?.workorderdetails[0]?.Bidagency?.biddingAmount || 0}
                                  onSuccess={() => setOpenDialog(false)}
                                />
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="p-8 text-center text-gray-500">
                      <div className="flex flex-col items-center justify-center py-8">
                        <FileText className="h-12 w-12 text-gray-300 mb-4" />
                        <p className="text-lg">
                          {(selectedScheme === "all" && selectedNit === "all" && selectedFundType === "all")
                            ? "No work details found"
                            : "No work details found matching the selected filters"}
                        </p>
                        <p className="text-sm text-gray-400 mt-1">
                          {(selectedScheme === "all" && selectedNit === "all" && selectedFundType === "all")
                            ? "Add new work details to get started"
                            : "Try adjusting your filters or clear them to see all works"}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
