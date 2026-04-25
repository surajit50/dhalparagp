'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Mail, MessageCircle, Phone, Search } from "lucide-react"

const faqData = [
    {
        question: "How do I reset my password?",
        answer: "To reset your password, click on the 'Forgot Password' link on the login page. You'll receive an email with instructions to create a new password."
    },
    {
        question: "What payment methods do you accept?",
        answer: "We accept various payment methods including credit/debit cards, PayPal, and bank transfers. You can view all available options in your account settings."
    },
    {
        question: "How can I update my account information?",
        answer: "You can update your account information by going to your profile settings. Look for the 'Edit Profile' option to make changes to your personal details."
    },
    {
        question: "Is there a mobile app available?",
        answer: "Yes, we have mobile apps available for both iOS and Android devices. You can download them from the App Store or Google Play Store."

    },
    {
        question: "How do I cancel my subscription?",
        answer: "To cancel your subscription, go to your account settings and look for the 'Subscription' or 'Billing' section. Follow the prompts to cancel your subscription."
    }
]

export default function HelpSupport() {
    const [searchTerm, setSearchTerm] = useState('')

    const filteredFAQs = faqData.filter(faq =>
        faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="container mx-auto p-4 max-w-4xl">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl font-bold">Help & Support</CardTitle>
                    <CardDescription>Find answers to common questions or contact our support team</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search FAQs..."
                            className="pl-8"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <ScrollArea className="h-[400px] rounded-md border p-4">
                        <Accordion type="single" collapsible className="w-full">
                            {filteredFAQs.map((faq, index) => (
                                <AccordionItem value={`item-${index}`} key={index}>
                                    <AccordionTrigger>{faq.question}</AccordionTrigger>
                                    <AccordionContent>{faq.answer}</AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </ScrollArea>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4 sm:flex-row sm:justify-around sm:space-y-0">
                    <Button variant="outline">
                        <Mail className="mr-2 h-4 w-4" />
                        Email Support
                    </Button>
                    <Button variant="outline">
                        <Phone className="mr-2 h-4 w-4" />
                        Call Support
                    </Button>
                    <Button variant="outline">
                        <MessageCircle className="mr-2 h-4 w-4" />
                        Live Chat
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}