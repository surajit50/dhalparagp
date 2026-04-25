"use client"

import type React from "react"

import { useState, useEffect, useTransition } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Trash2, FileText, Search, User, FileCheck, Info, ChevronLeft, ChevronRight } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Toaster } from "@/components/ui/sonner"
import { z } from "zod"
import { createDomicileCertificateEnquiry } from "@/action/domicile-certificate-enquiry"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

// Define form steps
const FORM_STEPS = ["Header", "Applicant", "Findings", "Documents", "Final"] as const

// Verification options for Verification Source
const VERIFICATION_OPTIONS = [
  "Local Records",
  "GP Certificate",
  "Electoral Roll",
  "Aadhaar Verification",
  "Voter ID Verification",
  "Utility Bill Verification",
]

interface DomicileCertificateEnquiryFormProps {
  onSubmitted?: () => void | Promise<void>
}

const domicileCertificateEnquirySchema = z.object({
  memoNo: z.string().min(1, "Memo number is required"),
  memoDate: z.date({ required_error: "Memo date is required" }),
  letterNumber: z.string().optional(),
  letterDate: z.date().optional(),
  applicantName: z.string().min(2, "Name must be at least 2 characters"),
  applicantFatherName: z.string().min(2, "Father's/Mother's name must be at least 2 characters"),
  applicantAddress: z.string().min(10, "Address must be at least 10 characters"),
  applicantVillage: z.string().min(2, "Village/Town must be at least 2 characters"),
  applicantPostOffice: z.string().min(2, "Post office must be at least 2 characters"),
  applicantPoliceStation: z.string().min(2, "Police station must be at least 2 characters"),
  applicantDistrict: z.string().min(2, "District must be at least 2 characters"),
  applicantState: z.string().min(2, "State must be at least 2 characters"),
  enquiryFindings: z.array(
    z.object({
      serialNumber: z.number(),
      particulars: z.string().min(1, "Particulars are required"),
      details: z.string().min(1, "Details are required"),
    }),
  ),
  documentsVerified: z.array(
    z.object({
      serialNumber: z.number(),
      documentName: z.string().min(1, "Document name is required"),
      documentNumber: z.string().min(1, "Document number is required"),
      issuedAuthority: z.string().min(1, "Issued authority is required"),
    }),
  ),
  isPermanentResident: z.boolean(),
  finalRemarks: z.string().optional(),
})

type DomicileCertificateEnquiryFormData = z.infer<typeof domicileCertificateEnquirySchema>

export default function DomicileCertificateEnquiryForm({ onSubmitted }: DomicileCertificateEnquiryFormProps) {
  const [isPending, startTransition] = useTransition()
  const [formErrors, setFormErrors] = useState<string[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [enquiryData, setEnquiryData] = useState<any>(null)
  const totalSteps = FORM_STEPS.length

  const form = useForm<DomicileCertificateEnquiryFormData>({
    resolver: zodResolver(domicileCertificateEnquirySchema),
    defaultValues: {
      memoNo: "",
      memoDate: new Date(),
      letterNumber: "",
      letterDate: undefined,
      applicantName: "",
      applicantFatherName: "",
      applicantAddress: "",
      applicantVillage: "",
      applicantPostOffice: "Trimohini",
      applicantPoliceStation: "Hili",
      applicantDistrict: "Dakshin Dinajpur",
      applicantState: "West Bengal",
      // FIXED: Added 5 default findings with specified labels
      enquiryFindings: [
        { serialNumber: 1, particulars: "Applicant Name", details: "" },
        { serialNumber: 2, particulars: "Father's/Mother's Name", details: "" },
        { serialNumber: 3, particulars: "Permanent Address", details: "" },
        { serialNumber: 4, particulars: "Length of Residence", details: "" },
        {
          serialNumber: 5,
          particulars: "Verification Source",
          details: "",
        },
      ],
      documentsVerified: [
        {
          serialNumber: 1,
          documentName: "",
          documentNumber: "",
          issuedAuthority: "",
        },
      ],
      isPermanentResident: true,
      finalRemarks: "",
    },
  })

  const {
    fields: findingsFields,
    append: appendFinding,
    remove: removeFinding,
  } = useFieldArray({
    name: "enquiryFindings",
    control: form.control,
  })

  const {
    fields: docsFields,
    append: appendDoc,
    remove: removeDoc,
  } = useFieldArray({
    name: "documentsVerified",
    control: form.control,
  })

  // Document options with categories
  const documentOptions = [
    {
      category: "Government IDs",
      options: ["Aadhaar Card", "Voter ID Card", "PAN Card", "Passport", "Driving License"],
    },
    {
      category: "Address Proof",
      options: [
        "Ration Card",
        "Electricity Bill",
        "Water Bill",
        "Property Tax Receipt",
        "Lease/Rental Agreement",
        "Gas Connection Bill",
      ],
    },
    {
      category: "Financial Documents",
      options: ["Bank Passbook", "Bank Statement"],
    },
    {
      category: "Educational/Personal",
      options: [
        "Birth Certificate",
        "School Leaving Certificate",
        "Transfer Certificate",
        "Marriage Certificate",
        "Divorce Decree",
      ],
    },
    {
      category: "Property Records",
      options: ["Land Ownership Records", "Property Deed", "Mutation Certificate"],
    },
    {
      category: "Other Documents",
      options: ["Employment Certificate", "Affidavit", "Caste Certificate", "Income Certificate"],
    },
  ]

  // Authority options with categories
  const authorityOptions = [
    {
      category: "Government Departments",
      options: [
        "UIDAI",
        "Election Commission of India",
        "Income Tax Department",
        "Ministry of External Affairs",
        "Regional Transport Office (RTO)",
        "State Food & Civil Supplies Department",
      ],
    },
    {
      category: "Local Authorities",
      options: [
        "Municipal Corporation",
        "Gram Panchayat",
        "Village Office",
        "Tehsildar Office",
        "Sub-Divisional Magistrate (SDM)",
      ],
    },
    {
      category: "Utilities",
      options: ["State Electricity Board", "Water Board", "Gas Supply Company"],
    },
    {
      category: "Financial Institutions",
      options: ["Reserve Bank of India", "Public/Private Bank", "Post Office"],
    },
    {
      category: "Educational Institutions",
      options: ["School/College", "University", "Education Board"],
    },
    {
      category: "Other Authorities",
      options: [
        "Employer/Company",
        "Notary Public",
        "Judicial Magistrate",
        "Registrar of Births & Deaths",
        "Court of Law",
      ],
    },
  ]

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault() // Prevent default form submission
    e.stopPropagation() // Stop event bubbling

    // Form can only be submitted via explicit button click
  }

  const handleSubmitForm = async (data: DomicileCertificateEnquiryFormData) => {
    startTransition(async () => {
      try {
        const result = await createDomicileCertificateEnquiry(data)
        if (result.success) {
          toast.success(result.message)
          if (typeof onSubmitted === "function") {
            try {
              await onSubmitted()
            } catch {}
          }
          setEnquiryData(result.data)
        } else {
          toast.error(result.message)
          if (result.errors) {
            setFormErrors(Object.values(result.errors))
          }
        }
      } catch (error) {
        console.error("Submission error:", error)
        toast.error("Failed to submit enquiry report")
      }
    })
  }

  // Watch for form changes to clear errors
  useEffect(() => {
    const subscription = form.watch(() => setFormErrors([]))
    return () => subscription.unsubscribe()
  }, [form.watch])

  // Handle step navigation with validation
  const goToNextStep = async () => {
    const stepValidationFields: Record<number, (keyof DomicileCertificateEnquiryFormData)[]> = {
      0: ["memoNo", "memoDate"],
      1: [
        "applicantName",
        "applicantFatherName",
        "applicantAddress",
        "applicantVillage",
        "applicantPostOffice",
        "applicantPoliceStation",
        "applicantDistrict",
        "applicantState",
      ],
      2: ["enquiryFindings"],
      3: ["documentsVerified"],
      4: ["isPermanentResident"],
    }

    const fieldsToValidate = stepValidationFields[currentStep] || []

    const isValid = await form.trigger(fieldsToValidate)
    if (isValid) {
      setCurrentStep((step) => Math.min(step + 1, totalSteps - 1))
    } else {
      toast.error("Please fill in all required fields")
    }
  }

  const goToPrevStep = () => {
    setCurrentStep((step) => Math.max(step - 1, 0))
  }

  // FIX: Custom form submission handler

  const handleExplicitSubmit = async () => {
    // Only allow submission on the final step
    if (currentStep === totalSteps - 1) {
      const isValid = await form.trigger() // Validate entire form
      if (isValid) {
        const formData = form.getValues()
        await handleSubmitForm(formData)
      } else {
        toast.error("Please fill in all required fields")
      }
    }
  }

  // Step progress bar
  const StepProgress = () => (
    <div className="mb-8">
      <div className="flex justify-between mb-2">
        {FORM_STEPS.map((step, index) => (
          <div
            key={step}
            className={`text-sm font-medium ${
              index === currentStep ? "text-blue-600" : index < currentStep ? "text-green-600" : "text-gray-500"
            }`}
          >
            {step}
          </div>
        ))}
      </div>
      <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="absolute top-0 left-0 h-full bg-blue-600 transition-all duration-300 ease-in-out"
          style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
        />
      </div>
      <div className="mt-2 text-center text-sm text-gray-600">
        Step {currentStep + 1} of {totalSteps}
      </div>
    </div>
  )

  if (enquiryData) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <DomicileCertificateReport
          data={enquiryData}
          onNewEnquiry={() => {
            form.reset()
            setFormErrors([])
            setCurrentStep(0)
            setEnquiryData(null)
          }}
        />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <Toaster position="top-right" richColors expand={true} />

      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
          Domicile Certificate Enquiry Report
        </h1>
        <p className="text-gray-600 mt-3">Complete the form below to submit a domicile certificate enquiry report</p>
      </div>

      <StepProgress />

      {formErrors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="font-medium text-red-800 flex items-center gap-2">
            <Info className="h-5 w-5" />
            Please fix the following errors:
          </h3>
          <ul className="mt-2 text-sm text-red-700 list-disc pl-5 space-y-1">
            {formErrors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      <Form {...form}>
        <form
          onSubmit={handleFormSubmit}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault()
              e.stopPropagation()

              if (currentStep < totalSteps - 1) {
                goToNextStep()
              }
              // Removed the auto-submit logic for final step - user must click Submit button
            }
          }}
          className="space-y-8"
        >
          {/* Step 0: Header Information */}
          {currentStep === 0 && (
            <Card className="border-l-4 border-blue-500">
              <CardHeader className="bg-blue-50 py-4">
                <CardTitle className="flex items-center gap-3 text-blue-800">
                  <FileText className="h-6 w-6" />
                  <span>Header Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <FormField
                    control={form.control}
                    name="memoNo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-medium flex items-center">
                          Memo Number <span className="text-red-500 ml-1">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., 141/${gpcode}/2025" {...field} className="bg-gray-50" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="memoDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-medium flex items-center">
                          Memo Date <span className="text-red-500 ml-1">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            value={field.value ? field.value.toISOString().split("T")[0] : ""}
                            onChange={(e) => field.onChange(new Date(e.target.value))}
                            className="bg-gray-50"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="letterNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-medium">Letter Number</FormLabel>
                        <FormControl>
                          <Input placeholder="Reference letter number" {...field} className="bg-gray-50" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="letterDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-medium">Letter Date</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            value={field.value ? field.value.toISOString().split("T")[0] : ""}
                            onChange={(e) =>
                              e.target.value ? field.onChange(new Date(e.target.value)) : field.onChange(undefined)
                            }
                            className="bg-gray-50"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 1: Applicant Information */}
          {currentStep === 1 && (
            <Card className="border-l-4 border-green-500">
              <CardHeader className="bg-green-50 py-4">
                <CardTitle className="flex items-center gap-3 text-green-800">
                  <User className="h-6 w-6" />
                  <span>Applicant Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <FormField
                    control={form.control}
                    name="applicantName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-medium flex items-center">
                          Applicant Name <span className="text-red-500 ml-1">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Full name (min 2 characters)" {...field} className="bg-gray-50" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="applicantFatherName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-medium flex items-center">
                          Fathers/Mothers Name <span className="text-red-500 ml-1">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Father's or Mother's name (min 2 characters)"
                            {...field}
                            className="bg-gray-50"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="applicantAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-medium flex items-center">
                        Complete Address <span className="text-red-500 ml-1">*</span>
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Full residential address (min 10 characters)"
                          className="min-h-[100px] bg-gray-50"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <FormField
                    control={form.control}
                    name="applicantVillage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-medium flex items-center">
                          Village/Town <span className="text-red-500 ml-1">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Village or town name (min 2 characters)"
                            {...field}
                            className="bg-gray-50"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="applicantPostOffice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-medium flex items-center">
                          Post Office <span className="text-red-500 ml-1">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Post office name (min 2 characters)"
                            {...field}
                            className="bg-gray-100 cursor-not-allowed"
                            disabled
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="applicantPoliceStation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-medium flex items-center">
                          Police Station (P S) <span className="text-red-500 ml-1">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Police station name (min 2 characters)"
                            {...field}
                            className="bg-gray-100 cursor-not-allowed"
                            disabled
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="applicantDistrict"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-medium flex items-center">
                          District <span className="text-red-500 ml-1">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="District name (min 2 characters)"
                            {...field}
                            className="bg-gray-100 cursor-not-allowed"
                            disabled
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="applicantState"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-medium flex items-center">
                          State <span className="text-red-500 ml-1">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="State name (min 2 characters)"
                            {...field}
                            className="bg-gray-100 cursor-not-allowed"
                            disabled
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Enquiry Findings */}
          {currentStep === 2 && (
            <Card className="border-l-4 border-amber-500">
              <CardHeader className="bg-amber-50 py-4">
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-3 text-amber-800">
                    <Search className="h-6 w-6" />
                    <span>Enquiry Findings</span>
                  </CardTitle>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="bg-white border-amber-300 text-amber-700 hover:bg-amber-50"
                    onClick={() =>
                      appendFinding({
                        serialNumber: findingsFields.length + 1,
                        particulars: "",
                        details: "",
                      })
                    }
                  >
                    <Plus className="mr-2 h-4 w-4" /> Add Finding
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-5">
                {findingsFields.map((field, index) => (
                  <div key={field.id} className="border border-amber-200 bg-amber-50 p-5 rounded-lg space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="bg-amber-100 text-amber-800 rounded-full w-8 h-8 flex items-center justify-center">
                          {index + 1}
                        </div>
                        <h3 className="font-medium text-amber-800">Finding #{index + 1}</h3>
                      </div>
                      {findingsFields.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="text-amber-600 hover:bg-amber-100"
                          onClick={() => removeFinding(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name={`enquiryFindings.${index}.serialNumber`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-medium">Serial Number *</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min={1}
                                {...field}
                                onChange={(e) => field.onChange(Number.parseInt(e.target.value))}
                                className="bg-white"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`enquiryFindings.${index}.particulars`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-medium">Particulars *</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                className="bg-white"
                                readOnly={index < 5} // FIXED: Make first 5 fields read-only
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`enquiryFindings.${index}.details`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-medium">Details *</FormLabel>
                            {index === 4 ? (
                              // FIXED: Multi-select for Verification Source
                              <div className="space-y-2">
                                <Select
                                  onValueChange={(value) => {
                                    const currentValues = field.value ? field.value.split(",") : []

                                    if (currentValues.includes(value)) {
                                      // Remove if already selected
                                      field.onChange(currentValues.filter((v) => v !== value).join(","))
                                    } else {
                                      // Add new value
                                      field.onChange([...currentValues, value].join(","))
                                    }
                                  }}
                                >
                                  <FormControl>
                                    <SelectTrigger className="bg-white">
                                      <SelectValue placeholder="Select verification sources" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {VERIFICATION_OPTIONS.map((option) => (
                                      <SelectItem key={option} value={option} className="flex items-center">
                                        <div className="flex items-center">
                                          <Checkbox className="mr-2" checked={field.value?.includes(option) || false} />
                                          {option}
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>

                                {/* Display selected options */}
                                {field.value && (
                                  <div className="mt-2">
                                    <p className="text-sm font-medium mb-1">Selected Sources:</p>
                                    <div className="flex flex-wrap gap-1">
                                      {field.value.split(",").map(
                                        (val, idx) =>
                                          val && (
                                            <span
                                              key={idx}
                                              className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs"
                                            >
                                              {val}
                                            </span>
                                          ),
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <FormControl>
                                <Input placeholder="Enter details" {...field} className="bg-white" />
                              </FormControl>
                            )}
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Step 3: Documents Verified */}
          {currentStep === 3 && (
            <Card className="border-l-4 border-purple-500">
              <CardHeader className="bg-purple-50 py-4">
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-3 text-purple-800">
                    <FileCheck className="h-6 w-6" />
                    <span>Documents Verified</span>
                  </CardTitle>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="bg-white border-purple-300 text-purple-700 hover:bg-purple-50"
                    onClick={() =>
                      appendDoc({
                        serialNumber: docsFields.length + 1,
                        documentName: "",
                        documentNumber: "",
                        issuedAuthority: "",
                      })
                    }
                  >
                    <Plus className="mr-2 h-4 w-4" /> Add Document
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-5">
                {docsFields.map((field, index) => (
                  <div key={field.id} className="border border-purple-200 bg-purple-50 p-5 rounded-lg space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="bg-purple-100 text-purple-800 rounded-full w-8 h-8 flex items-center justify-center">
                          {index + 1}
                        </div>
                        <h3 className="font-medium text-purple-800">Document #{index + 1}</h3>
                      </div>
                      {docsFields.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="text-purple-600 hover:bg-purple-100"
                          onClick={() => removeDoc(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name={`documentsVerified.${index}.serialNumber`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="font-medium">Serial Number *</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min={1}
                                  {...field}
                                  onChange={(e) => field.onChange(Number.parseInt(e.target.value))}
                                  className="bg-white"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`documentsVerified.${index}.documentName`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="font-medium">Document Name *</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger className="bg-white">
                                    <SelectValue placeholder="Select document type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {documentOptions.map((group) => (
                                    <div key={group.category}>
                                      <div className="px-4 py-2 text-xs text-gray-500 font-medium">
                                        {group.category}
                                      </div>
                                      {group.options.map((doc) => (
                                        <SelectItem key={doc} value={doc}>
                                          {doc}
                                        </SelectItem>
                                      ))}
                                    </div>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name={`documentsVerified.${index}.documentNumber`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="font-medium">Document Number</FormLabel>
                              <FormControl>
                                <Input placeholder="Document number (optional)" {...field} className="bg-white" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`documentsVerified.${index}.issuedAuthority`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="font-medium">Issued Authority *</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger className="bg-white">
                                    <SelectValue placeholder="Select issuing authority" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {authorityOptions.map((group) => (
                                    <div key={group.category}>
                                      <div className="px-4 py-2 text-xs text-gray-500 font-medium">
                                        {group.category}
                                      </div>
                                      {group.options.map((auth) => (
                                        <SelectItem key={auth} value={auth}>
                                          {auth}
                                        </SelectItem>
                                      ))}
                                    </div>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <div className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <h3 className="font-medium text-purple-800 flex items-center gap-2">
                    <Info className="h-5 w-5" />
                    Common Documents for Domicile Verification
                  </h3>
                  <ul className="mt-2 text-sm text-purple-700 list-disc pl-5 space-y-1">
                    <li>Aadhaar Card (UIDAI) - Most common identity address proof</li>
                    <li>Voter ID (Election Commission) - Government-issued ID</li>
                    <li>Electricity/Water Bills (Utility Provider) - Recent address proof</li>
                    <li>Property Documents (Revenue Department) - For homeowners</li>
                    <li>Rent Agreement (Property Owner) - For tenants with notarization</li>
                    <li>School Records (Educational Institution) - For minors/students</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 4: Final Report */}
          {currentStep === 4 && (
            <Card className="border-l-4 border-indigo-500">
              <CardHeader className="bg-indigo-50 py-4">
                <CardTitle className="flex items-center gap-3 text-indigo-800">
                  <FileText className="h-6 w-6" />
                  <span>Final Report</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <FormField
                  control={form.control}
                  name="isPermanentResident"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border border-indigo-200 bg-indigo-50 p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="border-indigo-300 data-[state=checked]:bg-indigo-600"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-indigo-800 font-medium">
                          Applicant is a permanent resident of the area
                        </FormLabel>
                        <p className="text-sm text-indigo-600">
                          Check this box if the applicant meets all residency requirements
                        </p>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="finalRemarks"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-medium">Final Remarks</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Additional remarks or comments"
                          className="min-h-[120px] bg-gray-50"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          )}

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row justify-between gap-4 pt-6 border-t border-gray-200">
            <div className="space-x-3">
              <Button
                type="button"
                variant="outline"
                className="border-gray-300 bg-transparent"
                onClick={() => {
                  form.reset()
                  setFormErrors([])
                  setCurrentStep(0)
                  toast.info("Form has been reset")
                }}
                disabled={isPending}
              >
                Reset Form
              </Button>

              {currentStep > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  className="border-gray-300 bg-transparent"
                  onClick={goToPrevStep}
                  disabled={isPending}
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>
              )}
            </div>

            <div>
              {currentStep < totalSteps - 1 ? (
                <Button
                  type="button"
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={goToNextStep}
                  disabled={isPending}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button
                  type="button"
                  disabled={isPending}
                  onClick={handleExplicitSubmit}
                  className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800"
                >
                  {isPending ? (
                    <span className="flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Submitting...
                    </span>
                  ) : (
                    "Submit Enquiry Report"
                  )}
                </Button>
              )}
            </div>
          </div>
        </form>
      </Form>
    </div>
  )
}

function DomicileCertificateReport({
  data,
  onNewEnquiry,
}: {
  data: any
  onNewEnquiry: () => void
}) {
  const formatDate = (date: Date | undefined) => {
    if (!date) return "N/A"
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  }

  return (
    <div id="report-print" className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Domicile Certificate Enquiry Report</h1>
        <p className="text-gray-600 mt-2">Report ID: {data.id}</p>
        <p className="text-gray-600">Generated on: {formatDate(new Date())}</p>
        <p
          className={`mt-2 font-medium ${
            data.status === "APPROVED"
              ? "text-green-600"
              : data.status === "REJECTED"
                ? "text-red-600"
                : "text-blue-600"
          }`}
        >
          Status: {data.status}
        </p>
      </div>

      {/* Header Information */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold border-b border-gray-300 pb-2 mb-4">Header Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Memo Number</p>
            <p className="font-medium">{data.memoNo}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Memo Date</p>
            <p className="font-medium">{formatDate(data.memoDate)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Letter Number</p>
            <p className="font-medium">{data.letterNumber || "N/A"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Letter Date</p>
            <p className="font-medium">{formatDate(data.letterDate)}</p>
          </div>
        </div>
      </div>

      {/* Applicant Information */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold border-b border-gray-300 pb-2 mb-4">Applicant Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Applicant Name</p>
            <p className="font-medium">{data.applicantName}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Fathers/Mothers Name</p>
            <p className="font-medium">{data.applicantFatherName}</p>
          </div>
          <div className="md:col-span-2">
            <p className="text-sm text-gray-500">Address</p>
            <p className="font-medium">{data.applicantAddress}</p>
          </div>
          <div className="md:col-span-2">
            <p className="text-sm text-gray-500">Address Details</p>
            <p className="font-medium">
              {[
                data.applicantVillage && `Vill: ${data.applicantVillage}`,
                data.applicantPostOffice && `PO: ${data.applicantPostOffice}`,
                data.applicantPoliceStation && `PS: ${data.applicantPoliceStation}`,
                data.applicantDistrict && `District: ${data.applicantDistrict}`,
                data.applicantState && `State: ${data.applicantState}`,
              ]
                .filter(Boolean)
                .join(", ")}
            </p>
          </div>
        </div>
      </div>

      {/* Enquiry Findings */}
      {data.enquiryFindings?.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold border-b border-gray-300 pb-2 mb-4">Enquiry Findings</h2>
          <div className="space-y-4">
            {data.enquiryFindings.map((finding: { particulars: string; details: string }, index: number) => (
              <div key={index} className="border border-gray-200 p-4 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Serial Number</p>
                    <p className="font-medium">{index + 1}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Particulars</p>
                    <p className="font-medium">{finding.particulars}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Details</p>
                    {finding.particulars === "Verification Source" ? (
                      <div className="flex flex-wrap gap-1">
                        {finding.details.split(",").map(
                          (source: string, idx: number) =>
                            source && (
                              <span key={idx} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                                {source}
                              </span>
                            ),
                        )}
                      </div>
                    ) : (
                      <p className="font-medium">{finding.details}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Documents Verified */}
      {data?.documentsVerified && data.documentsVerified.length > 0 && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Documents Verified</h3>
          <ul className="space-y-1">
            {data.documentsVerified.map(
              (doc: { documentName: string; documentNumber?: string; issuedAuthority: string }, index: number) => (
                <li key={index} className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>
                    {doc.documentName} {doc.documentNumber && `(${doc.documentNumber})`} - {doc.issuedAuthority}
                  </span>
                </li>
              ),
            )}
          </ul>
        </div>
      )}

      {/* Final Report */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold border-b border-gray-300 pb-2 mb-4">Final Report</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Permanent Resident Status</p>
            <p className="font-medium">{data.isPermanentResident ? "Yes" : "No"}</p>
          </div>
          <div className="md:col-span-2">
            <p className="text-sm text-gray-500">Remarks</p>
            <p className="font-medium">{data.finalRemarks || "N/A"}</p>
          </div>
        </div>
      </div>

      {/* Signature Section */}
      <div className="mt-12 border-t border-gray-300 pt-6">
        <div className="flex justify-between">
          <div>
            <p className="font-medium">Prepared By:</p>
            <p className="mt-4 border-t border-gray-500 w-48 pt-2">{data.createdByUser?.name || "N/A"}</p>
            <p className="text-sm text-gray-500">Signature</p>
          </div>
          <div className="text-right">
            <p className="font-medium">Authorized By:</p>
            <p className="mt-4 border-t border-gray-500 w-48 pt-2 inline-block">{/* Leave space for signature */}</p>
            <p className="text-sm text-gray-500">Signature</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex justify-end gap-4 print:hidden">
        <Button onClick={onNewEnquiry} variant="outline" className="border-gray-300 bg-transparent">
          New Enquiry
        </Button>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">Show Previous</Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Previous Enquiry Report</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Report Details</h3>
                <p>
                  <strong>Memo No:</strong> {data?.memoNo || "N/A"}
                </p>
                <p>
                  <strong>Date:</strong> {data?.memoDate ? new Date(data.memoDate).toLocaleDateString() : "N/A"}
                </p>
                <p>
                  <strong>Applicant:</strong> {data?.applicantName || "N/A"}
                </p>
                <p>
                  <strong>Status:</strong> {data?.isPermanentResident ? "Permanent Resident" : "Not Permanent Resident"}
                </p>
              </div>

              {data?.enquiryFindings && data.enquiryFindings.length > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Enquiry Findings</h3>
                  <div className="space-y-2">
                    {data.enquiryFindings.map((finding: { particulars: string; details: string }, index: number) => (
                      <div key={index} className="border-l-4 border-blue-500 pl-3">
                        <p>
                          <strong>{finding.particulars}:</strong> {finding.details}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {data?.documentsVerified && data.documentsVerified.length > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Documents Verified</h3>
                  <ul className="space-y-1">
                    {data.documentsVerified.map((doc: any, index: number) => (
                      <li key={index} className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>
                          {doc.documentName} {doc.documentNumber && `(${doc.documentNumber})`} - {doc.issuedAuthority}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
