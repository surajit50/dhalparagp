"use client";

import { useRef, forwardRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Download, Printer, Eye, Share2 } from "lucide-react";

import PrintableCertificate from "./printable-certificate";
import { useReactToPrint, UseReactToPrintOptions } from "react-to-print";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useToast } from "./ui/use-toast";

type CertificateData = {
  certificateNo: string;
  issueDate: string;
  expiryDate: string;
  ancestorName: string;
  casteCategory: string;
  village: string;
  postOffice: string;
  block: string;
  district: string;
  state: string;
  familyTree: any[];
  issuedBy: string;
  designation: string;
  applicantName: string;
  applicantAddress: string;
};

interface CertificateDownloadProps {
  certificateData: CertificateData;
}

// Wrap PrintableCertificate with forwardRef
const PrintableCertificateWithRef = forwardRef<HTMLDivElement, CertificateData>(
  (props: CertificateData, ref) => (
    <div ref={ref}>
      <PrintableCertificate certificateData={props} />
    </div>
  )
);
PrintableCertificateWithRef.displayName = "PrintableCertificateWithRef";

const WatermarkedCertificate = forwardRef<HTMLDivElement, CertificateData>(
  (props: CertificateData, ref) => (
    <div ref={ref} className="relative">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          className="transform -rotate-45 text-[120px] text-gray-200 font-bold opacity-20 select-none"
          style={{ wordSpacing: "20px" }}
        >
          AUTHENTICATED FAMILY LINEAGE
        </div>
      </div>
      <PrintableCertificate certificateData={props} />
    </div>
  )
);
WatermarkedCertificate.displayName = "WatermarkedCertificate";

export default function CertificateDownload({
  certificateData,
}: CertificateDownloadProps) {
  const certificateRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Print functionality
  const handlePrint = useReactToPrint({
    content: () => certificateRef.current,
    documentTitle: `Family_Lineage_Certificate_${certificateData.certificateNo}`,
    pageStyle: `
      @page {
        size: A4;
        margin: 0;
      }
      @media print {
        body {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
      }
    `,
    onAfterPrint: () => {
      toast({
        title: "Print Successful",
        description: "Certificate has been sent to printer.",
      });
    },
  } as UseReactToPrintOptions);

  // Download as PDF
  const handleDownloadPDF = async () => {
    if (!certificateRef.current) return;

    try {
      toast({
        title: "Generating PDF",
        description: "Please wait while we generate your certificate...",
      });

      // Create PDF
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });
      const width = pdf.internal.pageSize.getWidth();
      const height = pdf.internal.pageSize.getHeight();

      // Create canvas
      const canvas = await html2canvas(certificateRef.current, {
        scale: 3,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");
      const imgProps = pdf.getImageProperties(imgData);
      const ratio = imgProps.width / imgProps.height;
      const pdfHeight = height;
      const pdfWidth = height * ratio;

      pdf.addImage(
        imgData,
        "PNG",
        (width - pdfWidth) / 2, // Center horizontally
        0,
        pdfWidth,
        pdfHeight
      );
      pdf.save(
        `Family_Lineage_Certificate_${certificateData.certificateNo}.pdf`
      );

      toast({
        title: "Download Successful",
        description: "Certificate PDF has been downloaded.",
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Download Failed",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Download as Image
  const handleDownloadImage = async () => {
    if (!certificateRef.current) return;

    try {
      toast({
        title: "Generating Image",
        description: "Please wait while we generate your certificate image...",
      });

      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      });

      // Create download link
      const link = document.createElement("a");
      link.download = `Family_Lineage_Certificate_${certificateData.certificateNo}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();

      toast({
        title: "Download Successful",
        description: "Certificate image has been downloaded.",
      });
    } catch (error) {
      console.error("Error generating image:", error);
      toast({
        title: "Download Failed",
        description: "Failed to generate image. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Share functionality
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Family Lineage Certificate",
          text: `Family Lineage Certificate for ${certificateData.ancestorName} - Certificate No: ${certificateData.certificateNo}`,
          url: window.location.href,
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link Copied",
        description: "Certificate link has been copied to clipboard.",
      });
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Action Buttons */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Certificate Preview & Download
          </CardTitle>
          <CardDescription>
            Preview your certificate and download or print it in various
            formats.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button
              onClick={() => handlePrint()}
              className="flex items-center gap-2"
            >
              <Printer className="h-4 w-4" />
              Print Certificate
            </Button>
            <Button
              onClick={handleDownloadPDF}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download PDF
            </Button>
            <Button
              onClick={handleDownloadImage}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download Image
            </Button>
            <Button
              onClick={handleShare}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Share2 className="h-4 w-4" />
              Share
            </Button>
          </div>
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-900 mb-2">
              Download Instructions:
            </h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>
                • <strong>Print:</strong> Direct printing with optimized layout
                for A4 paper
              </li>
              <li>
                • <strong>PDF:</strong> High-quality PDF suitable for official
                submissions
              </li>
              <li>
                • <strong>Image:</strong> PNG format for digital sharing and
                archival
              </li>
              <li>
                • <strong>Share:</strong> Share certificate link with others
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Certificate Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Certificate Preview</CardTitle>
          <CardDescription>
            This is how your certificate will appear when printed or downloaded.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
            <WatermarkedCertificate ref={certificateRef} {...certificateData} />
          </div>
        </CardContent>
      </Card>

      {/* Certificate Information */}
      <Card>
        <CardHeader>
          <CardTitle>Certificate Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="font-medium text-gray-700">Certificate Number:</p>
              <p className="text-gray-900">{certificateData.certificateNo}</p>
            </div>
            <div>
              <p className="font-medium text-gray-700">Issue Date:</p>
              <p className="text-gray-900">{certificateData.issueDate}</p>
            </div>
            <div>
              <p className="font-medium text-gray-700">Expiry Date:</p>
              <p className="text-gray-900">{certificateData.expiryDate}</p>
            </div>
            <div>
              <p className="font-medium text-gray-700">Ancestor Name:</p>
              <p className="text-gray-900">{certificateData.ancestorName}</p>
            </div>
            <div>
              <p className="font-medium text-gray-700">Applicant:</p>
              <p className="text-gray-900">{certificateData.applicantName}</p>
            </div>
            <div>
              <p className="font-medium text-gray-700">Issued By:</p>
              <p className="text-gray-900">{certificateData.issuedBy}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
