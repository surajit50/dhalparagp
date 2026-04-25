"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useTransition } from "react"
import { MdClose } from "react-icons/md"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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

const pollingDetailsSchema = z.object({
  pollingdetailsno: z.number().min(1, "Polling station number must be at least 1"),
  pollingdetailsname: z.string().min(2, "Polling station name must be at least 2 characters"),
  malevoter: z.number().min(0, "Male voters must be a non-negative number"),
  femalevoter: z.number().min(0, "Female voters must be a non-negative number"),
})

type PollingDetailsType = z.infer<typeof pollingDetailsSchema>

const addPollingdetails = async (values: PollingDetailsType) => {
  // Simulating an API call
  await new Promise((resolve) => setTimeout(resolve, 1000))
  return { success: true }
}

export default function PollingDetailsForm() {
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const form = useForm<PollingDetailsType>({
    resolver: zodResolver(pollingDetailsSchema),
    defaultValues: {
      pollingdetailsno: undefined,
      pollingdetailsname: "",
      malevoter: undefined,
      femalevoter: undefined,
    },
  })

  const onSubmit = async (values: PollingDetailsType) => {
    startTransition(async () => {
      const result = await addPollingdetails(values)
      if (result.success) {
        setIsOpen(false)
        form.reset()
        toast({
          title: "Success",
          description: "Polling details have been added successfully.",
        })
      }
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-500 text-white hover:bg-blue-600">
          Add Polling Details
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-teal-600">Add Polling Details</DialogTitle>
          <DialogDescription>
            Enter the details for the new polling station. Click save when youre done.
          </DialogDescription>
        </DialogHeader>
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
              <Button type="submit" disabled={isPending}>
                {isPending ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}