'use client'

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Member } from "@prisma/client"
import { useReactToPrint } from 'react-to-print'
import React, { useRef } from 'react'
import { Printer } from 'lucide-react'
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

import Image from "next/image"
interface MemberPageProps {
    member: Member
}

export default function MemberDetails({ member }: MemberPageProps) {
    const componentRef = useRef<HTMLDivElement>(null)
    const handlePrint = async () => {
        if (componentRef.current) {
            // Capture the component as a canvas
            const canvas = await html2canvas(componentRef.current, { scale: 2 });

            // Convert the canvas to an image
            const imgData = canvas.toDataURL('image/png');

            // Create a new PDF document with jsPDF
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'pt',
                format: 'a4',
                compress: true
            });

            // Set the image's dimensions and position it in the PDF
            const imgWidth = 595.28;  // A4 size width in pt
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            // Add the image to the PDF (you can add more pages if necessary)
            pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

            // Save the generated PDF
            pdf.save(`${member.firstName}_details.pdf`);
        }
    };

    return (
        <div className="w-full max-w-3xl mx-auto">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div className="flex-1">
                        <CardTitle className="text-2xl mb-2">Member Details</CardTitle>
                    </div>
                    <Button onClick={handlePrint} variant="outline" size="icon" title="Print Member Details">
                        <Printer className="h-4 w-4" />
                        <span className="sr-only">Print Member Details</span>
                    </Button>
                </CardHeader>
                <CardContent className="grid gap-6" ref={componentRef}>
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                        <div className="rounded-full">
                            <Image width={200} height={200} src={member.photo ?? ""} alt={member.firstName} />
                        </div>
                        <div className="text-center sm:text-left">
                            <h2 className="text-2xl font-bold">
                                {[member.salutation, member.firstName, member.middleName, member.lastName].filter(Boolean).join(' ')}
                            </h2>
                            <p className="text-sm text-muted-foreground">Member ID: {member.id}</p>
                        </div>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                        <InfoItem label="Father/Guardian" value={member.fatherGuardianName} />
                        <InfoItem label="Date of Birth" value={member.dob ? new Date(member.dob).toLocaleDateString() : ""} />
                        <InfoItem label="Gender" value={member.gender} />
                        <InfoItem label="Marital Status" value={member.maritalStatus} />
                        <InfoItem label="Religion" value={member.religion} />
                        <InfoItem label="Caste" value={member.caste} />
                        <InfoItem label="Education" value={member.eduQualification} />
                        <InfoItem label="Computer Literate" value={member.computerLiterate} />
                        <InfoItem label="Mother Tongue" value={member.motherTongue} />
                        <InfoItem label="Blood Group" value={member.bloodGroup} />
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                        <InfoItem label="Contact No" value={member.contactNo} />
                        <InfoItem label="WhatsApp No" value={member.whatsappNo} />
                        <InfoItem label="Email" value={member.email} />
                    </div>
                    <div className="grid gap-2">
                        <h3 className="font-semibold">Address</h3>
                        <p>{[member.address, member.village, member.postOffice, member.district, member.pin].filter(Boolean).join(', ')}</p>
                        <p>Police Station: {member.policeStation}</p>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                        <InfoItem label="Aadhar" value={member.aadhar} />
                        <InfoItem label="PAN" value={member.pan} />
                        <InfoItem label="EPIC" value={member.epic} />
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                        <InfoItem label="Profession" value={member.profession} />
                        <InfoItem
                            label="Annual Family Income"
                            value={member.annualFamilyIncome ? `₹${parseInt(member.annualFamilyIncome).toLocaleString('en-IN')}` : ""}
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

function InfoItem({ label, value }: { label: string; value?: string | null }) {
    return value ? (
        <div>
            <dt className="font-medium text-muted-foreground">{label}</dt>
            <dd>{value}</dd>
        </div>
    ) : null
}