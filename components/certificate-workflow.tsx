"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, CheckCircle, XCircle, Clock, RefreshCw, FileText, AlertTriangle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

type Certificate = {
  id: string
  certificateNo: string
  ancestorName: string
  applicantName: string
  status: string
  issueDate?: string
  expiryDate?: string
  village: string
  district: string
}

type FieldEnquiry = {
  id: string
  certificateId: string
  enquiryOfficer: string
  enquiryDate: string
  findings: string
  recommendations: string
  status: string
}

type Approval = {
  id: string
  certificateId: string
  approverName: string
  designation: string
  approvalDate: string
  status: string
  comments?: string
  level: number
}

const mockCertificates: Certificate[] = [
  {
    id: "1",
    certificateNo: "FLC/2024/001",
    ancestorName: "Ram Singh",
    applicantName: "Mohan Singh",
    status: "FIELD_ENQUIRY_PENDING",
    village: "Rampur",
    district: "Bareilly",
  },
  {
    id: "2",
    certificateNo: "FLC/2024/002",
    ancestorName: "Shyam Lal",
    applicantName: "Raj Kumar",
    status: "APPROVAL_PENDING",
    village: "Sitapur",
    district: "Lucknow",
  },
  {
    id: "3",
    certificateNo: "FLC/2023/045",
    ancestorName: "Hari Prasad",
    applicantName: "Suresh Prasad",
    status: "ISSUED",
    issueDate: "2023-12-15",
    expiryDate: "2024-06-15",
    village: "Mathura",
    district: "Mathura",
  },
]

const getStatusColor = (status: string) => {
  switch (status) {
    case "DRAFT":
      return "bg-gray-100 text-gray-800"
    case "FIELD_ENQUIRY_PENDING":
      return "bg-yellow-100 text-yellow-800"
    case "FIELD_ENQUIRY_COMPLETED":
      return "bg-blue-100 text-blue-800"
    case "APPROVAL_PENDING":
      return "bg-orange-100 text-orange-800"
    case "APPROVED":
      return "bg-green-100 text-green-800"
    case "ISSUED":
      return "bg-green-100 text-green-800"
    case "EXPIRED":
      return "bg-red-100 text-red-800"
    case "REJECTED":
      return "bg-red-100 text-red-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case "APPROVED":
    case "ISSUED":
      return <CheckCircle className="h-4 w-4" />
    case "REJECTED":
    case "EXPIRED":
      return <XCircle className="h-4 w-4" />
    case "FIELD_ENQUIRY_PENDING":
    case "APPROVAL_PENDING":
      return <Clock className="h-4 w-4" />
    default:
      return <FileText className="h-4 w-4" />
  }
}

export default function CertificateWorkflow() {
  const [certificates] = useState<Certificate[]>(mockCertificates)
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null)
  const [enquiryData, setEnquiryData] = useState({
    findings: "",
    recommendations: "",
    witnessNames: "",
    documentsVerified: "",
  })
  const [approvalData, setApprovalData] = useState({
    comments: "",
    status: "",
  })
  const [renewalData, setRenewalData] = useState({
    reason: "",
    additionalNotes: "",
  })
  const { toast } = useToast()

  const handleFieldEnquiry = async (action: "complete" | "reject") => {
    if (!selectedCertificate) return

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: action === "complete" ? "Field Enquiry Completed" : "Field Enquiry Rejected",
        description: `Certificate ${selectedCertificate.certificateNo} has been ${action === "complete" ? "approved for next stage" : "rejected"}.`,
      })

      setEnquiryData({ findings: "", recommendations: "", witnessNames: "", documentsVerified: "" })
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleApproval = async (action: "approve" | "reject") => {
    if (!selectedCertificate) return

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: action === "approve" ? "Certificate Approved" : "Certificate Rejected",
        description: `Certificate ${selectedCertificate.certificateNo} has been ${action}d.`,
      })

      setApprovalData({ comments: "", status: "" })
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleRenewal = async () => {
    if (!selectedCertificate) return

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Renewal Initiated",
        description: `Renewal request for certificate ${selectedCertificate.certificateNo} has been submitted.`,
      })

      setRenewalData({ reason: "", additionalNotes: "" })
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    }
  }

  const isExpired = (expiryDate?: string) => {
    if (!expiryDate) return false
    return new Date(expiryDate) < new Date()
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Certificate Management Dashboard</CardTitle>
          <CardDescription>
            Manage family lineage certificates, field enquiries, approvals, and renewals.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Certificates List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Certificates
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {certificates.map((cert) => (
                <div
                  key={cert.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedCertificate?.id === cert.id ? "border-blue-500 bg-blue-50" : "hover:bg-gray-50"
                  }`}
                  onClick={() => setSelectedCertificate(cert)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{cert.certificateNo}</p>
                      <p className="text-sm text-gray-600">{cert.ancestorName}</p>
                      <p className="text-xs text-gray-500">
                        {cert.village}, {cert.district}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge className={`text-xs ${getStatusColor(cert.status)}`}>
                        {getStatusIcon(cert.status)}
                        <span className="ml-1">{cert.status.replace(/_/g, " ")}</span>
                      </Badge>
                      {cert.expiryDate && isExpired(cert.expiryDate) && (
                        <Badge variant="destructive" className="text-xs">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Expired
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Certificate Details and Actions */}
        <div className="lg:col-span-2">
          {selectedCertificate ? (
            <Tabs defaultValue="details" className="space-y-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="enquiry">Field Enquiry</TabsTrigger>
                <TabsTrigger value="approval">Approval</TabsTrigger>
                <TabsTrigger value="renewal">Renewal</TabsTrigger>
              </TabsList>

              <TabsContent value="details">
                <Card>
                  <CardHeader>
                    <CardTitle>Certificate Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">Certificate No</Label>
                        <p className="text-sm">{selectedCertificate.certificateNo}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Status</Label>
                        <Badge className={getStatusColor(selectedCertificate.status)}>
                          {selectedCertificate.status.replace(/_/g, " ")}
                        </Badge>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Ancestor Name</Label>
                        <p className="text-sm">{selectedCertificate.ancestorName}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Applicant Name</Label>
                        <p className="text-sm">{selectedCertificate.applicantName}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Village</Label>
                        <p className="text-sm">{selectedCertificate.village}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">District</Label>
                        <p className="text-sm">{selectedCertificate.district}</p>
                      </div>
                      {selectedCertificate.issueDate && (
                        <div>
                          <Label className="text-sm font-medium">Issue Date</Label>
                          <p className="text-sm">{selectedCertificate.issueDate}</p>
                        </div>
                      )}
                      {selectedCertificate.expiryDate && (
                        <div>
                          <Label className="text-sm font-medium">Expiry Date</Label>
                          <p
                            className={`text-sm ${isExpired(selectedCertificate.expiryDate) ? "text-red-600 font-medium" : ""}`}
                          >
                            {selectedCertificate.expiryDate}
                            {isExpired(selectedCertificate.expiryDate) && " (Expired)"}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="enquiry">
                <Card>
                  <CardHeader>
                    <CardTitle>Field Enquiry</CardTitle>
                    <CardDescription>Conduct field verification and record findings.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="findings">Findings *</Label>
                      <Textarea
                        id="findings"
                        value={enquiryData.findings}
                        onChange={(e) => setEnquiryData((prev) => ({ ...prev, findings: e.target.value }))}
                        placeholder="Record your findings from the field enquiry..."
                        rows={4}
                      />
                    </div>
                    <div>
                      <Label htmlFor="recommendations">Recommendations *</Label>
                      <Textarea
                        id="recommendations"
                        value={enquiryData.recommendations}
                        onChange={(e) => setEnquiryData((prev) => ({ ...prev, recommendations: e.target.value }))}
                        placeholder="Provide your recommendations..."
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label htmlFor="witnessNames">Witness Names</Label>
                      <Input
                        id="witnessNames"
                        value={enquiryData.witnessNames}
                        onChange={(e) => setEnquiryData((prev) => ({ ...prev, witnessNames: e.target.value }))}
                        placeholder="Enter witness names (comma separated)"
                      />
                    </div>
                    <div>
                      <Label htmlFor="documentsVerified">Documents Verified</Label>
                      <Input
                        id="documentsVerified"
                        value={enquiryData.documentsVerified}
                        onChange={(e) => setEnquiryData((prev) => ({ ...prev, documentsVerified: e.target.value }))}
                        placeholder="List documents verified (comma separated)"
                      />
                    </div>
                    <div className="flex gap-3">
                      <Button
                        onClick={() => handleFieldEnquiry("complete")}
                        disabled={!enquiryData.findings || !enquiryData.recommendations}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Complete Enquiry
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => handleFieldEnquiry("reject")}
                        disabled={!enquiryData.findings}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject Application
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="approval">
                <Card>
                  <CardHeader>
                    <CardTitle>Certificate Approval</CardTitle>
                    <CardDescription>Review and approve or reject the certificate application.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="approvalComments">Comments</Label>
                      <Textarea
                        id="approvalComments"
                        value={approvalData.comments}
                        onChange={(e) => setApprovalData((prev) => ({ ...prev, comments: e.target.value }))}
                        placeholder="Add any comments or notes..."
                        rows={4}
                      />
                    </div>
                    <div className="flex gap-3">
                      <Button onClick={() => handleApproval("approve")}>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve Certificate
                      </Button>
                      <Button variant="destructive" onClick={() => handleApproval("reject")}>
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject Certificate
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="renewal">
                <Card>
                  <CardHeader>
                    <CardTitle>Certificate Renewal</CardTitle>
                    <CardDescription>Renew the certificate for another 6 months validity period.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="renewalReason">Renewal Reason *</Label>
                      <Textarea
                        id="renewalReason"
                        value={renewalData.reason}
                        onChange={(e) => setRenewalData((prev) => ({ ...prev, reason: e.target.value }))}
                        placeholder="Provide reason for renewal..."
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label htmlFor="additionalNotes">Additional Notes</Label>
                      <Textarea
                        id="additionalNotes"
                        value={renewalData.additionalNotes}
                        onChange={(e) => setRenewalData((prev) => ({ ...prev, additionalNotes: e.target.value }))}
                        placeholder="Any additional information or updates..."
                        rows={3}
                      />
                    </div>
                    <Button onClick={handleRenewal} disabled={!renewalData.reason}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Submit Renewal Request
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-center">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Select a certificate to view details and manage workflow</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
