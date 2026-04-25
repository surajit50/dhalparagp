"use client"

import React, { useEffect, useState } from "react"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"

import { useToast } from "@/components/ui/use-toast"
import { updateAocDetails } from "./actions"
import { useRouter } from "next/navigation"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  workId: string | null
}

export default function WorkOrderModificationDialog({
  open,
  onOpenChange,
  workId
}: Props) {

  const { toast } = useToast()
  const router = useRouter()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<any | null>(null)

  const [memoNo, setMemoNo] = useState("")
  const [memoDate, setMemoDate] = useState("")
  const [isDelivery, setIsDelivery] = useState(false)
  const [deliveryDate, setDeliveryDate] = useState("")

  useEffect(() => {

    if (!open || !workId) return

    setLoading(true)

    fetch(`/api/workorder-aoc?workId=${workId}`)
      .then(res => res.json())
      .then(json => {

        setData(json)

        const aoc = Array.isArray(json.worksDetail?.AwardofContract)
          ? json.worksDetail.AwardofContract[0]
          : json.worksDetail.AwardofContract

        setMemoNo(aoc?.workodermenonumber ?? "")

        setMemoDate(
          aoc?.workordeermemodate
            ? new Date(aoc.workordeermemodate)
                .toISOString()
                .slice(0, 10)
            : ""
        )

        setIsDelivery(aoc?.isdelivery ?? false)

        setDeliveryDate(
          aoc?.deliveryDate
            ? new Date(aoc.deliveryDate)
                .toISOString()
                .slice(0, 10)
            : ""
        )
      })
      .catch(() => setError("Failed to load data"))
      .finally(() => setLoading(false))

  }, [open, workId])


  async function onSubmit() {

    if (!workId) return

    const form = new FormData()

    form.append("workId", workId)
    form.append("workodermenonumber", memoNo)
    form.append("workordeermemodate", memoDate)
    form.append("isdelivery", String(isDelivery))
    form.append("deliveryDate", deliveryDate)

    const res = await updateAocDetails(form)

    if (res?.error) {

      toast({
        title: "Error",
        description: res.error,
        variant: "destructive"
      })

    } else {

      toast({
        title: "Success",
        description: "Work order updated successfully"
      })

      router.refresh()
      onOpenChange(false)

    }

  }


  return (

    <Dialog open={open} onOpenChange={onOpenChange}>

      <DialogContent className="max-w-lg border-blue-200">

        {/* Header */}
        <DialogHeader className="bg-blue-700 text-white px-4 py-3 -mx-6 -mt-6 mb-4">

          <DialogTitle>
            Modify Work Order Details
          </DialogTitle>

        </DialogHeader>

        {loading && (
          <div className="py-4 text-center">
            Loading...
          </div>
        )}

        {error && (
          <div className="text-red-500 py-4">
            {error}
          </div>
        )}

        {data && (

          <div className="space-y-4">

            {/* Memo */}
            <Card className="border-blue-200">

              <CardHeader className="bg-blue-50">
                <CardTitle className="text-blue-800">
                  Memo Information
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-3">

                <div>
                  <Label>Memo Number</Label>
                  <Input
                    value={memoNo}
                    onChange={e => setMemoNo(e.target.value)}
                  />
                </div>

                <div>
                  <Label>Memo Date</Label>
                  <Input
                    type="date"
                    value={memoDate}
                    onChange={e => setMemoDate(e.target.value)}
                  />
                </div>

              </CardContent>

            </Card>


            {/* Delivery */}
            <Card className="border-blue-200">

              <CardHeader className="bg-blue-50">
                <CardTitle className="text-blue-800">
                  Delivery Information
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-3">

                <div className="flex items-center gap-2">

                  <Checkbox
                    checked={isDelivery}
                    onCheckedChange={(v: any) =>
                      setIsDelivery(!!v)
                    }
                  />

                  <Label>
                    Work Delivered
                  </Label>

                </div>

                <div>

                  <Label>
                    Delivery Date
                  </Label>

                  <Input
                    type="date"
                    value={deliveryDate}
                    onChange={e =>
                      setDeliveryDate(e.target.value)
                    }
                    disabled={!isDelivery}
                  />

                </div>

              </CardContent>

            </Card>


            {/* Buttons */}
            <div className="flex justify-end gap-2 pt-2">

              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>

              <Button
                onClick={onSubmit}
                className="bg-blue-700 hover:bg-blue-800 text-white"
              >
                Save Changes
              </Button>

            </div>

          </div>
        )}

      </DialogContent>

    </Dialog>

  )
}
