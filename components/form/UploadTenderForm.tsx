"use client"

import { uploadtenderForm, uploadtenderFormType } from "@/schema/uploadtender-Schema"
import { Form } from "../ui/form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import CustomFormField, { FormFieldType } from "../CustomFormField" // Assuming this is your custom component
import { Button } from "../ui/button" // Assuming you have a button component
import "react-datepicker/dist/react-datepicker.css"
import { uploadtendernotice } from "@/action/uploadtender"
export const UploadTenderForm = () => {
    const form = useForm<uploadtenderFormType>({
        resolver: zodResolver(uploadtenderForm),
        defaultValues: {
            title: "",
            description: "",
            publishAuthority: "",
            startdate: new Date(),
            enddate: new Date(),
            documentUrl: undefined
        }
    })

    const onSubmit = async (data: uploadtenderFormType) => {
        // Handle form submission (data)
        console.log(data)
        await uploadtendernotice(data)

    }

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            const file = event.target.files[0]
            // Here, you can handle the file upload (send to server or just store in state)
            console.log(file)
            form.setValue("documentUrl", URL.createObjectURL(file)) // Example to set the file URL
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">


                    <CustomFormField
                        fieldType={FormFieldType.INPUT}
                        name="title"
                        placeholder="Enter Title"
                        label="Title"
                        control={form.control}
                    />
                    <CustomFormField
                        fieldType={FormFieldType.INPUT}
                        name="description"
                        placeholder="Enter Description"
                        label="Description"
                        control={form.control}
                    />
                    <CustomFormField
                        fieldType={FormFieldType.INPUT}
                        name="publishAuthority"
                        placeholder="Enter Published Authority"
                        label="Published Authority"
                        control={form.control}
                    />
                    <CustomFormField
                        fieldType={FormFieldType.DATE_PICKER}
                        control={form.control}
                        name="startdate"
                        label="Tender Booking Date *"
                        dateFormat="MM/dd/yyyy"
                    />
                    <CustomFormField
                        fieldType={FormFieldType.DATE_PICKER}
                        control={form.control}
                        name="enddate"
                        label="Tender Booking Date *"
                        dateFormat="MM/dd/yyyy"
                    />

                    {/* File upload for PDF */}

                </div>
                <div>
                    <label htmlFor="documentUrl" className="block text-sm font-medium text-gray-700">
                        Upload Tender Document (PDF)
                    </label>
                    <input
                        id="documentUrl"
                        type="file"
                        accept="application/pdf"
                        onChange={handleFileUpload}
                        className="mt-1"
                    />
                </div>
                <p>Only PDF file is allowed. File size must be under 2 MB</p>
                {/* Submit Button */}
                <Button >Published</Button>
            </form>
        </Form>
    )
}
