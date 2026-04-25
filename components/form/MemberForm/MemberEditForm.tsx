'use client'

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import Image from "next/image"
import { Loader2, Upload } from "lucide-react"
import { Member } from "@prisma/client"
import { useState, useEffect } from "react"
import { toast } from "@/components/ui/use-toast"
import { memberFormSchema, MemberFormData } from "@/schema/member"
import { memberFormformSections, selectOptions } from "@/constants"
import { updateMemberDetails } from "@/action/memberAction"
import { getMouzaList } from "@/action/villagemanage"
import { useRouter } from "next/navigation"

interface MemberEditFormProps {
    memberdata: Member;
}

export default function MemberEditForm({ memberdata }: MemberEditFormProps) {
    const [photoPreview, setPhotoPreview] = useState<string | null>(memberdata.photo || null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [mouzas, setMouzas] = useState<any[]>([])
    const router = useRouter()

    useEffect(() => {
        const loadMouzas = async () => {
            const data = await getMouzaList()
            setMouzas(data)
        }
        loadMouzas()
    }, [])

    const form = useForm<MemberFormData>({
        resolver: zodResolver(memberFormSchema),
        defaultValues: {
            salutation: memberdata.salutation || "",
            firstName: memberdata.firstName || "",
            middleName: memberdata.middleName || "",
            lastName: memberdata.lastName || "",
            fatherGuardianName: memberdata.fatherGuardianName || "",
            dob: memberdata.dob
                ? new Date(memberdata.dob).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).split('/').join('-')
                : "",
            gender: memberdata.gender || "",
            maritalStatus: memberdata.maritalStatus || "",
            religion: memberdata.religion || "",
            caste: memberdata.caste || "",
            eduQualification: memberdata.eduQualification || "",
            computerLiterate: memberdata.computerLiterate || "",
            motherTongue: memberdata.motherTongue || "",
            bloodGroup: memberdata.bloodGroup || "",
            contactNo: memberdata.contactNo || "",
            whatsappNo: memberdata.whatsappNo || "",
            email: memberdata.email || "",
            address: memberdata.address || "",
            village: memberdata.village || "",
            pin: memberdata.pin || "",
            postOffice: memberdata.postOffice || "",
            district: memberdata.district || "",
            policeStation: memberdata.policeStation || "",
            aadhar: memberdata.aadhar || "",
            pan: memberdata.pan || "",
            epic: memberdata.epic || "",
            profession: memberdata.profession || "",
            annualFamilyIncome: memberdata.annualFamilyIncome || "",
            mouzaIds: (memberdata as any).mouzaIds || [],
            politicalParty: (memberdata as any).politicalParty || "",
            photo: memberdata.photo || undefined,
        },
    })

    const onSubmit = async (data: MemberFormData) => {
        setIsSubmitting(true)

        try {
            const formData = new FormData()
            formData.append("memberId", memberdata.id)

            Object.entries(data).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    if (key === 'photo') {
                        if (value instanceof File) {
                            formData.append(key, value)
                        } else if (typeof value === 'string') {
                            formData.append(key, value)
                        }
                    } else if (key === 'dob' && value instanceof Date) {
                        formData.append(key, value.toISOString().split('T')[0])
                    } else if (Array.isArray(value)) {
                        formData.append(key, JSON.stringify(value))
                    } else {
                        formData.append(key, value.toString())
                    }
                }
            })

            console.log(formData)

            const result = await updateMemberDetails(formData)

            if ('error' in result) {
                throw new Error(result.error)
            }

            toast({
                title: "Success",
                description: result.success,
            })

            router.push('/admindashboard/viewmenberdetails')
        } catch (error) {
            console.error(error)
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to update member details",
                variant: "destructive",
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    const renderField = (name: keyof MemberFormData) => {
        if (name in selectOptions) {
            return (
                <Select
                    onValueChange={(value) => form.setValue(name, value)}
                    value={form.getValues(name) as string | undefined}
                >
                    <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder={`Select ${name}`} />
                        </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                        {selectOptions[name as keyof typeof selectOptions].map((option) => (
                            <SelectItem key={option} value={option}>{option}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            )
        }

        if (name === 'photo') {
            return (
                <div className="flex gap-4 items-center space-y-2">
                    <label htmlFor="photo-upload" className="w-full">
                        <div className="w-1/2 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-primary transition-colors">
                            <div className="text-center">
                                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                <span className="mt-2 block text-sm font-semibold text-gray-900">
                                    Upload a photo
                                </span>
                            </div>
                        </div>
                        <Input
                            id="photo-upload"
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            className="hidden"
                            onChange={(e) => {
                                const file = e.target.files?.[0]
                                if (file) {
                                    form.setValue('photo', file)
                                    setPhotoPreview(URL.createObjectURL(file))
                                }
                            }}
                        />
                    </label>
                    {photoPreview && (
                        <div className="relative w-40 h-40">
                            <Image
                                src={photoPreview}
                                alt="Photo preview"
                                fill
                                style={{ objectFit: 'cover' }}
                                className="rounded-md"
                            />
                        </div>
                    )}
                </div>
            )
        }

        if (name === 'dob') {
            return <Input {...form.register(name)} placeholder="DD-MM-YYYY" />
        }

        if (name === 'mouzaIds') {
            return (
                <div className="grid grid-cols-2 gap-4 border p-4 rounded-md">
                    {mouzas.map((m) => (
                        <div key={m.id} className="flex items-center space-x-2">
                            <Checkbox
                                id={`mouza-${m.id}`}
                                checked={(form.getValues('mouzaIds') as string[] || []).includes(m.id)}
                                onCheckedChange={(checked) => {
                                    const current = form.getValues('mouzaIds') as string[] || []
                                    if (checked) {
                                        form.setValue('mouzaIds', [...current, m.id])
                                    } else {
                                        form.setValue('mouzaIds', current.filter((id) => id !== m.id))
                                    }
                                }}
                            />
                            <label
                                htmlFor={`mouza-${m.id}`}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                {m.name}
                            </label>
                        </div>
                    ))}
                </div>
            )
        }

        return <Input {...form.register(name)} />
    }

    return (
        <div className="container mx-auto py-10 px-4 bg-gray-50">
            <h1 className="text-3xl font-bold text-center mb-8">Member Details Update</h1>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    {memberFormformSections.map((section) => (
                        <Card key={section.title} className="shadow-md hover:shadow-lg transition-shadow duration-300">
                            <CardHeader className="bg-primary text-primary-foreground">
                                <CardTitle className="text-xl font-bold">{section.title}</CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6">
                                {section.fields.map((field) => (
                                    <FormField
                                        key={field}
                                        control={form.control}
                                        name={field as keyof MemberFormData}
                                        render={({ field: { onChange, ...fieldProps } }) => (
                                            <FormItem className={field === 'address' || field === 'photo' ? 'col-span-full' : ''}>
                                                <FormLabel className="font-medium">{field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1').trim()}</FormLabel>
                                                <FormControl>
                                                    {renderField(field as keyof MemberFormData)}
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                ))}
                            </CardContent>
                        </Card>
                    ))}

                    <Button
                        type="submit"
                        className="w-full bg-primary hover:bg-primary-dark text-primary-foreground font-bold py-3 px-4 rounded-lg text-lg transition-colors duration-300"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Updating...
                            </>
                        ) : (
                            "Update"
                        )}
                    </Button>
                </form>
            </Form>
        </div>
    )
}
