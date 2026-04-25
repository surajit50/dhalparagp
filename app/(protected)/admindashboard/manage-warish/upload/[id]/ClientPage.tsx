"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  FileText,
  FileCheck,
  FileX2,
  UploadCloud,
  ExternalLink,
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { DocumentUpload } from "@/components/DocumentUpload";
import { Separator } from "@/components/ui/separator";

interface WarishDocument {
  id: string;
  documentType: string;
  cloudinaryUrl: string;
  createdAt: string;
  status: "uploaded" | "pending";
}

const documentTypes = [
  {
    type: "death_certificate",
    title: "Death Certificate",
    description: "Scanned copy of official death certificate",
    required: true,
    accept: "image/*,application/pdf",
  },
  {
    type: "application_form",
    title: "Application Form",
    description: "Completed and signed application form",
    required: true,
    accept: "application/pdf",
  },
  {
    type: "affidavit",
    title: "Affidavit",
    description: "Notarized affidavit document",
    required: true,
    accept: "application/pdf",
  },
  {
    type: "heir_proof",
    title: "Heir Proof",
    description: "Legal heir verification documents",
    required: true,
    accept: "application/pdf",
  },
] as const;

export default function ClientPage({ id }: { id: string }) {
  const router = useRouter();
  const [documents, setDocuments] = useState<WarishDocument[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDocuments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/warish/documents/${id}`);
      if (!response.ok) throw new Error("Failed to fetch documents");
      setDocuments(await response.json());
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load documents",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUploadComplete = async () => {
    await fetchDocuments();
    toast({
      title: "Document uploaded",
      description: "Your document has been successfully uploaded",
    });
  };

  const getDocumentStatusColor = (status: string) => {
    return status === "uploaded"
      ? "bg-green-100 text-green-800 border-green-200"
      : "bg-amber-100 text-amber-800 border-amber-200";
  };

  return (
    <div className="container max-w-5xl py-10 px-4 md:px-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.back()}
            className="h-9 w-9 rounded-full"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Document Management
            </h1>
            <p className="text-muted-foreground mt-1">
              Upload and manage required documents
            </p>
          </div>
        </div>
        <Badge variant="outline" className="px-3 py-1 text-sm">
          <span className="font-semibold mr-1">{documents.length}</span>
          <span>Documents Uploaded</span>
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {documentTypes.map((docType) => {
          const document = documents.find(
            (d) => d.documentType === docType.type,
          );
          const isUploaded = !!document;

          return (
            <Card
              key={docType.type}
              className={`overflow-hidden transition-all duration-200 ${
                isUploaded ? "border-green-200 bg-green-50/30" : ""
              }`}
            >
              <CardHeader className="pb-3 flex flex-row items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div
                      className={`p-1.5 rounded-md ${
                        isUploaded ? "bg-green-100" : "bg-muted"
                      }`}
                    >
                      {isUploaded ? (
                        <FileCheck className="h-5 w-5 text-green-600" />
                      ) : (
                        <FileText className="h-5 w-5 text-primary" />
                      )}
                    </div>
                    <CardTitle className="text-base font-semibold">
                      {docType.title}
                    </CardTitle>
                  </div>
                  <CardDescription>{docType.description}</CardDescription>
                </div>
                {docType.required && (
                  <Badge variant="destructive" className="text-xs font-medium">
                    Required
                  </Badge>
                )}
              </CardHeader>

              <CardContent className="pb-3">
                {isUploaded && (
                  <div className="flex items-center justify-between mb-4 p-2 rounded-md bg-muted/50">
                    <div className="text-xs text-muted-foreground">
                      <span className="block font-medium">Uploaded on</span>
                      {new Date(document.createdAt).toLocaleDateString(
                        undefined,
                        {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        },
                      )}
                    </div>
                    <Badge
                      variant="outline"
                      className={getDocumentStatusColor(document.status)}
                    >
                      {document.status === "uploaded" ? "Verified" : "Pending"}
                    </Badge>
                  </div>
                )}
              </CardContent>

              <CardFooter className="flex justify-between items-center pt-0">
                <DocumentUpload
                  warishId={id}
                  documentType={docType.type}
                  onUploadComplete={handleUploadComplete}
                >
                  <Button
                    variant={isUploaded ? "secondary" : "default"}
                    size="sm"
                    className="w-full"
                  >
                    {isUploaded ? (
                      <>
                        <FileCheck className="h-4 w-4 mr-2" />
                        Replace Document
                      </>
                    ) : (
                      <>
                        <UploadCloud className="h-4 w-4 mr-2" />
                        Upload Document
                      </>
                    )}
                  </Button>
                </DocumentUpload>

                {isUploaded && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      window.open(document.cloudinaryUrl, "_blank")
                    }
                    className="text-primary"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View
                  </Button>
                )}
              </CardFooter>
            </Card>
          );
        })}
      </div>

      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle>Document History</CardTitle>
          <CardDescription>
            View all documents uploaded for this application
          </CardDescription>
        </CardHeader>
        <Separator />
        <CardContent className="pt-6">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-[52px] w-full" />
              ))}
            </div>
          ) : documents.length > 0 ? (
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Document Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Upload Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documents.map((document) => (
                    <TableRow key={document.id}>
                      <TableCell className="font-medium capitalize">
                        {document.documentType.replace(/_/g, " ")}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={getDocumentStatusColor(document.status)}
                        >
                          {document.status === "uploaded"
                            ? "Verified"
                            : "Pending"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(document.createdAt).toLocaleDateString(
                          undefined,
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          },
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            window.open(document.cloudinaryUrl, "_blank")
                          }
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <Alert variant="default" className="bg-muted/50">
              <FileX2 className="h-4 w-4" />
              <AlertTitle>No documents uploaded</AlertTitle>
              <AlertDescription>
                Upload required documents using the cards above
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
