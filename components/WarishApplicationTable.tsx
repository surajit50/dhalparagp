'use client'

import React from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import Link from 'next/link'

import { WarishApplication } from "@prisma/client"

export default function WarishApplicationTable({ applications }: { applications: WarishApplication[] }) {
  return (
    <Table className="w-full">
      <TableHeader>
        <TableRow>
          <TableHead className="font-bold">Applicant Name</TableHead>
          <TableHead className="font-bold">Deceased Name</TableHead>
          <TableHead className="font-bold">Reporting Date</TableHead>
          <TableHead className="font-bold">Village</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {applications.map((application) => (
          <React.Fragment key={application.id}>
            <TableRow className="hover:bg-muted/50">
              <TableCell className="font-medium">{application.applicantName}</TableCell>
              <TableCell>{application.nameOfDeceased}</TableCell>
              <TableCell>{new Date(application.reportingDate).toLocaleDateString()}</TableCell>
              <TableCell>{application.villageName}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell colSpan={4} className="p-0">
                <div className="bg-muted p-4 rounded-md m-2">
                  <h3 className="text-lg font-semibold mb-4">Application Details</h3>
                  <dl className="grid grid-cols-2 gap-x-4 gap-y-2 mb-4">
                    <dt className="font-medium">Applicant Mobile:</dt>
                    <dd>{application.applicantMobileNumber}</dd>
                    <dt className="font-medium">Date of Death:</dt>
                    <dd>{new Date(application.dateOfDeath).toLocaleDateString()}</dd>
                    <dt className="font-medium">Gender:</dt>
                    <dd>{application.gender}</dd>
                    <dt className="font-medium">Marital Status:</dt>
                    <dd>{application.maritialStatus}</dd>
                    <dt className="font-medium">Fathers Name:</dt>
                    <dd>{application.fatherName}</dd>
                    <dt className="font-medium">Spouses Name:</dt>
                    <dd>{application.spouseName || 'N/A'}</dd>
                    <dt className="font-medium">Post Office:</dt>
                    <dd>{application.postOffice}</dd>
                  </dl>
                  <Button asChild>
                    <Link href={`/admindashboard/manage-warish/view/${application.id}`}>
                      View Full Details
                    </Link>
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          </React.Fragment>
        ))}
      </TableBody>
    </Table>
  )
}
