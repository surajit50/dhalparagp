"use client"

import { useState, useTransition, useMemo } from "react"
import { IndeterminateCheckbox } from "@/components/ui/indeterminate-checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { updateLabourCessPayment } from "@/action/update-labour-cess"
import type { LabourWelfareCess, PaymentMethod, PaymentDetails, WorksDetail, ApprovedActionPlanDetails } from "@prisma/client"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle2, CreditCard, Loader2, Download, Search, Filter, FileText, Check, DollarSign, Calendar, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { ShowNitDetails } from "@/components/ShowNitDetails"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

type LabourCessRegisterWithDetails = LabourWelfareCess & {
  PaymentDetails: (PaymentDetails & {
    WorksDetail: WorksDetail & {
      ApprovedActionPlanDetails: ApprovedActionPlanDetails | null
      nitDetails?: any
      AwardofContract?: any
    }
  })[]
}

interface CessTableProps {
  data: LabourCessRegisterWithDetails[]
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount)
}

export function CessTable({ data }: CessTableProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>()
  const [chequeNumber, setChequeNumber] = useState("")
  const [selectedFund, setSelectedFund] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("unpaid")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [paymentDateFrom, setPaymentDateFrom] = useState<string>("")
  const [paymentDateTo, setPaymentDateTo] = useState<string>("")
  const [isPending, startTransition] = useTransition()

  // Get unique fund types
  const fundTypes = useMemo(() => 
    Array.from(
      new Set(
        data.flatMap(entry =>
          entry.PaymentDetails
            .map(pd => pd.WorksDetail.ApprovedActionPlanDetails?.schemeName)
            .filter((fund): fund is string => !!fund)
        )
      )
    ),
    [data]
  )

  // Filter data based on search, fund, status, and bill payment date
  const filteredData = useMemo(() => 
    data.filter(entry => {
      const fundMatch = selectedFund === "all" || entry.PaymentDetails.some(pd =>
        pd.WorksDetail.ApprovedActionPlanDetails?.schemeName === selectedFund
      )

      const statusMatch =
        statusFilter === "all" ||
        (statusFilter === "paid" && entry.paid) ||
        (statusFilter === "unpaid" && !entry.paid)

      const bidAgency = (entry as any).PaymentDetails[0]?.WorksDetail?.AwardofContract?.workorderdetails[0]?.Bidagency?.agencydetails;
      const agencyName = bidAgency?.agencyType === "FARM"
        ? (bidAgency?.name + "(" + bidAgency.proprietorName + ")")
        : (bidAgency?.name || "")
      const nitNumber = String((entry as any).PaymentDetails[0]?.WorksDetail?.nitDetails?.memoNumber || "")
      const searchMatch =
        searchQuery === "" ||
        agencyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        nitNumber.toLowerCase().includes(searchQuery.toLowerCase())

      // Bill payment date filter – matches if ANY PaymentDetail has billPaymentDate in range
      let dateMatch = true;
      if (paymentDateFrom || paymentDateTo) {
        const hasMatchingPayment = entry.PaymentDetails.some(pd => {
          if (!pd.billPaymentDate) return false;
          const pdDate = new Date(pd.billPaymentDate);
          if (paymentDateFrom) {
            const from = new Date(paymentDateFrom);
            from.setHours(0, 0, 0, 0);
            if (pdDate < from) return false;
          }
          if (paymentDateTo) {
            const to = new Date(paymentDateTo);
            to.setHours(23, 59, 59, 999);
            if (pdDate > to) return false;
          }
          return true;
        });
        dateMatch = hasMatchingPayment;
      }

      return fundMatch && statusMatch && searchMatch && dateMatch
    }),
    [data, selectedFund, statusFilter, searchQuery, paymentDateFrom, paymentDateTo]
  )

  const unpaidEntries = filteredData.filter(entry => !entry.paid)
  const allUnpaidSelected = unpaidEntries.length > 0 && unpaidEntries.every(entry => selectedIds.includes(entry.id))

  // Metrics
  const metrics = useMemo(() => {
    let totalTax = 0
    let paidTax = 0
    let unpaidTax = 0

    filteredData.forEach(entry => {
      const amount = entry.labourWelfarecessAmt
      totalTax += amount
      if (entry.paid) {
        paidTax += amount
      } else {
        unpaidTax += amount
      }
    })

    return { totalTax, paidTax, unpaidTax }
  }, [filteredData])

  const totalAmountSelected = selectedIds.reduce((total, id) => {
    const entry = data.find(d => d.id === id)
    return total + (entry?.labourWelfarecessAmt || 0)
  }, 0)

  const handleCheckAll = (checked: boolean) => {
    setSelectedIds(checked ? unpaidEntries.map(entry => entry.id) : [])
  }

  const handleSave = async () => {
    if (!paymentMethod) {
      alert("Please select a payment method")
      return
    }

    if (paymentMethod === "CHEQUE" && !chequeNumber) {
      alert("Please enter cheque number")
      return
    }

    startTransition(async () => {
      await updateLabourCessPayment(selectedIds, paymentMethod, chequeNumber)
      setSelectedIds([])
      window.location.reload()
    })
  }

  const exportToPDF = () => {
    try {
      const doc = new jsPDF("landscape", "mm", "a4")
      const pageWidth = doc.internal.pageSize.getWidth()

      doc.setFontSize(18)
      doc.setFont("helvetica", "bold")
      doc.text("Labour Welfare Cess Register Report", pageWidth / 2, 20, { align: "center" })

      doc.setFontSize(10)
      doc.setFont("helvetica", "normal")
      const currentDate = new Date().toLocaleDateString("en-IN")
      doc.text(`Generated on: ${currentDate} | Fund: ${selectedFund} | Status: ${statusFilter}`, pageWidth / 2, 28, { align: "center" })

      const tableData = filteredData.map((entry, index) => {
        const worksDetail = entry.PaymentDetails[0]?.WorksDetail
        const bidAgency = (worksDetail as any)?.AwardofContract?.workorderdetails[0]?.Bidagency?.agencydetails;
        const agencyName = bidAgency?.agencyType === "FARM"
          ? (bidAgency?.name + "(" + bidAgency.proprietorName + ")")
          : (bidAgency?.name || "N/A")
        const nitNumber = worksDetail?.nitDetails?.memoNumber || "N/A"
        const fund = worksDetail?.ApprovedActionPlanDetails?.schemeName || "N/A"
        const billDate = entry.PaymentDetails[0]?.billPaymentDate 
          ? new Date(entry.PaymentDetails[0].billPaymentDate).toLocaleDateString("en-IN") 
          : "-"
        return [
          index + 1,
          agencyName,
          nitNumber,
          entry.labourWelfarecessAmt,
          entry.paid ? "Paid" : "Unpaid",
          fund,
          billDate,
          entry.paymentMethod || "-",
          entry.chequeNumber || "-",
        ]
      })

      autoTable(doc, {
        head: [["Sl No", "Agency Name", "NIT Memo No", "Cess Amount (Rs.)", "Status", "Fund", "Bill Payment Date", "Payment Method", "Cheque No"]],
        body: tableData,
        startY: 38,
        theme: "striped",
        headStyles: { fillColor: [249, 115, 22] },
        bodyStyles: { fontSize: 9 },
      })

      doc.save(`labour-cess-register-${new Date().toISOString().slice(0, 10)}.pdf`)
    } catch (error) {
      console.error("Error generating PDF:", error)
    }
  }

  const clearAllFilters = () => {
    setSearchQuery("")
    setSelectedFund("all")
    setStatusFilter("all")
    setPaymentDateFrom("")
    setPaymentDateTo("")
  }

  const hasActiveFilters = searchQuery || selectedFund !== "all" || statusFilter !== "all" || paymentDateFrom || paymentDateTo

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
              <span className="bg-orange-600/10 p-2 rounded-xl text-orange-600">
                <DollarSign className="h-7 w-7" strokeWidth={2.5} />
              </span>
              Labour Welfare Cess Register
            </h1>
            <p className="text-slate-500 mt-1 text-sm">
              Monitor, track, and record payments for deducted Labour Welfare Cess.
            </p>
          </div>
          <Button
            className="bg-white text-slate-700 border border-slate-200 shadow-sm hover:bg-slate-50 transition-all rounded-xl px-5 h-11"
            onClick={exportToPDF}
          >
            <Download className="h-4 w-4 mr-2 text-orange-500" />
            Export Report
          </Button>
        </div>
      </motion.div>

      {/* Metrics Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="border-0 shadow-sm ring-1 ring-slate-200 bg-white">
            <CardContent className="p-6 flex justify-between items-center">
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-500">Total Cess Deducted</p>
                <h3 className="text-2xl font-bold tracking-tight text-slate-900">
                  {formatCurrency(metrics.totalTax)}
                </h3>
              </div>
              <div className="h-12 w-12 bg-orange-50 rounded-full flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm ring-1 ring-slate-200 bg-white">
            <CardContent className="p-6 flex justify-between items-center">
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-500">Total Paid Out</p>
                <h3 className="text-2xl font-bold tracking-tight text-emerald-600">
                  {formatCurrency(metrics.paidTax)}
                </h3>
              </div>
              <div className="h-12 w-12 bg-emerald-50 rounded-full flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-emerald-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm ring-1 ring-slate-200 bg-white">
            <CardContent className="p-6 flex justify-between items-center">
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-500">Outstanding (Unpaid)</p>
                <h3 className="text-2xl font-bold tracking-tight text-rose-600">
                  {formatCurrency(metrics.unpaidTax)}
                </h3>
              </div>
              <div className="h-12 w-12 bg-rose-50 rounded-full flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-rose-600" />
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
        <div className="flex flex-col gap-4">
          {/* First row: Search + Fund + Status */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input
                placeholder="Search agency name or NIT number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-11 h-11 bg-white border-slate-200 rounded-xl focus-visible:ring-orange-500 w-full"
              />
            </div>

            <div className="flex gap-4">
              <Select value={selectedFund} onValueChange={setSelectedFund}>
                <SelectTrigger className="w-[180px] h-11 border-slate-200 rounded-xl bg-white">
                  <Filter className="h-4 w-4 mr-2 text-slate-400" />
                  <SelectValue placeholder="Fund Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Funds</SelectItem>
                  {fundTypes.map(fund => (
                    <SelectItem key={fund} value={fund}>{fund}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px] h-11 border-slate-200 rounded-xl bg-white">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="unpaid">Unpaid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Second row: Bill Payment Date Range */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-slate-400" />
              <span className="text-sm font-medium text-slate-500">Bill Payment Date</span>
            </div>
            <Input
              type="date"
              value={paymentDateFrom}
              onChange={(e) => setPaymentDateFrom(e.target.value)}
              className="w-[150px] h-9 bg-white border-slate-200 rounded-xl"
            />
            <span className="text-slate-400 text-sm">—</span>
            <Input
              type="date"
              value={paymentDateTo}
              onChange={(e) => setPaymentDateTo(e.target.value)}
              className="w-[150px] h-9 bg-white border-slate-200 rounded-xl"
            />
            {(paymentDateFrom || paymentDateTo) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setPaymentDateFrom(""); setPaymentDateTo(""); }}
                className="h-9 px-3 text-slate-500 hover:text-slate-700"
              >
                Clear
              </Button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Filter Summary */}
      {hasActiveFilters && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          
        >
          <span className="font-medium">Active Filters:</span>
          {searchQuery && (
            <Badge variant="secondary" className="bg-slate-200 text-slate-700 flex items-center gap-1">
              Search: {searchQuery}
              <X className="h-3 w-3 cursor-pointer" onClick={() => setSearchQuery("")} />
            </Badge>
          )}
          {selectedFund !== "all" && (
            <Badge variant="secondary" className="bg-slate-200 text-slate-700 flex items-center gap-1">
              Fund: {selectedFund}
              <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedFund("all")} />
            </Badge>
          )}
          {statusFilter !== "all" && (
            <Badge variant="secondary" className="bg-slate-200 text-slate-700 flex items-center gap-1">
              Status: {statusFilter}
              <X className="h-3 w-3 cursor-pointer" onClick={() => setStatusFilter("all")} />
            </Badge>
          )}
          {(paymentDateFrom || paymentDateTo) && (
            <Badge variant="secondary" className="bg-slate-200 text-slate-700 flex items-center gap-1">
              Bill Date: {paymentDateFrom || "any"} {paymentDateFrom && paymentDateTo && "—"} {paymentDateTo || "any"}
              <X className="h-3 w-3 cursor-pointer" onClick={() => { setPaymentDateFrom(""); setPaymentDateTo(""); }} />
            </Badge>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="h-7 px-2 text-slate-500 hover:text-slate-700"
          >
            Clear All
          </Button>
        </motion.div>
      )}

      {/* Data Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card className="border-0 shadow-sm ring-1 ring-slate-200 rounded-2xl overflow-hidden bg-white">
          <CardHeader className="border-b border-slate-100 py-5 bg-white">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <FileText className="h-5 w-5 text-orange-500" />
                Ledger Entries
              </CardTitle>
              <Badge variant="secondary" className="bg-slate-100 text-slate-600 px-3">
                {filteredData.length} Records
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
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-slate-50/80 border-b border-slate-200">
                    <TableRow>
                      <TableHead className="w-12 px-6 py-4">
                        <IndeterminateCheckbox
                          checked={allUnpaidSelected}
                          onCheckedChange={handleCheckAll}
                          indeterminate={selectedIds.length > 0 && !allUnpaidSelected}
                          disabled={isPending || unpaidEntries.length === 0}
                        />
                      </TableHead>
                      <TableHead className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Sl No</TableHead>
                      <TableHead className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Agency Name</TableHead>
                      <TableHead className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">NIT Details</TableHead>
                      <TableHead className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Amount (₹)</TableHead>
                      <TableHead className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Status</TableHead>
                      <TableHead className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Fund</TableHead>
                      <TableHead className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Bill Payment Date</TableHead>
                      <TableHead className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Method</TableHead>
                      <TableHead className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Cheque No</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredData.map((entry, index) => {
                      const worksDetail = entry.PaymentDetails[0]?.WorksDetail
                      const bidAgency = (worksDetail as any)?.AwardofContract?.workorderdetails[0]?.Bidagency?.agencydetails;
                      const agencyName = bidAgency?.agencyType === "FARM"
                        ? (bidAgency?.name + "(" + bidAgency.proprietorName + ")")
                        : (bidAgency?.name || "N/A")
                      const nitDetails = worksDetail?.nitDetails
                      const billDate = entry.PaymentDetails[0]?.billPaymentDate 
                        ? new Date(entry.PaymentDetails[0].billPaymentDate).toLocaleDateString("en-IN")
                        : "-"

                      return (
                        <TableRow key={entry.id} className="border-b border-slate-100 hover:bg-slate-50/80 transition-all">
                          <TableCell className="px-6 py-4">
                            <IndeterminateCheckbox
                              checked={selectedIds.includes(entry.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedIds([...selectedIds, entry.id])
                                } else {
                                  setSelectedIds(selectedIds.filter(id => id !== entry.id))
                                }
                              }}
                              disabled={entry.paid || isPending}
                            />
                          </TableCell>
                          <TableCell className="px-6 py-4 text-slate-500">{index + 1}</TableCell>
                          <TableCell className="px-6 py-4 font-semibold text-slate-900 max-w-[200px] truncate" title={agencyName}>
                            {agencyName}
                          </TableCell>
                          <TableCell className="px-6 py-4">
                            {nitDetails && (
                              <ShowNitDetails
                                nitdetails={nitDetails.memoNumber}
                                memoDate={nitDetails.memoDate}
                                workslno={worksDetail?.workslno || ""}
                              />
                            )}
                          </TableCell>
                          <TableCell className="px-6 py-4 font-bold text-slate-900">
                            {formatCurrency(entry.labourWelfarecessAmt)}
                          </TableCell>
                          <TableCell className="px-6 py-4">
                            <Badge
                              variant="outline"
                              className={`rounded-full px-3 py-0.5 text-xs font-semibold border-0 ${
                                entry.paid
                                  ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20"
                                  : "bg-rose-50 text-rose-700 ring-1 ring-rose-600/20"
                              }`}
                            >
                              {entry.paid ? "Paid" : "Unpaid"}
                            </Badge>
                          </TableCell>
                          <TableCell className="px-6 py-4 text-slate-500">
                            {worksDetail?.ApprovedActionPlanDetails?.schemeName || "-"}
                          </TableCell>
                          <TableCell className="px-6 py-4 text-slate-600">
                            {billDate}
                          </TableCell>
                          <TableCell className="px-6 py-4">
                            {entry.paymentMethod ? (
                              <Badge variant="outline" className="font-normal border-slate-200">
                                {entry.paymentMethod.replace("_", " ")}
                              </Badge>
                            ) : "-"}
                          </TableCell>
                          <TableCell className="px-6 py-4 text-slate-600">{entry.chequeNumber || "-"}</TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Floating Bulk Action / Form Banner */}
      <AnimatePresence>
        {selectedIds.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
          >
            <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 w-[90%] max-w-4xl bg-orange-600 text-white rounded-2xl shadow-xl p-4 px-6 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 font-medium">
                <div className="bg-white/20 px-3 py-1 rounded-full text-sm">
                  {selectedIds.length} Selected
                </div>
                <span className="font-semibold text-lg">
                  Total Amount: {formatCurrency(totalAmountSelected)}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                <Select
                  value={paymentMethod}
                  onValueChange={(value) => {
                    setPaymentMethod(value as PaymentMethod)
                    if (value !== "CHEQUE") setChequeNumber("")
                  }}
                  disabled={isPending}
                >
                  <SelectTrigger className="w-[150px] bg-white text-slate-800 border-0 h-10 rounded-xl">
                    <SelectValue placeholder="Pay Method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CASH">Cash</SelectItem>
                    <SelectItem value="CHEQUE">Cheque</SelectItem>
                    <SelectItem value="ONLINE_TRANSFER">Online Transfer</SelectItem>
                  </SelectContent>
                </Select>

                {paymentMethod === "CHEQUE" && (
                  <Input
                    placeholder="Cheque Number"
                    value={chequeNumber}
                    onChange={(e) => setChequeNumber(e.target.value)}
                    disabled={isPending}
                    className="w-[150px] bg-white text-slate-800 border-0 h-10 rounded-xl focus-visible:ring-0"
                  />
                )}

                <Button
                  onClick={handleSave}
                  disabled={
                    isPending ||
                    !paymentMethod ||
                    (paymentMethod === "CHEQUE" && !chequeNumber)
                  }
                  className="bg-white text-orange-700 hover:bg-slate-50 border-0 shadow-sm h-10 rounded-xl px-5"
                >
                  {isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Record Payment
                    </>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
