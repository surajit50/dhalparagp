import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { FileText, HelpCircle, Book } from "lucide-react"

// Documents Component
function Documents() {
    const documents = [
        { title: "Getting Started Guide", description: "A comprehensive guide for new users" },
        { title: "API Documentation", description: "Detailed documentation of our API endpoints" },
        { title: "Best Practices", description: "Learn about the best practices for using our platform" },
        // Add more documents as needed
    ]

    return (
        <ScrollArea className="h-[400px]">
            {documents.map((doc, index) => (
                <Card key={index} className="mb-4">
                    <CardHeader>
                        <CardTitle className="text-lg">{doc.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>{doc.description}</p>
                    </CardContent>
                </Card>
            ))}
        </ScrollArea>
    )
}

// FAQs Component
function FAQs() {
    const faqs = [
        { question: "How do I reset my password?", answer: "You can reset your password by clicking on the 'Forgot Password' link on the login page." },
        { question: "What payment methods do you accept?", answer: "We accept credit cards, PayPal, and bank transfers." },
        { question: "How can I contact support?", answer: "You can contact our support team through the Help & Support page or by emailing support@example.com." },
        // Add more FAQs as needed
    ]

    return (
        <ScrollArea className="h-[400px]">
            {faqs.map((faq, index) => (
                <Card key={index} className="mb-4">
                    <CardHeader>
                        <CardTitle className="text-lg">{faq.question}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>{faq.answer}</p>
                    </CardContent>
                </Card>
            ))}
        </ScrollArea>
    )
}

// User Guide Component
function UserGuide() {
    const chapters = [
        { title: "Chapter 1: Introduction", content: "Welcome to our platform. This guide will help you navigate and use our services effectively." },
        { title: "Chapter 2: Getting Started", content: "Learn how to set up your account and configure your initial settings." },
        { title: "Chapter 3: Advanced Features", content: "Discover the advanced features of our platform and how to use them to maximize your productivity." },
        // Add more chapters as needed
    ]

    return (
        <ScrollArea className="h-[400px]">
            {chapters.map((chapter, index) => (
                <Card key={index} className="mb-4">
                    <CardHeader>
                        <CardTitle className="text-lg">{chapter.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>{chapter.content}</p>
                    </CardContent>
                </Card>
            ))}
        </ScrollArea>
    )
}

export default function Resources() {
    return (
        <div className="container mx-auto p-4 max-w-4xl">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl font-bold">Resources</CardTitle>
                    <CardDescription>Access helpful documents, FAQs, and user guides</CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="documents">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="documents">
                                <FileText className="w-4 h-4 mr-2" />
                                Documents
                            </TabsTrigger>
                            <TabsTrigger value="faqs">
                                <HelpCircle className="w-4 h-4 mr-2" />
                                FAQs
                            </TabsTrigger>
                            <TabsTrigger value="userguide">
                                <Book className="w-4 h-4 mr-2" />
                                User Guide
                            </TabsTrigger>
                        </TabsList>
                        <TabsContent value="documents">
                            <Documents />
                        </TabsContent>
                        <TabsContent value="faqs">
                            <FAQs />
                        </TabsContent>
                        <TabsContent value="userguide">
                            <UserGuide />
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    )
}