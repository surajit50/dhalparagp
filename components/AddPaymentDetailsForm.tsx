"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

interface AddPaymentDetailsFormProps {
  workId: string
  onSuccess: () => void
}

export function AddPaymentDetailsForm({ workId, onSuccess }: AddPaymentDetailsFormProps) {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm({
    defaultValues: {
      referenceNumber: "",
      amount: "",
      paymentMethod: "",
      remarks: "",
      document: ""
    }
  })

  const onSubmit = async (data: any) => {
    setIsSubmitting(true)

    try {
      await new Promise(resolve => setTimeout(resolve, 1500))

      reset()
      setDate(new Date())

      toast.success("Payment details added successfully!", {
        description: `Reference: ${data.referenceNumber} - Amount: ₹${data.amount}`,
      })

      onSuccess()
    } catch {
      toast.error("Failed to add payment details")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white p-6 border border-gray-200">

      <h2 className="text-lg font-semibold text-[#1e3a8a] border-b pb-2">
        Add Payment Details
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Reference Number */}
        <div className="space-y-2">
          <Label htmlFor="referenceNumber">Reference Number *</Label>
          <Input
            id="referenceNumber"
            className="border-gray-300 focus:border-[#1e3a8a]"
            {...register("referenceNumber", { required: "Reference number is required" })}
          />
          {errors.referenceNumber && (
            <p className="text-red-600 text-sm">{errors.referenceNumber.message as string}</p>
          )}
        </div>

        {/* Payment Date */}
        <div className="space-y-2">
          <Label>Payment Date *</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left border-gray-300"
              >
                <CalendarIcon className="mr-2 h-4 w-4 text-[#1e3a8a]" />
                {date ? format(date, "dd MMMM yyyy") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 border border-gray-200">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                initialFocus
                required
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Amount */}
        <div className="space-y-2">
          <Label htmlFor="amount">Amount (₹) *</Label>
          <Input
            id="amount"
            type="number"
            className="border-gray-300 focus:border-[#1e3a8a]"
            {...register("amount", {
              required: "Amount is required",
              min: { value: 1, message: "Amount must be greater than 0" }
            })}
          />
          {errors.amount && (
            <p className="text-red-600 text-sm">{errors.amount.message as string}</p>
          )}
        </div>

        {/* Payment Method */}
        <div className="space-y-2">
          <Label>Payment Method *</Label>
          <Select onValueChange={(value) => setValue("paymentMethod", value)}>
            <SelectTrigger className="border-gray-300">
              <SelectValue placeholder="Select payment method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cheque">Cheque</SelectItem>
              <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
              <SelectItem value="cash">Cash</SelectItem>
              <SelectItem value="online">Online Payment</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Remarks */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="remarks">Remarks</Label>
          <Textarea
            id="remarks"
            rows={3}
            className="border-gray-300 focus:border-[#1e3a8a]"
            {...register("remarks")}
          />
        </div>

        {/* File Upload */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="document">Upload Supporting Document</Label>
          <Input
            id="document"
            type="file"
            accept=".pdf,.jpg,.png"
            className="border-gray-300"
            {...register("document")}
          />
          <p className="text-xs text-gray-500">PDF, JPG, PNG (Max 5MB)</p>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-4 pt-4 border-t">

        <Button
          variant="outline"
          type="button"
          className="border-gray-400 text-gray-700 hover:bg-gray-100"
          onClick={() => {
            reset()
            setDate(new Date())
          }}
          disabled={isSubmitting}
        >
          Reset
        </Button>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-[#1e3a8a] hover:bg-[#1e40af] text-white"
        >
          {isSubmitting ? "Processing..." : "Add Payment"}
        </Button>

      </div>

      {/* Work Info */}
      <div className="mt-6 p-4 border border-gray-200 bg-gray-50 text-sm">
        <h4 className="font-medium text-[#1e3a8a] mb-2">Work Information</h4>
        <div className="grid grid-cols-2 gap-2">
          <div className="text-gray-600">Work ID:</div>
          <div className="font-medium">{workId}</div>
          <div className="text-gray-600">Status:</div>
          <div className="font-medium text-[#1e3a8a]">Active</div>
        </div>
      </div>

    </form>
  )
}
