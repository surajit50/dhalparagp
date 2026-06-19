"use client"

import { useState, useMemo, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { AlertCircle, CheckCircle2, CreditCard, Download, Search, Filter, FileText, Plus, Shield, RotateCcw, AlertOctagon, ChevronLeft, ChevronRight } from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { formatDate } from "@/utils/utils"
import { ShowNitDetails } from "@/components/ShowNitDetails"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

interface EmdTableProps {
  data: any[]
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount)
}

export function EmdTable({ data }: EmdTableProps) {
  const router = useRouter()
  const [selectedFund, setSelectedFund] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [currentPage, setCurrentPage] = useState<number>(1)
  const itemsPerPage = 10

  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, statusFilter])

  // Dialog state
  const [viewAgencies, setViewAgencies] = useState<any[] | null>(null)
  const [verifyEmd, setVerifyEmd] = useState<any>(null)
  const [refundEmd, setRefundEmd] = useState<any>(null)
  const [forfeitEmd, setForfeitEmd] = useState<any>(null)
  const [refundMethod, setRefundMethod] = useState<string>("ONLINE_TRANSFER")
  const [refundChequeNo, setRefundChequeNo] = useState<string>("")
  const [refundDate, setRefundDate] = useState<string>("")
  const [forfeitReason, setForfeitReason] = useState<string>("")

  // Filter data based on search and filters
  const filteredData = useMemo(() => 
    data.filter(entry => {
      const currentStatus = entry.paymentstatus;
      const statusMatch =
        statusFilter === "all" || currentStatus === statusFilter

      const agencyDetails = entry.bidderName?.agencydetails || entry.bidderName?.WorksDetail?.biddingAgencies[0]?.agencydetails;
      const agencyName = agencyDetails?.agencyType === "FARM"
        ? (agencyDetails?.name + "(" + agencyDetails.proprietorName + ")")
        : (agencyDetails?.name || "")
      const nitDetails = entry.bidderName?.WorksDetail?.nitDetails
      const nitNumber = String(nitDetails?.memoNumber || "")

      const searchMatch =
        searchQuery === "" ||
        agencyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        nitNumber.toLowerCase().includes(searchQuery.toLowerCase())

      return statusMatch && searchMatch
    }),
    [data, statusFilter, searchQuery]
  )

  // Group data
  const groupedData = useMemo(() => {
    const groups: { [key: string]: any[] } = {}
    const result: any[][] = []
    filteredData.forEach(emd => {
      const nitDetails = emd.bidderName?.WorksDetail?.nitDetails
      const workslno = emd.bidderName?.WorksDetail?.workslno || ""
      const nitNumber = nitDetails?.memoNumber || `unknown-${emd.id}`
      const groupKey = `${nitNumber}-${workslno}`
      if (!groups[groupKey]) {
        groups[groupKey] = []
        result.push(groups[groupKey])
      }
      groups[groupKey].push(emd)
    })
    return result
  }, [filteredData])

  const totalPages = Math.ceil(groupedData.length / itemsPerPage)
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return groupedData.slice(startIndex, startIndex + itemsPerPage)
  }, [groupedData, currentPage, itemsPerPage])

  // Metrics
  const metrics = useMemo(() => {
    let totalEmd = 0
    let receivedEmd = 0
    let pendingEmd = 0
    let refundedEmd = 0
    let forfeitedEmd = 0

    filteredData.forEach(entry => {
      const amount = entry.earnestMoneyAmount
      totalEmd += amount
      if (entry.paymentstatus === "paid") {
        receivedEmd += amount
      } else if (entry.paymentstatus === "pending") {
        pendingEmd += amount
      } else if (entry.paymentstatus === "refunded") {
        refundedEmd += amount
      } else if (entry.paymentstatus === "forfeited") {
        forfeitedEmd += amount
      }
    })

    return { totalEmd, receivedEmd, pendingEmd, refundedEmd, forfeitedEmd }
  }, [filteredData])

  const exportToPDF = () => {
    try {
      const doc = new jsPDF("landscape", "mm", "a4")
      const pageWidth = doc.internal.pageSize.getWidth()

      doc.setFontSize(18)
      doc.setFont("helvetica", "bold")
      doc.text("Earnest Money Register Report", pageWidth / 2, 20, { align: "center" })

      doc.setFontSize(10)
      doc.setFont("helvetica", "normal")
      const currentDate = new Date().toLocaleDateString("en-IN")
      doc.text(`Generated on: ${currentDate} | Status: ${statusFilter}`, pageWidth / 2, 28, { align: "center" })

      const tableData = filteredData.map((entry, index) => {
        const agencyDetails = entry.bidderName?.agencydetails || entry.bidderName?.WorksDetail?.biddingAgencies[0]?.agencydetails;
        const agencyName = agencyDetails?.agencyType === "FARM"
          ? (agencyDetails?.name + "(" + agencyDetails.proprietorName + ")")
          : (agencyDetails?.name || "N/A")
        const nitDetails = entry.bidderName?.WorksDetail?.nitDetails
        return [
          index + 1,
          nitDetails?.memoNumber || "N/A",
          agencyName,
          entry.earnestMoneyAmount,
          entry.paymentstatus === "paid" ? "Received" : entry.paymentstatus,
          entry.paymentDate ? new Date(entry.paymentDate).toLocaleDateString("en-IN") : "Not Received",
          entry.paymentMethod || "-",
        ]
      })

      autoTable(doc, {
        head: [["Sl No", "NIT Memo No", "Agency Name", "Amount (Rs.)", "Status", "Payment Date", "Method"]],
        body: tableData,
        startY: 38,
        theme: "striped",
        headStyles: { fillColor: [249, 115, 22] }, // orange accent
        bodyStyles: { fontSize: 9 },
      })

      doc.save(`emd-register-${new Date().toISOString().slice(0, 10)}.pdf`)
    } catch (error) {
      console.error("Error generating PDF:", error)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/60 backdrop-blur-2xl p-6 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 mb-2 transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3 text-slate-900">
              <span className="bg-gradient-to-br from-orange-500 to-orange-600 p-2.5 rounded-2xl text-white shadow-lg shadow-orange-500/30 ring-1 ring-white/50">
                <Shield className="h-6 w-6" strokeWidth={2.5} />
              </span>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900">
                Earnest Money Register
              </span>
            </h1>
            <p className="text-slate-500 mt-2 text-sm font-medium ml-[3.25rem]">
              Manage and track earnest money deposits for contracts.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 w-full sm:w-auto">
            <Button
              className="bg-white text-slate-700 border border-slate-200 shadow-sm hover:bg-slate-50 hover:shadow transition-all duration-300 rounded-xl px-5 h-11 font-medium"
              onClick={exportToPDF}
            >
              <Download className="h-4 w-4 mr-2 text-orange-500" />
              Export Report
            </Button>
            <Button className="bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white rounded-xl shadow-md shadow-orange-500/20 h-11 px-5 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5" asChild>
              <Link href="/admindashboard/register/earnest-money/new">
                <Plus className="mr-2 h-4 w-4" />
                Add New Entry
              </Link>
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Metrics Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <Card className="relative overflow-hidden border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white/60 backdrop-blur-xl hover:shadow-[0_12px_40px_rgb(0,0,0,0.08)] transition-all duration-500 hover:-translate-y-1.5 group rounded-[2rem]">
            <div className="absolute -right-4 -top-4 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity duration-500">
               <CheckCircle2 className="h-32 w-32 text-emerald-600" />
            </div>
            <CardContent className="p-6 flex flex-col justify-between h-full relative z-10">
              <div className="flex justify-between items-start mb-4">
                <div className="h-12 w-12 bg-emerald-50/80 rounded-2xl flex items-center justify-center ring-1 ring-emerald-100 group-hover:scale-110 group-hover:bg-emerald-100 transition-all duration-300">
                  <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
              <div className="space-y-1.5">
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Received EMD</p>
                <h3 className="text-3xl font-bold tracking-tight text-slate-900">
                  {formatCurrency(metrics.receivedEmd)}
                </h3>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white/60 backdrop-blur-xl hover:shadow-[0_12px_40px_rgb(0,0,0,0.08)] transition-all duration-500 hover:-translate-y-1.5 group rounded-[2rem]">
            <div className="absolute -right-4 -top-4 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity duration-500">
               <AlertCircle className="h-32 w-32 text-rose-600" />
            </div>
            <CardContent className="p-6 flex flex-col justify-between h-full relative z-10">
              <div className="flex justify-between items-start mb-4">
                <div className="h-12 w-12 bg-rose-50/80 rounded-2xl flex items-center justify-center ring-1 ring-rose-100 group-hover:scale-110 group-hover:bg-rose-100 transition-all duration-300">
                  <AlertCircle className="h-6 w-6 text-rose-600" />
                </div>
              </div>
              <div className="space-y-1.5">
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Pending EMD</p>
                <h3 className="text-3xl font-bold tracking-tight text-slate-900">
                  {formatCurrency(metrics.pendingEmd)}
                </h3>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white/60 backdrop-blur-xl hover:shadow-[0_12px_40px_rgb(0,0,0,0.08)] transition-all duration-500 hover:-translate-y-1.5 group rounded-[2rem]">
            <div className="absolute -right-4 -top-4 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity duration-500">
               <RotateCcw className="h-32 w-32 text-blue-600" />
            </div>
            <CardContent className="p-6 flex flex-col justify-between h-full relative z-10">
              <div className="flex justify-between items-start mb-4">
                <div className="h-12 w-12 bg-blue-50/80 rounded-2xl flex items-center justify-center ring-1 ring-blue-100 group-hover:scale-110 group-hover:bg-blue-100 transition-all duration-300">
                  <RotateCcw className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="space-y-1.5">
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Refunded EMD</p>
                <h3 className="text-3xl font-bold tracking-tight text-slate-900">
                  {formatCurrency(metrics.refundedEmd)}
                </h3>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white/60 backdrop-blur-xl hover:shadow-[0_12px_40px_rgb(0,0,0,0.08)] transition-all duration-500 hover:-translate-y-1.5 group rounded-[2rem]">
            <div className="absolute -right-4 -top-4 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity duration-500">
               <AlertOctagon className="h-32 w-32 text-amber-600" />
            </div>
            <CardContent className="p-6 flex flex-col justify-between h-full relative z-10">
              <div className="flex justify-between items-start mb-4">
                <div className="h-12 w-12 bg-amber-50/80 rounded-2xl flex items-center justify-center ring-1 ring-amber-100 group-hover:scale-110 group-hover:bg-amber-100 transition-all duration-300">
                  <AlertOctagon className="h-6 w-6 text-amber-600" />
                </div>
              </div>
              <div className="space-y-1.5">
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Forfeited EMD</p>
                <h3 className="text-3xl font-bold tracking-tight text-slate-900">
                  {formatCurrency(metrics.forfeitedEmd)}
                </h3>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Unified Toolbar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="flex flex-col md:flex-row gap-4 bg-white/60 backdrop-blur-xl p-2.5 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input
              placeholder="Search agency name or NIT memo number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 bg-slate-50/50 border-0 rounded-xl focus-visible:ring-1 focus-visible:ring-orange-500 w-full hover:bg-slate-50 transition-colors text-base"
            />
          </div>

          <div className="flex gap-4 items-center pr-2">
            <div className="h-8 w-[1px] bg-slate-200 hidden md:block"></div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px] h-12 border-0 bg-transparent hover:bg-slate-50 rounded-xl focus:ring-1 focus:ring-orange-500 transition-colors shadow-none font-medium text-slate-600">
                <Filter className="h-4 w-4 mr-2 text-slate-400" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-slate-200 shadow-lg">
                <SelectItem value="all" className="rounded-lg cursor-pointer">All Statuses</SelectItem>
                <SelectItem value="pending" className="rounded-lg cursor-pointer">Pending</SelectItem>
                <SelectItem value="paid" className="rounded-lg cursor-pointer">Received</SelectItem>
                <SelectItem value="refunded" className="rounded-lg cursor-pointer">Refunded</SelectItem>
                <SelectItem value="forfeited" className="rounded-lg cursor-pointer">Forfeited</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </motion.div>

      {/* Data Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card className="border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.06)] rounded-[2rem] overflow-hidden bg-white/60 backdrop-blur-2xl">
          <CardHeader className="border-b border-slate-100 py-5 bg-white/50">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-3">
                <div className="bg-orange-100 p-2 rounded-xl">
                  <FileText className="h-5 w-5 text-orange-600" />
                </div>
                Ledger Entries
              </CardTitle>
              <Badge variant="secondary" className="bg-slate-100 text-slate-600 px-3 py-1 rounded-lg font-medium text-sm border-0">
                {groupedData.length} NITs
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {filteredData.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
                <Search className="h-10 w-10 text-slate-400 mb-3" />
                <h3 className="text-lg font-semibold text-slate-800">No Records Found</h3>
                <p className="text-slate-500 text-sm max-w-sm">
                  We couldn't find any entries matching your current filters.
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                  <TableHeader className="bg-slate-50/80 border-b border-slate-200">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 w-[80px]">Sl No</TableHead>
                      <TableHead className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">NIT Number</TableHead>
                      <TableHead className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Agency Name</TableHead>
                      <TableHead className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">EMD Amount</TableHead>
                      <TableHead className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Status</TableHead>
                      
<TableHead className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedData.map((group, index) => {
                      const emd = group[0];
                      const isMultiple = group.length > 1;
                      const agencyDetails = emd.bidderName?.agencydetails || emd.bidderName?.WorksDetail?.biddingAgencies[0]?.agencydetails;
                      const agencyName = agencyDetails?.agencyType === "FARM"
                        ? (agencyDetails?.name + "(" + agencyDetails.proprietorName + ")")
                        : (agencyDetails?.name || "N/A")
                      const nitDetails = emd.bidderName?.WorksDetail?.nitDetails
                      const worksDetail = emd.bidderName?.WorksDetail
                      const isAwarded = emd.bidderName?.workorderdetails && emd.bidderName.workorderdetails.length > 0;

                      return (
                        <TableRow key={nitDetails?.memoNumber ? `${nitDetails.memoNumber}-${worksDetail?.workslno}` : emd.id} className="border-b border-slate-100/50 hover:bg-white/80 transition-colors duration-300 group/row">
                          <TableCell className="px-6 py-4 text-slate-500 font-medium">{(currentPage - 1) * itemsPerPage + index + 1}</TableCell>
                          <TableCell className="px-6 py-4 text-slate-700 font-medium">
                            <div className="flex flex-col gap-1">
                              <span>{nitDetails?.memoNumber || "-"}</span>
                              {worksDetail?.workslno && (
                                <span className="text-xs text-slate-500">Work No: {worksDetail.workslno}</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="px-6 py-4 text-slate-700">
                            {isMultiple ? (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100 rounded-full text-xs"
                                onClick={() => setViewAgencies(group)}
                              >
                                {group.length} Agencies
                              </Button>
                            ) : (
                              <div className="flex flex-col gap-1 items-start">
                                <span>{agencyName}</span>
                                {isAwarded && (
                                  <Badge variant="secondary" className="bg-orange-100 text-orange-700 hover:bg-orange-100 text-[10px] px-1.5 py-0 border-0 uppercase tracking-wider">
                                    Awarded Work Order
                                  </Badge>
                                )}
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="px-6 py-4 text-right font-bold text-slate-900">
                            {formatCurrency(emd.earnestMoneyAmount)}
                          </TableCell>
                          <TableCell className="px-6 py-4">
                            {isMultiple ? (
                              <Badge variant="outline" className="bg-slate-100 text-slate-600 border-0">Multiple</Badge>
                            ) : (
                              <div className="flex flex-col gap-1 items-start">
                                <Badge
                                  variant="outline"
                                  className={`rounded-full px-3 py-1 text-xs font-semibold border-0 shadow-sm ${
                                    emd.paymentstatus === "paid"
                                      ? "bg-emerald-500 text-white shadow-emerald-500/30 ring-1 ring-emerald-600/20"
                                      : emd.paymentstatus === "pending"
                                        ? "bg-rose-500 text-white shadow-rose-500/30 ring-1 ring-rose-600/20"
                                        : emd.paymentstatus === "refunded"
                                          ? "bg-blue-500 text-white shadow-blue-500/30 ring-1 ring-blue-600/20"
                                          : "bg-amber-500 text-white shadow-amber-500/30 ring-1 ring-amber-600/20"
                                  }`}
                                >
                                  {emd.paymentstatus === "paid" ? "Received" : emd.paymentstatus}
                                </Badge>
                                {emd.paymentstatus === "forfeited" && emd.chequeNumber && (
                                  <span className="text-[10px] text-slate-500 max-w-[120px] truncate" title={emd.chequeNumber}>
                                    Reason: {emd.chequeNumber}
                                  </span>
                                )}
                                {emd.paymentstatus === "refunded" && emd.paymentMethod && (
                                  <div className="text-[10px] text-slate-500 flex flex-col gap-0.5 mt-1">
                                    <span>
                                      Method: {emd.paymentMethod === "ONLINE_TRANSFER" ? "Online" : emd.paymentMethod === "CHEQUE" ? "Cheque" : "Cash"}
                                    </span>
                                    {emd.chequeNumber && <span>{emd.paymentMethod === "ONLINE_TRANSFER" ? "URN: " : emd.paymentMethod === "CHEQUE" ? "Chq No: " : ""}{emd.chequeNumber}</span>}
                                    {emd.paymentMethod === "CHEQUE" && emd.chequeDate && <span>Chq Date: {formatDate(emd.chequeDate)}</span>}
                                    {emd.paymentMethod !== "CHEQUE" && emd.paymentDate && <span>Date: {formatDate(emd.paymentDate)}</span>}
                                  </div>
                                )}
                              </div>
                            )}
                          </TableCell>
                          
                          
                          <TableCell className="px-6 py-4 text-right flex items-center justify-end gap-2">
                            {isMultiple ? (
                               <Button
                                size="sm"
                                variant="outline"
                                className="text-slate-600 hover:text-slate-900 rounded-lg text-xs h-8 px-3 transition-colors"
                                onClick={() => setViewAgencies(group)}
                               >
                                 View Actions
                               </Button>
                            ) : (
                              emd.paymentstatus === "pending" ? (
                                <Button
                                  size="sm"
                                  className="bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-xs h-8 px-3 shadow-sm hover:shadow-md transition-all opacity-0 group-hover/row:opacity-100 focus:opacity-100"
                                  onClick={() => setVerifyEmd(emd)}
                                >
                                  Verify Manually
                                </Button>
                              ) : emd.paymentstatus === "paid" ? (
                                <div className="flex items-center gap-2 opacity-0 group-hover/row:opacity-100 focus-within:opacity-100 transition-opacity">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:border-emerald-300 rounded-lg text-xs h-8 px-3 transition-colors"
                                    onClick={() => {
                                      setRefundMethod("ONLINE_TRANSFER");
                                      setRefundChequeNo("");
                                      setRefundDate("");
                                      setRefundEmd(emd);
                                    }}
                                  >
                                    Refund
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 hover:border-rose-300 rounded-lg text-xs h-8 px-3 transition-colors"
                                    onClick={() => {
                                      setForfeitReason("");
                                      setForfeitEmd(emd);
                                    }}
                                  >
                                    Forfeit
                                  </Button>
                                </div>
                              ) : null
                            )}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4 bg-slate-50/50">
                  <div className="text-sm text-slate-500">
                    Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-medium">{Math.min(currentPage * itemsPerPage, groupedData.length)}</span> of <span className="font-medium">{groupedData.length}</span> results
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="h-8 w-8 p-0 rounded-lg border-slate-200 text-slate-600 hover:bg-slate-100"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="text-sm font-medium text-slate-600">
                      Page {currentPage} of {totalPages}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="h-8 w-8 p-0 rounded-lg border-slate-200 text-slate-600 hover:bg-slate-100"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Dialogs */}
      <Dialog open={!!verifyEmd} onOpenChange={(open) => !open && setVerifyEmd(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Verify EMD Manually</DialogTitle>
            <DialogDescription>
              Are you sure you want to mark this EMD as received manually?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setVerifyEmd(null)}>Cancel</Button>
            <Button className="bg-orange-600 hover:bg-orange-700 text-white" onClick={async () => {
              try {
                const res = await fetch(`/api/earnest-money/${verifyEmd.id}/payment`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ paymentstatus: "paid" })
                });
                if (res.ok) {
                  setVerifyEmd(null);
                  router.refresh();
                } else {
                  alert("Failed to mark EMD as received");
                }
              } catch (err) {
                console.error(err);
              }
            }}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!refundEmd} onOpenChange={(open) => !open && setRefundEmd(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Refund EMD</DialogTitle>
            <DialogDescription>
              Please select the refund method to proceed.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Refund Method</label>
              <Select value={refundMethod} onValueChange={setRefundMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ONLINE_TRANSFER">Online</SelectItem>
                  <SelectItem value="CHEQUE">Cheque</SelectItem>
                  <SelectItem value="CASH">Cash</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {refundMethod === "CHEQUE" && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Cheque Number</label>
                  <Input 
                    value={refundChequeNo} 
                    onChange={(e) => setRefundChequeNo(e.target.value)} 
                    placeholder="Enter cheque number..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Cheque Date</label>
                  <Input 
                    type="date"
                    value={refundDate} 
                    onChange={(e) => setRefundDate(e.target.value)} 
                  />
                </div>
              </>
            )}
            {refundMethod === "ONLINE_TRANSFER" && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">URN / Transaction ID</label>
                  <Input 
                    value={refundChequeNo} 
                    onChange={(e) => setRefundChequeNo(e.target.value)} 
                    placeholder="Enter URN..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Payment Date</label>
                  <Input 
                    type="date"
                    value={refundDate} 
                    onChange={(e) => setRefundDate(e.target.value)} 
                  />
                </div>
              </>
            )}
            {refundMethod === "CASH" && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Payment Date</label>
                <Input 
                  type="date"
                  value={refundDate} 
                  onChange={(e) => setRefundDate(e.target.value)} 
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRefundEmd(null)}>Cancel</Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={async () => {
              let bodyData: any = { paymentstatus: "refunded", paymentMethod: refundMethod };
              if (refundMethod === "CHEQUE") {
                bodyData.chequeNumber = refundChequeNo;
                bodyData.chequeDate = refundDate ? new Date(refundDate).toISOString() : null;
              } else if (refundMethod === "ONLINE_TRANSFER") {
                bodyData.chequeNumber = refundChequeNo;
                bodyData.paymentDate = refundDate ? new Date(refundDate).toISOString() : null;
              } else if (refundMethod === "CASH") {
                bodyData.paymentDate = refundDate ? new Date(refundDate).toISOString() : null;
              }
              
              try {
                const res = await fetch(`/api/earnest-money/${refundEmd.id}/payment`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(bodyData)
                });
                if (res.ok) {
                  setRefundEmd(null);
                  router.refresh();
                } else {
                  alert("Failed to refund EMD");
                }
              } catch (err) {
                console.error(err);
              }
            }}>Confirm Refund</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!forfeitEmd} onOpenChange={(open) => !open && setForfeitEmd(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Forfeit EMD</DialogTitle>
            <DialogDescription>
              Please provide a reason for forfeiting this EMD.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Reason</label>
              <Input 
                value={forfeitReason} 
                onChange={(e) => setForfeitReason(e.target.value)} 
                placeholder="Enter reason..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setForfeitEmd(null)}>Cancel</Button>
            <Button className="bg-rose-600 hover:bg-rose-700 text-white" disabled={!forfeitReason.trim()} onClick={async () => {
              try {
                const res = await fetch(`/api/earnest-money/${forfeitEmd.id}/payment`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ paymentstatus: "forfeited", chequeNumber: forfeitReason })
                });
                if (res.ok) {
                  setForfeitEmd(null);
                  router.refresh();
                } else {
                  alert("Failed to forfeit EMD");
                }
              } catch (err) {
                console.error(err);
              }
            }}>Confirm Forfeit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!viewAgencies} onOpenChange={(open) => !open && setViewAgencies(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Agency Details</DialogTitle>
            <DialogDescription>
              Details of all agencies for this NIT.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Agency Name</TableHead>
                  <TableHead>EMD Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {viewAgencies?.map((emd) => {
                  const agencyDetails = emd.bidderName?.agencydetails || emd.bidderName?.WorksDetail?.biddingAgencies[0]?.agencydetails;
                  const agencyName = agencyDetails?.agencyType === "FARM"
                    ? (agencyDetails?.name + "(" + agencyDetails.proprietorName + ")")
                    : (agencyDetails?.name || "N/A")
                  const isAwarded = emd.bidderName?.workorderdetails && emd.bidderName.workorderdetails.length > 0;

                  return (
                    <TableRow key={emd.id}>
                      <TableCell>
                        <div className="flex flex-col gap-1 items-start">
                          <span>{agencyName}</span>
                          {isAwarded && (
                            <Badge variant="secondary" className="bg-orange-100 text-orange-700 hover:bg-orange-100 text-[10px] px-1.5 py-0 border-0 uppercase tracking-wider">
                              Awarded Work Order
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-bold">{formatCurrency(emd.earnestMoneyAmount)}</TableCell>
                      <TableCell>
                         <div className="flex flex-col gap-1 items-start">
                                <Badge
                                  variant="outline"
                                  className={`rounded-full px-3 py-1 text-xs font-semibold border-0 shadow-sm ${
                                    emd.paymentstatus === "paid"
                                      ? "bg-emerald-500 text-white shadow-emerald-500/30 ring-1 ring-emerald-600/20"
                                      : emd.paymentstatus === "pending"
                                        ? "bg-rose-500 text-white shadow-rose-500/30 ring-1 ring-rose-600/20"
                                        : emd.paymentstatus === "refunded"
                                          ? "bg-blue-500 text-white shadow-blue-500/30 ring-1 ring-blue-600/20"
                                          : "bg-amber-500 text-white shadow-amber-500/30 ring-1 ring-amber-600/20"
                                  }`}
                                >
                                  {emd.paymentstatus === "paid" ? "Received" : emd.paymentstatus}
                                </Badge>
                         </div>
                      </TableCell>
                      <TableCell className="text-right flex items-center justify-end gap-2">
                            {emd.paymentstatus === "pending" ? (
                              <Button
                                size="sm"
                                className="bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-xs h-8 px-3 shadow-sm hover:shadow-md transition-all"
                                onClick={() => {
                                  setViewAgencies(null);
                                  setVerifyEmd(emd);
                                }}
                              >
                                Verify
                              </Button>
                            ) : emd.paymentstatus === "paid" ? (
                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:border-emerald-300 rounded-lg text-xs h-8 px-3 transition-colors"
                                  onClick={() => {
                                    setViewAgencies(null);
                                    setRefundMethod("ONLINE_TRANSFER");
                                    setRefundChequeNo("");
                                    setRefundDate("");
                                    setRefundEmd(emd);
                                  }}
                                >
                                  Refund
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 hover:border-rose-300 rounded-lg text-xs h-8 px-3 transition-colors"
                                  onClick={() => {
                                    setViewAgencies(null);
                                    setForfeitReason("");
                                    setForfeitEmd(emd);
                                  }}
                                >
                                  Forfeit
                                </Button>
                              </div>
                            ) : null}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewAgencies(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
