import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { AlertCircle, BookOpen, CheckCircle, Clock } from "lucide-react"

export default function CertificateGuidelines() {
    const guidelines = [
        {
            title: "Eligibility Requirements",
            content: "To be eligible for a certificate, you must complete all required courses with a minimum grade of 70% and have at least 80% attendance in live sessions.",
            icon: <CheckCircle className="h-5 w-5" />
        },
        {
            title: "Completion Timeframe",
            content: "All course requirements must be fulfilled within 6 months of the start date. Extensions may be granted in exceptional circumstances.",
            icon: <Clock className="h-5 w-5" />
        },
        {
            title: "Assessment Criteria",
            content: "Assessments include quizzes, projects, and a final exam. The final grade is calculated based on 30% quizzes, 40% projects, and 30% final exam.",
            icon: <BookOpen className="h-5 w-5" />
        },
        {
            title: "Certificate Validity",
            content: "Certificates are valid for 2 years from the date of issue. To maintain certification, you must complete 20 hours of continuing education every 2 years.",
            icon: <AlertCircle className="h-5 w-5" />
        }
    ]

    return (
        <div className="container mx-auto p-4 max-w-4xl">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl font-bold">Certificate Guidelines</CardTitle>
                    <CardDescription>
                        Important information about obtaining and maintaining your certificates
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Alert className="mb-6">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Important</AlertTitle>
                        <AlertDescription>
                            Please review these guidelines carefully to ensure you meet all requirements for certification.
                        </AlertDescription>
                    </Alert>

                    <ScrollArea className="h-[400px] rounded-md border p-4">
                        <Accordion type="single" collapsible className="w-full">
                            {guidelines.map((guideline, index) => (
                                <AccordionItem value={`item-${index}`} key={index}>
                                    <AccordionTrigger>
                                        <div className="flex items-center">
                                            {guideline.icon}
                                            <span className="ml-2">{guideline.title}</span>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent>
                                        {guideline.content}
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </ScrollArea>

                    <div className="mt-6">
                        <h3 className="text-lg font-semibold mb-2">Quick Reference</h3>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>Complete all courses with 70%+ grade</li>
                            <li>Maintain 80%+ attendance</li>
                            <li>Finish within 6 months</li>
                            <li>Renew certification every  Month & After Year End</li>
                        </ul>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}