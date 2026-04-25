"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { UserPlus } from "lucide-react"

interface AssignMemberDialogProps {
  stationId: string
}

const dummyMembers = [
  { id: "1", name: "Amit Kumar" },
  { id: "2", name: "Priya Singh" },
  { id: "3", name: "Rajesh Sharma" },
  // Add more dummy members as needed
]

export function AssignMemberDialog({ stationId }: AssignMemberDialogProps) {
  const [open, setOpen] = useState(false)
  const [selectedMember, setSelectedMember] = useState("")

  const handleAssign = () => {
    // Handle member assignment
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <UserPlus className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Assign Gram Sansad Member</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="member">Select Member</Label>
            <Select onValueChange={setSelectedMember}>
              <SelectTrigger>
                <SelectValue placeholder="Select a member" />
              </SelectTrigger>
              <SelectContent>
                {dummyMembers.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleAssign} className="w-full" disabled={!selectedMember}>
            Assign Member
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

