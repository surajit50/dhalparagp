'use client'

import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useViewModel } from "@/hooks/multi-step-vew-model"


const formSchema = z.object({
    name: z.string().min(2, {
        message: "Name must be at least 2 characters.",
    }),
    lastname: z.string().min(2, {
        message: "Last name must be at least 2 characters.",
    }),
    phone: z.string().min(1, {
        message: "Please enter a valid phone number.",
    }),
    email: z.string().email({
        message: "Please enter a valid email address.",
    }),
    gender: z.enum(["male", "female", "other", "prefer-not-to-say"], {
        required_error: "Please select a gender.",
    }),
    passport: z.string().min(1, {
        message: "Please enter a valid passport number.",
    }),
})

type FormValues = z.infer<typeof formSchema>

const stepObject = [
    {
        id: 1,
        title: "Personal Information",
        fields: ["name", "lastname"]
    },
    {
        id: 2,
        title: "Contact Information",
        fields: ["phone", "email"]
    },
    {
        id: 3,
        title: "Other Information",
        fields: ["gender", "passport"]
    }
]

export default function UserForm() {
    const onSubmit = async (values: FormValues) => {
        console.log("Form submitted with values:", values)
        // Here you would typically send the data to your backend
    }

    const viewModel = useViewModel<FormValues>({
        schema: formSchema,
        steps: stepObject,
        initialValues: {
            name: "",
            lastname: "",
            phone: "",
            email: "",
            gender: "prefer-not-to-say",
            passport: "",
        },
        onSubmit,
    })

    const renderFormFields = (fields: string[]) => {
        return fields.map((field) => (
            <FormField
                key={field}
                control={viewModel.form.control}
                name={field as keyof FormValues}
                render={({ field: fieldProps }) => (
                    <FormItem>
                        <FormLabel>{field.charAt(0).toUpperCase() + field.slice(1)}</FormLabel>
                        <FormControl>
                            {field === "gender" ? (
                                <Select onValueChange={fieldProps.onChange} defaultValue={fieldProps.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select your gender" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="male">Male</SelectItem>
                                        <SelectItem value="female">Female</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                        <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                                    </SelectContent>
                                </Select>
                            ) : (
                                <Input placeholder={`Enter your ${field}`} {...fieldProps} />
                            )}
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        ))
    }

    return (
        <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>User Information</CardTitle>
                <CardDescription>Step {viewModel.step} of {stepObject.length}: {stepObject[viewModel.step - 1].title}</CardDescription>
            </CardHeader>
            <CardContent>
                <Progress value={viewModel.progress} className="mb-4" />
                <Form {...viewModel.form}>
                    <form onSubmit={viewModel.form.handleSubmit(onSubmit)} className="space-y-6">
                        {renderFormFields(stepObject[viewModel.step - 1].fields)}
                    </form>
                </Form>
            </CardContent>
            <CardFooter>
                <div className="flex justify-between w-full">
                    <Button
                        type="button"
                        onClick={viewModel.handlePrev}
                        disabled={viewModel.isFirstStep}
                        variant="outline"
                    >
                        Previous
                    </Button>
                    <Button
                        type="button"
                        onClick={viewModel.isLastStep ? viewModel.form.handleSubmit(onSubmit) : viewModel.handleNext}
                    >
                        {viewModel.isLastStep ? 'Submit' : 'Next'}
                    </Button>
                </div>
            </CardFooter>
        </Card>
    )
}