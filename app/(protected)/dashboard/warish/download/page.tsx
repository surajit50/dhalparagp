'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Award, Download, Eye, Share2 } from "lucide-react"

export default function DownloadCertificate() {
    const [selectedCertificate, setSelectedCertificate] = useState<string | undefined>()

    const certificates = [
        { id: '1', name: 'Web Development Fundamentals', date: '2023-05-15' },
        { id: '2', name: 'Advanced React Techniques', date: '2023-07-22' },
        { id: '3', name: 'UI/UX Design Principles', date: '2023-09-10' },
    ]

    const handleDownload = () => {
        // Implement download logic here
        console.log(`Downloading certificate: ${selectedCertificate}`)
    }

    const handlePreview = () => {
        // Implement preview logic here
        console.log(`Previewing certificate: ${selectedCertificate}`)
    }

    const handleShare = () => {
        // Implement share logic here
        console.log(`Sharing certificate: ${selectedCertificate}`)
    }

    return (
        <div className="container mx-auto p-4 max-w-2xl">
            <Card className="w-full">
                <CardHeader className="text-center">
                    <div className="mx-auto bg-primary-foreground p-3 rounded-full w-fit">
                        <Award className="w-8 h-8 text-primary" />
                    </div>
                    <CardTitle className="text-2xl font-bold mt-4">Download Your Certificate</CardTitle>
                    <CardDescription>Select and download your earned certificates</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <Select onValueChange={setSelectedCertificate}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a certificate" />
                            </SelectTrigger>
                            <SelectContent>
                                {certificates.map((cert) => (
                                    <SelectItem key={cert.id} value={cert.id}>
                                        {cert.name} - Completed on {new Date(cert.date).toLocaleDateString()}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {selectedCertificate && (
                            <div className="bg-muted p-4 rounded-lg">
                                <h3 className="font-semibold mb-2">Certificate Preview</h3>
                                <p className="text-sm text-muted-foreground">
                                    This is a placeholder for the certificate preview. In a real application,
                                    you would display a thumbnail or summary of the selected certificate here.
                                </p>
                            </div>
                        )}
                    </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                    <Button variant="outline" onClick={handlePreview} disabled={!selectedCertificate}>
                        <Eye className="w-4 h-4 mr-2" />
                        Preview
                    </Button>
                    <Button onClick={handleDownload} disabled={!selectedCertificate}>
                        <Download className="w-4 h-4 mr-2" />
                        Download
                    </Button>
                    <Button variant="secondary" onClick={handleShare} disabled={!selectedCertificate}>
                        <Share2 className="w-4 h-4 mr-2" />
                        Share
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}