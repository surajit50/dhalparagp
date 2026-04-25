'use client'

import React, { useState } from 'react'
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "@/components/ui/use-toast"

interface LabourCessPayment {
  id: number
  projectName: string
  cessAmount: number
  isPaid: boolean
}

export default function LabourCessRegister() {
  const [labourCessPayments, setLabourCessPayments] = useState<LabourCessPayment[]>([
    { id: 1, projectName: "Project 1", cessAmount: 1000, isPaid: false },
    { id: 2, projectName: "Project 2", cessAmount: 1500, isPaid: false },
    { id: 3, projectName: "Project 3", cessAmount: 1200, isPaid: false },
  ])

  const handlePaymentChange = async (id: number, checked: boolean) => {
    // Simulate a server request
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Update the payment status
    setLabourCessPayments(prevPayments =>
      prevPayments.map(payment =>
        payment.id === id ? { ...payment, isPaid: checked } : payment
      )
    )

    // Show a toast notification
    toast({
      title: checked ? "Labour Cess Payment Marked as Paid" : "Labour Cess Payment Marked as Unpaid",
      description: `Project ID: ${id}`,
    })
  }

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-xl font-semibold mb-4">Labour Cess Register</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Project Name</TableHead>
            <TableHead>Cess Amount</TableHead>
            <TableHead>Payment Status</TableHead>
            <TableHead>Mark as Paid</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {labourCessPayments.map((payment) => (
            <TableRow key={payment.id}>
              <TableCell>{payment.projectName}</TableCell>
              <TableCell>₹{payment.cessAmount.toFixed(2)}</TableCell>
              <TableCell>{payment.isPaid ? "Paid" : "Unpaid"}</TableCell>
              <TableCell>
                <Checkbox
                  id={`paid-labour-cess-${payment.id}`}
                  checked={payment.isPaid}
                  onCheckedChange={(checked) => handlePaymentChange(payment.id, checked as boolean)}
                  disabled={payment.isPaid}
                  aria-label={`Mark ${payment.projectName}'s labour cess payment as paid`}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
