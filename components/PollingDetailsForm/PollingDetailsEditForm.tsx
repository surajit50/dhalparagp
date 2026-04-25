"use client"

import { useState, useEffect, useTransition } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { MdClose } from "react-icons/md"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

const pollingDetailsSchema = z.object({
  pollingdetailsno: z.coerce.number().min(1, "Polling station number must be at least 1"),
  pollingdetailsname: z.string().min(2, "Polling station name must be at least 2 characters"),
  malevoter: z.coerce.number().min(0, "Male voters must be a non-negative number"),
  femalevoter: z.coerce.number().min(0, "Female voters must be a non-negative number"),
})

type PollingDetailsType = z.infer<typeof pollingDetailsSchema>

const editPollingdetails = async (values: PollingDetailsType, id: string) => {
  // Simulating an API call
  await new Promise((resolve) => setTimeout(resolve, 1000))
  return { success: true }
}

export default function PollingDetailsEditForm({ params }: { params: { id: string } }) {
  const [isOpen, setIsOpen] = useState(true)
  const [isPending, startTransition] = useTransition()
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  const form = useForm<PollingDetailsType>({
    resolver: zodResolver(pollingDetailsSchema),
    defaultValues: {
      pollingdetailsno: 0,
      pollingdetailsname: "",
      malevoter: 0,
      femalevoter: 0,
    },
  })

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        // Simulating API call to fetch existing data
        await new Promise(resolve => setTimeout(resolve, 1000))
        const data = {
          pollingdetailsno: 1,
          pollingdetailsname: "Sample Station",
          malevoter: 100,
          femalevoter: 100,
        }
        form.reset(data)
      } catch (error) {
        console.error("Failed to fetch polling details:", error)
        toast({
          title: "Error",
          description: "Failed to load polling details. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [form, params.id])

  const onSubmit = async (values: PollingDetailsType) => {
    startTransition(async () => {
      try {
        const result = await editPollingdetails(values, params.id)
        if (result.success) {
          setIsOpen(false)
          toast({
            title: "Success",
            description: "Polling details have been updated successfully.",
          })
          router.push("/dashboard/pollingdetails")
        }
      } catch (error) {
        console.error("Failed to update polling details:", error)
        toast({
          title: "Error",
          description: "Failed to update polling details. Please try again.",
          variant: "destructive",
        })
      }
    })
  }

  const handleClose = () => {
    setIsOpen(false)
    router.push("/dashboard/pollingdetails")
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-teal-600">Edit Polling Details</DialogTitle>
          <DialogDescription>
            Update the details for this polling station. Click update when you are done.
          </DialogDescription>
        </DialogHeader>
        {isLoading ? (
          <div className="flex justify-center items-center h-48">
            <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="pollingdetailsno"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Polling Station Number</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Enter Polling Station No" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="pollingdetailsname"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Polling Station Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter Polling Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="malevoter"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Male Voters</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Enter Male Voter Count" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="femalevoter"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Female Voters</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Enter Female Voter Count" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  )
}