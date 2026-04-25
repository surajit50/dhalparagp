"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus } from "lucide-react"

export function AddPollingStationDialog() {
  const [open, setOpen] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Polling Station
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Polling Station</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="stationNumber">Station Number</Label>
            <Input id="stationNumber" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="location">Location</Label>
            <Input id="location" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="boothAddress">Booth Address</Label>
            <Input id="boothAddress" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="totalVoters">Total Voters</Label>
            <Input id="totalVoters" type="number" required />
          </div>
          <Button type="submit" className="w-full">
            Add Station
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

