/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Eye, Download, Search, Filter, Calendar } from "lucide-react";
import { getCertificates } from "@/action/certificate-actions";
import { getStatusColor } from "@/lib/certificate";
import type { Certificate } from "@/types";
import Link from "next/link";

export default function CertificateList() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [filteredCertificates, setFilteredCertificates] = useState<
    Certificate[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    loadCertificates();
  }, []);

  useEffect(() => {
    filterAndSortCertificates();
  }, [certificates, searchTerm, statusFilter, sortBy]);

  const loadCertificates = async () => {
    try {
      const result = await getCertificates();
      if (result.success && result.data) {
        setCertificates(result.data);
      }
    } catch (error) {
      console.error("Error loading certificates:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortCertificates = () => {
    let filtered = certificates;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (cert) =>
          cert.certificateNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
          cert.ancestorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          cert.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          cert.village.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((cert) => cert.status === statusFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case "oldest":
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        case "certificate-no":
          return a.certificateNo.localeCompare(b.certificateNo);
        case "ancestor-name":
          return a.ancestorName.localeCompare(b.ancestorName);
        default:
          return 0;
      }
    });

    setFilteredCertificates(filtered);
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading certificates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Certificate Management
          </CardTitle>
          <CardDescription>
            View, download, and manage all family lineage certificates.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters and Search */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by certificate no, ancestor name, applicant, or village..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="FIELD_ENQUIRY_PENDING">
                    Enquiry Pending
                  </SelectItem>
                  <SelectItem value="APPROVAL_PENDING">
                    Approval Pending
                  </SelectItem>
                  <SelectItem value="ISSUED">Issued</SelectItem>
                  <SelectItem value="EXPIRED">Expired</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <Calendar className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="certificate-no">Certificate No</SelectItem>
                  <SelectItem value="ancestor-name">Ancestor Name</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Results Summary */}
          <div className="mb-4 text-sm text-gray-600">
            Showing {filteredCertificates.length} of {certificates.length}{" "}
            certificates
          </div>
        </CardContent>
      </Card>

      {/* Certificates Grid */}
      {filteredCertificates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCertificates.map((certificate) => (
            <Card
              key={certificate.id}
              className="hover:shadow-lg transition-shadow"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      {certificate.certificateNo}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {certificate.ancestorName}
                    </CardDescription>
                  </div>
                  <Badge className={getStatusColor(certificate.status)}>
                    {certificate.status.replace(/_/g, " ")}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm space-y-1">
                  <p>
                    <span className="font-medium">Applicant:</span>{" "}
                    {certificate.applicantName}
                  </p>
                  <p>
                    <span className="font-medium">Village:</span>{" "}
                    {certificate.village}, {certificate.district}
                  </p>
                  <p>
                    <span className="font-medium">Caste:</span>{" "}
                    {certificate.casteCategory}
                  </p>
                  {certificate.issueDate && (
                    <p>
                      <span className="font-medium">Issued:</span>{" "}
                      {new Date(certificate.issueDate).toLocaleDateString(
                        "en-IN",
                      )}
                    </p>
                  )}
                  {certificate.expiryDate && (
                    <p>
                      <span className="font-medium">Expires:</span>{" "}
                      <span
                        className={
                          new Date(certificate.expiryDate) < new Date()
                            ? "text-red-600 font-medium"
                            : "text-gray-900"
                        }
                      >
                        {new Date(certificate.expiryDate).toLocaleDateString(
                          "en-IN",
                        )}
                      </span>
                    </p>
                  )}
                </div>

                <div className="flex gap-2 pt-2">
                  <Link
                    href={`/employeedashboard/family-lineage-certificate/certificate/${certificate.id}`}
                    className="flex-1"
                  >
                    <Button variant="outline" size="sm" className="w-full">
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                  </Link>
                  {certificate.status === "ISSUED" && (
                    <Link
                      href={`/employeedashboard/family-lineage-certificate/certificate/${certificate.id}`}
                      className="flex-1"
                    >
                      <Button size="sm" className="w-full">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No certificates found
            </h3>
            <p className="text-gray-600">
              {searchTerm || statusFilter !== "all"
                ? "Try adjusting your search or filter criteria."
                : "No certificates have been created yet."}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
