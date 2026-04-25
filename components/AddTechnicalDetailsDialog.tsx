"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import AddTechnicalDetails from "@/components/form/AddTechnicalDetails"
import { CheckCircle } from "lucide-react"

interface AddTechnicalDetailsDialogProps {
  agencyid: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function AddTechnicalDetailsDialog({
  agencyid,
  open,
  onOpenChange,
}: AddTechnicalDetailsDialogProps) {
  const router = useRouter()
  const [isSuccess, setIsSuccess] = useState(false)

  const handleDialogChange = (newOpen: boolean) => {
    if (!newOpen) {
      if (isSuccess) {
        router.refresh()
      }
      setIsSuccess(false)
    }
    onOpenChange(newOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleDialogChange}>
      <DialogContent
        className="max-w-4xl max-h-[90vh] overflow-y-auto"
        onInteractOutside={(e) => isSuccess && e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            {isSuccess ? (
              <>
                <CheckCircle className="text-green-500" />
                Success!
              </>
            ) : (
              "Add Technical Details"
            )}
          </DialogTitle>

          {isSuccess && (
            <DialogDescription>
              Details added successfully
            </DialogDescription>
          )}
        </DialogHeader>

        {isSuccess ? (
          <div className="flex flex-col items-center justify-center py-6">
            <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
            <p className="text-lg mb-6">
              Technical details submitted successfully!
            </p>

            <Button
              onClick={() => handleDialogChange(false)}
              className="px-6 py-3"
            >
              Return to Bidder List
            </Button>
          </div>
        ) : (
          <AddTechnicalDetails
            agencyid={agencyid}
            isDialogMode={true}
            afterSubmit={() => setIsSuccess(true)}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
