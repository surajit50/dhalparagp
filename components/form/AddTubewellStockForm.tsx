'use client'

import { useRef } from 'react'
import { useFormStatus } from 'react-dom'

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

import { addTubewellStock } from '@/action/tubewell-stock'
import { toast } from 'sonner'

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? 'Adding...' : 'Add Stock'}
    </Button>
  )
}

export default function AddTubewellStockForm() {
  const formRef = useRef<HTMLFormElement>(null)

  return (
    <form ref={formRef} action={async (formData) => {
      const tubewellType = formData.get('tubewellType') as string;
      const quantity = parseInt(formData.get('quantity') as string);
      
      try {
        await addTubewellStock({ tubewellType, quantity });
        toast.success("Stock added successfully!");
        formRef.current?.reset()
      } catch (error) {
        toast.error("Failed to add stock.");
      }
    }} className="space-y-4">
      <div>
        <Label htmlFor="tubewellType">Tubewell Type</Label>
        <Input
          id="tubewellType"
          name="tubewellType"
          required
        />
      </div>
      <div>
        <Label htmlFor="quantity">Quantity</Label>
        <Input
          id="quantity"
          name="quantity"
          type="number"
          required
        />
      </div>
      <SubmitButton />
    </form>
  )
}
