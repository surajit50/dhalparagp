'use client'

import React, { useState } from 'react'
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "@/components/ui/use-toast"

interface GSTPayment {
  id: number
  companyName: string
  gstAmount: number
  isPaid: boolean
}

export default function GSTRegister() {
  const [gstPayments, setGSTPayments] = useState<GSTPayment[]>([
    { id: 1, companyName: "Company A", gstAmount: 5000, isPaid: false },
    { id: 2, companyName: "Company B", gstAmount: 7500, isPaid: false },
    { id: 3, companyName: "Company C", gstAmount: 6000, isPaid: false },
  ])

  const handlePaymentChange = async (id: number, checked: boolean) => {
    // Simulate a server request
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Update the payment status
    setGSTPayments(prevPayments =>
      prevPayments.map(payment =>
        payment.id === id ? { ...payment, isPaid: checked } : payment
      )
    )

    // Show a toast notification
    toast({
      title: checked ? "GST Payment Marked as Paid" : "GST Payment Marked as Unpaid",
      description: `Company ID: ${id}`,
    })
  }

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-xl font-semibold mb-4">GST Register</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Company Name</TableHead>
            <TableHead>GST Amount</TableHead>
            <TableHead>Payment Status</TableHead>
            <TableHead>Mark as Paid</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {gstPayments.map((payment) => (
            <TableRow key={payment.id}>
              <TableCell>{payment.companyName}</TableCell>
              <TableCell>₹{payment.gstAmount.toFixed(2)}</TableCell>
              <TableCell>{payment.isPaid ? "Paid" : "Unpaid"}</TableCell>
              <TableCell>
                <Checkbox
                  id={`paid-gst-${payment.id}`}
                  checked={payment.isPaid}
                  onCheckedChange={(checked) => handlePaymentChange(payment.id, checked as boolean)}
                  disabled={payment.isPaid}
                  aria-label={`Mark ${payment.companyName}'s GST payment as paid`}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
