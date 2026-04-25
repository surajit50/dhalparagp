
"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Edit, Save, X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast";

const modifyTechnicalDetailsSchema = z.object({
  qualify: z.boolean(),
  remarks: z.string().optional(),
  // Document checks
  byelow: z.boolean(),
  pfregistrationupdatechalan: z.boolean(),
  declaration: z.boolean(),
  machinary: z.boolean(),
  // Credential checks
  credencial: z.object({
    sixtyperamtput: z.boolean(),
    workorder: z.boolean(),
    paymentcertificate: z.boolean(),
    comcertificat: z.boolean(),
  }),
  // Validity checks
  validityofdocument: z.object({
    itreturn: z.boolean(),
    gst: z.boolean(),
    tradelicence: z.boolean(),
    ptax: z.boolean(),
  }),
})

type ModifyTechnicalDetailsForm = z.infer<typeof modifyTechnicalDetailsSchema>

interface ModifyTechnicalDetailsDialogProps {
  bidderId: string
  bidderName: string
  onUpdate?: () => void
}

export function ModifyTechnicalDetailsDialog({ bidderId, bidderName, onUpdate }: ModifyTechnicalDetailsDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  const form = useForm<ModifyTechnicalDetailsForm>({
    resolver: zodResolver(modifyTechnicalDetailsSchema),
    defaultValues: {
      qualify: false,
      remarks: "",
      byelow: false,
      pfregistrationupdatechalan: false,
      declaration: false,
      machinary: false,
      credencial: {
        sixtyperamtput: false,
        workorder: false,
        paymentcertificate: false,
        comcertificat: false,
      },
      validityofdocument: {
        itreturn: false,
        gst: false,
        tradelicence: false,
        ptax: false,
      },
    },
  })

  const fetchTechnicalDetails = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/technical-details/${bidderId}`)
      if (response.ok) {
        const data = await response.json()
        form.reset(data)
      }
    } catch (error) {
      console.error("Failed to fetch technical details:", error)
      toast({
        title: "Error",
        description: "Failed to load technical details",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (newOpen) {
      fetchTechnicalDetails()
    }
  }

  const onSubmit = async (data: ModifyTechnicalDetailsForm) => {
    setSaving(true)
    try {
      const response = await fetch(`/api/technical-details/${bidderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Technical details updated successfully",
        })
        setOpen(false)
        onUpdate?.()
      } else {
        throw new Error("Failed to update")
      }
    } catch (error) {
      console.error("Failed to update technical details:", error)
      toast({
        title: "Error",
        description: "Failed to update technical details",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const SwitchField = ({ name, label, description }: { name: any; label: string; description?: string }) => (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <FormLabel className="text-base font-medium">{label}</FormLabel>
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
          </div>
          <FormControl>
            <Switch checked={field.value} onCheckedChange={field.onChange} />
          </FormControl>
        </FormItem>
      )}
    />
  )

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center bg-transparent">
          <Edit className="mr-2 h-4 w-4 text-orange-600" />
          <span className="text-orange-600">Modify</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Modify Technical Evaluation - {bidderName}
          </DialogTitle>
          <DialogDescription>Update technical evaluation compliance checks and qualification status</DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Overall Qualification */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Overall Qualification</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <SwitchField
                    name="qualify"
                    label="Qualified"
                    description="Mark this bidder as qualified for the tender"
                  />

                  <FormField
                    control={form.control}
                    name="remarks"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Remarks</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Enter evaluation remarks..." className="min-h-[80px]" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Document Compliance */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Document Compliance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <SwitchField name="byelow" label="Bye-law Compliance" description="Compliance with local bye-laws" />
                  <SwitchField
                    name="pfregistrationupdatechalan"
                    label="PF Registration & Chalan"
                    description="Provident Fund registration and payment"
                  />
                  <SwitchField name="declaration" label="Declaration" description="Required declarations submitted" />
                  <SwitchField
                    name="machinary"
                    label="Machinery Details"
                    description="Machinery and equipment details"
                  />
                </CardContent>
              </Card>

              {/* Credentials */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Credentials</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <SwitchField
                    name="credencial.sixtyperamtput"
                    label="Six Type Ram Tput"
                    description="Technical capability certificate"
                  />
                  <SwitchField
                    name="credencial.workorder"
                    label="Work Order"
                    description="Previous work order certificates"
                  />
                  <SwitchField
                    name="credencial.paymentcertificate"
                    label="Payment Certificate"
                    description="Payment completion certificates"
                  />
                  <SwitchField
                    name="credencial.comcertificat"
                    label="Completion Certificate"
                    description="Work completion certificates"
                  />
                </CardContent>
              </Card>

              {/* Document Validity */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Document Validity</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <SwitchField
                    name="validityofdocument.itreturn"
                    label="IT Return"
                    description="Income Tax Return filing"
                  />
                  <SwitchField
                    name="validityofdocument.gst"
                    label="GST Registration"
                    description="GST registration certificate"
                  />
                  <SwitchField
                    name="validityofdocument.tradelicence"
                    label="Trade License"
                    description="Valid trade license"
                  />
                  <SwitchField
                    name="validityofdocument.ptax"
                    label="Professional Tax"
                    description="Professional tax compliance"
                  />
                </CardContent>
              </Card>

              <DialogFooter className="flex justify-between">
                <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={saving}>
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  )
}
