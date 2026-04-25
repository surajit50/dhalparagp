
"use client"

import { useState, useTransition } from "react"
import { IndeterminateCheckbox } from "@/components/ui/indeterminate-checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { updateIncomeTaxPayment } from "@/action/update-income-tax"
import type { IncomeTaxRegister, PaymentMethod, PaymentDetails, WorksDetail, ApprovedActionPlanDetails } from "@prisma/client"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle2, CreditCard, Loader2 } from "lucide-react"

type IncomeTaxRegisterWithDetails = IncomeTaxRegister & {
  PaymentDetails: (PaymentDetails & {
    WorksDetail: WorksDetail & {
      ApprovedActionPlanDetails: ApprovedActionPlanDetails | null
    }
  })[]
}

interface TaxTableProps {
  data: IncomeTaxRegisterWithDetails[]
}

export function TaxTable({ data }: TaxTableProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>()
  const [chequeNumber, setChequeNumber] = useState("")
  const [selectedFund, setSelectedFund] = useState<string>("all")
  const [isPending, startTransition] = useTransition()

  // Get unique fund types from nested relations
  const fundTypes = Array.from(
    new Set(
      data.flatMap(entry =>
        entry.PaymentDetails
          .map(pd => pd.WorksDetail.ApprovedActionPlanDetails?.schemeName)
          .filter((fund): fund is string => !!fund)
      )
    )
  )

  // Filter data based on selected fund
  const filteredData = data.filter(entry => {
    if (selectedFund === "all") return true
    return entry.PaymentDetails.some(pd =>
      pd.WorksDetail.ApprovedActionPlanDetails?.schemeName === selectedFund
    )
  })

  const unpaidEntries = filteredData.filter(entry => !entry.paid)
  const allUnpaidSelected = unpaidEntries.every(entry => selectedIds.includes(entry.id))

  const totalAmount = selectedIds.reduce((total, id) => {
    const entry = data.find(d => d.id === id)
    return total + (entry?.incomeTaaxAmount || 0)
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
      await updateIncomeTaxPayment(selectedIds, paymentMethod, chequeNumber)
      window.location.reload()
    })
  }

  return (
    <Card className="shadow-md">
      <CardHeader className="bg-slate-50 border-b">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle className="text-2xl font-bold text-slate-800">
              Income Tax Register
            </CardTitle>
            <CardDescription>Select entries to record payments</CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 items-end">
            <div className="w-full sm:w-[200px]">
              <Select value={selectedFund} onValueChange={setSelectedFund}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by fund" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Funds</SelectItem>
                  {fundTypes.map(fund => (
                    <SelectItem key={fund} value={fund}>
                      {fund}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Badge variant="outline" className="px-3 py-1 text-sm font-medium">
              {unpaidEntries.length} Unpaid Entries
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0 overflow-x-auto">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="w-12">
                <IndeterminateCheckbox
                  checked={allUnpaidSelected}
                  onCheckedChange={handleCheckAll}
                  indeterminate={selectedIds.length > 0 && !allUnpaidSelected}
                  disabled={isPending || unpaidEntries.length === 0}
                />
              </TableHead>
              <TableHead className="w-16">Sl No</TableHead>
              <TableHead>Amount (₹)</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Fund</TableHead>
              <TableHead>Paid At</TableHead>
              <TableHead>Payment Method</TableHead>
              <TableHead>Cheque Number</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.map((entry, index) => (
              <TableRow
                key={entry.id}
                className={entry.paid ? "bg-slate-50/50" : ""}
              >
                <TableCell>
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
                <TableCell className="font-medium">{index + 1}</TableCell>
                <TableCell className="font-semibold">
                  ₹{entry.incomeTaaxAmount.toLocaleString()}
                </TableCell>
                <TableCell>
                  {entry.paid ? (
                    <div className="flex items-center gap-1.5 text-green-600">
                      <CheckCircle2 className="h-4 w-4" />
                      <span className="font-medium">Paid</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-amber-600">
                      <AlertCircle className="h-4 w-4" />
                      <span className="font-medium">Unpaid</span>
                    </div>
                  )}
                </TableCell>
                <TableCell className="text-slate-500">
                  {entry.PaymentDetails[0]?.WorksDetail.ApprovedActionPlanDetails?.schemeName || "-"}
                </TableCell>
                <TableCell>
                  {entry.paidAt ? (
                    <span className="text-slate-700">
                      {entry.paidAt.toLocaleDateString()}
                    </span>
                  ) : (
                    <span className="text-slate-400">-</span>
                  )}
                </TableCell>
                <TableCell>
                  {entry.paymentMethod ? (
                    <Badge variant="outline" className="font-normal">
                      {entry.paymentMethod.replace("_", " ")}
                    </Badge>
                  ) : (
                    <span className="text-slate-400">-</span>
                  )}
                </TableCell>
                <TableCell>
                  {entry.chequeNumber || (
                    <span className="text-slate-400">-</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {filteredData.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="h-24 text-center text-slate-500"
                >
                  {selectedFund === "all"
                    ? "No entries found"
                    : "No entries match the selected fund"}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>

      <CardFooter className="flex flex-col p-6 gap-6 border-t bg-slate-50">
        <div className="w-full flex flex-col md:flex-row gap-4">
          <div className="flex-1 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="w-full sm:w-[200px]">
                <label className="text-sm font-medium mb-1.5 block text-slate-700">
                  Payment Method
                </label>
                <Select
                  value={paymentMethod}
                  onValueChange={(value) => {
                    setPaymentMethod(value as PaymentMethod)
                    if (value !== "CHEQUE") setChequeNumber("")
                  }}
                  disabled={isPending || selectedIds.length === 0}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CASH">Cash</SelectItem>
                    <SelectItem value="CHEQUE">Cheque</SelectItem>
                    <SelectItem value="ONLINE_TRANSFER">
                      Online Transfer
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {paymentMethod === "CHEQUE" && (
                <div className="w-full sm:w-[200px]">
                  <label className="text-sm font-medium mb-1.5 block text-slate-700">
                    Cheque Number
                  </label>
                  <Input
                    placeholder="Enter cheque number"
                    value={chequeNumber}
                    onChange={(e) => setChequeNumber(e.target.value)}
                    disabled={isPending}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col justify-end gap-2 min-w-[200px]">
            <div className="text-sm font-medium text-slate-500">
              Total Selected
            </div>
            <div className="text-2xl font-bold text-slate-800">
              ₹{totalAmount.toLocaleString()}
            </div>
          </div>
        </div>

        <div className="flex justify-end w-full">
          <Button
            onClick={handleSave}
            disabled={
              selectedIds.length === 0 ||
              isPending ||
              !paymentMethod ||
              (paymentMethod === "CHEQUE" && !chequeNumber)
            }
            className="min-w-[180px]"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="mr-2 h-4 w-4" />
                Record Payment
              </>
            )}
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
