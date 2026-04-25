"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Pencil } from "lucide-react"

type PollingStation = {
  id: string
  stationNumber: string
  location: string
  boothAddress: string
  totalVoters: number
  assignedMember?: string
}

interface EditPollingStationDialogProps {
  station: PollingStation
}

export function EditPollingStationDialog({ station }: EditPollingStationDialogProps) {
  const [open, setOpen] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Polling Station</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="stationNumber">Station Number</Label>
            <Input id="stationNumber" defaultValue={station.stationNumber} required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="location">Location</Label>
            <Input id="location" defaultValue={station.location} required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="boothAddress">Booth Address</Label>
            <Input id="boothAddress" defaultValue={station.boothAddress} required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="totalVoters">Total Voters</Label>
            <Input id="totalVoters" type="number" defaultValue={station.totalVoters} required />
          </div>
          <Button type="submit" className="w-full">
            Update Station
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

