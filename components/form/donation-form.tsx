'use client'

import { useState } from 'react'
import { useFormState } from 'react-dom'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { QRCodeSVG } from 'qrcode.react'

// Replace with your actual UPI ID
const UPI_ID = '8942805098@ybl'

export default function DonationForm() {
  const [amount, setAmount] = useState('')
  const [showQR, setShowQR] = useState(false)

  const generateUpiUrl = (amount: string) => {
    return `upi://pay?pa=${UPI_ID}&pn=Gram%20Panchayat%20Donation&am=${amount}&cu=INR`
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (Number(amount) > 0) {
      setShowQR(true)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Donate to Gram Panchayats Development</CardTitle>
        <CardDescription>Your contribution helps improve rural communities</CardDescription>
      </CardHeader>
      <CardContent>
        {!showQR ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                Donation Amount (₹)
              </label>
              <Input
                type="number"
                id="amount"
                name="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                min="1"
                required
                className="mt-1"
              />
            </div>
            <Button type="submit" className="w-full">
              Generate UPI QR Code
            </Button>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-center">
              <QRCodeSVG value={generateUpiUrl(amount)} size={200} />
            </div>
            <p className="text-center">Scan this QR code to pay ₹{amount} via UPI</p>
            <Button onClick={() => setShowQR(false)} className="w-full">
              Enter Different Amount
            </Button>
          </div>
        )}
        
      </CardContent>
    </Card>
  )
}
