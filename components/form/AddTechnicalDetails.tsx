"use client"

import { useState, useTransition, useCallback, useMemo, useEffect } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Form } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { AlertCircle, CheckCircle2, ArrowLeft, Loader2, FileCheck } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import CustomFormField, { FormFieldType } from "@/components/CustomFormField"
import { addtechnicaldetailsofagency } from "@/action/bookNitNuber"
import { AddTechnicalDetailsSchema, type AddTechnicalDetailsSchemaType } from "@/schema/tender-management-schema"

interface AddTechnicalDetailsProps {
  agencyid: string
  isDialogMode?: boolean
  afterSubmit?: () => void
}

export default function AddTechnicalDetails({
  agencyid,
  isDialogMode = false,
  afterSubmit,
}: AddTechnicalDetailsProps) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const router = useRouter()

  const form = useForm<AddTechnicalDetailsSchemaType>({
    resolver: zodResolver(AddTechnicalDetailsSchema),
    defaultValues: {
      credencial: {
        sixtyperamtput: false,
        workorder: false,
        paymentcertificate: false,
        comcertificat: false,
      },
      validityofdocument: {
        itreturn: false,
        gst: false,
        ptax: false,
        tradelicence: false,
      },
      byelow: false,
      pfregistrationupdatechalan: false,
      declaration: false,
      machinary: false,
      qualify: false,
      remarks: "",
    },
  })

  /* ---------------------------
     WATCH VALUES (Reactive)
  ---------------------------- */

  const credencialValues = form.watch("credencial")
  const validityValues = form.watch("validityofdocument")
  const qualify = form.watch("qualify")

  const allCredencialChecked = useMemo(
    () => Object.values(credencialValues).every(Boolean),
    [credencialValues]
  )

  const allValidityChecked = useMemo(
    () => Object.values(validityValues).every(Boolean),
    [validityValues]
  )

  const includedFieldPaths = [
    "credencial.sixtyperamtput",
    "credencial.workorder",
    "credencial.paymentcertificate",
    "credencial.comcertificat",
    "validityofdocument.itreturn",
    "validityofdocument.gst",
    "validityofdocument.ptax",
    "validityofdocument.tradelicence",
    "declaration",
    "qualify",
  ] as const

  const includedValues = form.watch(includedFieldPaths)

  const allIncludedChecked = useMemo(
    () => includedValues.every(Boolean),
    [includedValues]
  )

  /* ---------------------------
     AUTO QUALIFY LOGIC
  ---------------------------- */

  useEffect(() => {
    if (allIncludedChecked) {
      form.setValue("qualify", true)
    }
  }, [allIncludedChecked, form])

  /* ---------------------------
     TOGGLE ALL CHECKBOXES
  ---------------------------- */

  const toggleAllCheckboxes = (field: "credencial" | "validityofdocument") => {
    const currentValues = form.getValues(field)
    const allChecked = Object.values(currentValues).every(Boolean)

    Object.keys(currentValues).forEach((key) => {
      form.setValue(`${field}.${key}` as any, !allChecked, {
        shouldValidate: true,
      })
    })
  }

  /* ---------------------------
     SUBMIT HANDLER
  ---------------------------- */

  const onSubmit = useCallback(
    async (data: AddTechnicalDetailsSchemaType) => {
      setError(null)
      setSuccess(null)
      setIsDialogOpen(false)

      startTransition(async () => {
        try {
          const result = await addtechnicaldetailsofagency(data, agencyid)

          if (result.error) {
            setError(result.error)
          } else if (result.success) {
            setSuccess(result.success)

            if (isDialogMode && afterSubmit) {
              afterSubmit()
            } else {
              form.reset()
              setTimeout(() => router.back(), 1500)
            }
          }
        } catch (err) {
          setError(err instanceof Error ? err.message : "Unexpected error occurred.")
        }
      })
    },
    [agencyid, router, form, isDialogMode, afterSubmit]
  )

  /* ---------------------------
     RESET
  ---------------------------- */

  const resetForm = () => {
    form.reset()
    setError(null)
    setSuccess(null)
  }

  /* ---------------------------
     UI
  ---------------------------- */

  return (
    <Form {...form}>
      <Card className="w-full max-w-4xl mx-auto shadow-xl border-0 bg-gradient-to-br from-slate-50 to-slate-100">
        <CardHeader className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileCheck className="h-6 w-6" />
              <h2 className="text-2xl font-bold">Technical Details</h2>
            </div>

            {!isDialogMode && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.back()}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-8">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {error && (
              <div className="bg-red-50 text-red-900 p-4 rounded-lg flex items-center space-x-3 border border-red-200">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}

            {success && (
              <div className="bg-emerald-50 text-emerald-900 p-4 rounded-lg flex items-center space-x-3 border border-emerald-200">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                <p className="text-sm font-medium">{success}</p>
              </div>
            )}

            {/* ---------------- Credentials ---------------- */}

            <fieldset className="p-6 border rounded-lg bg-white shadow-sm">
              <legend className="text-lg font-bold mb-4">Credentials</legend>

              <div className="flex items-center space-x-3 mb-6">
                <Checkbox
                  checked={allCredencialChecked}
                  onCheckedChange={() => toggleAllCheckboxes("credencial")}
                />
                <label className="text-sm font-semibold">
                  Select All Credential Documents
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {Object.keys(credencialValues).map((key) => (
                  <CustomFormField
                    key={key}
                    fieldType={FormFieldType.CHECKBOX}
                    control={form.control}
                    name={`credencial.${key}`}
                    label={key}
                  />
                ))}
              </div>
            </fieldset>

            <Separator />

            {/* ---------------- Validity ---------------- */}

            <fieldset className="p-6 border rounded-lg bg-white shadow-sm">
              <legend className="text-lg font-bold mb-4">
                Validity of Documents
              </legend>

              <div className="flex items-center space-x-3 mb-6">
                <Checkbox
                  checked={allValidityChecked}
                  onCheckedChange={() =>
                    toggleAllCheckboxes("validityofdocument")
                  }
                />
                <label className="text-sm font-semibold">
                  Select All Validity Documents
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {Object.keys(validityValues).map((key) => (
                  <CustomFormField
                    key={key}
                    fieldType={FormFieldType.CHECKBOX}
                    control={form.control}
                    name={`validityofdocument.${key}`}
                    label={key}
                  />
                ))}
              </div>
            </fieldset>

            <Separator />

            {/* ---------------- Other Details ---------------- */}

            <fieldset className="p-6 border rounded-lg bg-white shadow-sm">
              <legend className="text-lg font-bold mb-4">Other Details</legend>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <CustomFormField
                  fieldType={FormFieldType.CHECKBOX}
                  control={form.control}
                  name="byelow"
                  label="Bye-laws"
                />
                <CustomFormField
                  fieldType={FormFieldType.CHECKBOX}
                  control={form.control}
                  name="pfregistrationupdatechalan"
                  label="PF Registration"
                />
                <CustomFormField
                  fieldType={FormFieldType.CHECKBOX}
                  control={form.control}
                  name="declaration"
                  label="Declaration"
                />
                <CustomFormField
                  fieldType={FormFieldType.CHECKBOX}
                  control={form.control}
                  name="machinary"
                  label="Machinery"
                />
                <CustomFormField
                  fieldType={FormFieldType.CHECKBOX}
                  control={form.control}
                  name="qualify"
                  label="Qualifies"
                />
              </div>

              <div className="mt-6 flex items-center space-x-3">
                <Checkbox
                  checked={allIncludedChecked}
                  onCheckedChange={(checked) => {
                    includedFieldPaths.forEach((path) =>
                      form.setValue(path, checked === true, {
                        shouldValidate: true,
                      })
                    )
                  }}
                />
                <label className="text-sm font-semibold">
                  Select All (except Bye-laws, PF Registration, Machinery)
                </label>
              </div>
            </fieldset>

            {!qualify && (
              <CustomFormField
                fieldType={FormFieldType.TEXTAREA}
                control={form.control}
                name="remarks"
                label="Remarks"
              />
            )}

            <CardFooter className="flex justify-between px-0 pt-6 gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={resetForm}
                disabled={isPending}
              >
                Reset Form
              </Button>

              <Button type="submit" disabled={isPending}>
                {isPending && (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                )}
                Submit
              </Button>
            </CardFooter>
          </form>
        </CardContent>

        {/* Confirmation Dialog (Page Mode Only) */}
        {!isDialogMode && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirm Submission</DialogTitle>
                <DialogDescription>
                  Are you sure you want to submit?
                </DialogDescription>
              </DialogHeader>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>

                <Button onClick={form.handleSubmit(onSubmit)}>
                  Confirm
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </Card>
    </Form>
  )
}
