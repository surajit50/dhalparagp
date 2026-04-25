"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatDate } from "@/utils/utils";
import { CheckCircle2, XCircle, QrCode, Download, ChevronLeft } from "lucide-react";
import type { CompletationCertificate } from "@/types";
import { gpcode } from "@/constants/gpinfor";
interface WorkCompletionCertificateProps {
  initialPaymentDetails: CompletationCertificate;
}

export const WorkCompletionCertificate: React.FC<
  WorkCompletionCertificateProps
> = ({ initialPaymentDetails }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [isValidated, setIsValidated] = useState(true);
  const [validationMessage, setValidationMessage] = useState("Certificate is valid");
  const [paymentDetails, setPaymentDetails] = useState<CompletationCertificate>(initialPaymentDetails);
  const router = useRouter();
  const paymentDetailsArray = initialPaymentDetails.paymentDetails || [];

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      router.push("/");
    }
  };

  const handleQRScan = async (qrData: string) => {
    try {
      const response = await fetch(`/api/validate-certificate?qr=${qrData}`);
      const data = await response.json();

      if (data.isValid) {
        setIsValidated(true);
        setValidationMessage("Certificate validated successfully");
        setPaymentDetails(data.certificateData);
      } else {
        setIsValidated(false);
        setValidationMessage("Invalid or expired certificate");
      }
    } catch (error) {
      console.error("Error validating certificate:", error);
      setIsValidated(false);
      setValidationMessage("Error validating certificate");
    }
  };

  const handleDownload = () => {
    // Implement PDF download functionality
    console.log("Downloading certificate...");
  };

  // Calculate amounts
  const getGrossBillAmount = () => {
    if (paymentDetailsArray.length === 0) return "0.00";
    if (paymentDetailsArray.length === 1) return paymentDetailsArray[0].grossBillAmount.toFixed(2);

    const amounts = paymentDetailsArray.map(p => p.grossBillAmount.toFixed(2));
    const total = paymentDetailsArray.reduce((sum, p) => sum + p.grossBillAmount, 0).toFixed(2);
    return `${amounts.join(" + ")} = ${total}`;
  };

  const getNetAmount = () => {
    if (paymentDetailsArray.length === 0) return "0.00";
    if (paymentDetailsArray.length === 1) return paymentDetailsArray[0].netAmt.toFixed(2);

    const amounts = paymentDetailsArray.map(p => p.netAmt.toFixed(2));
    const total = paymentDetailsArray.reduce((sum, p) => sum + p.netAmt, 0).toFixed(2);
    return `${amounts.join(" + ")} = ${total}`;
  };

  const getSanctionedAmount = () => {
    const amount = initialPaymentDetails.AwardofContract?.workorderdetails?.[0]?.Bidagency?.biddingAmount;
    return amount ? amount.toFixed(2) : "0.00";
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
      {/* Header with actions */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-4 flex justify-between items-center">
        <button 
          onClick={() => handleOpenChange(false)}
          className="text-white hover:bg-blue-700 p-2 rounded-full transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        
        <h1 className="text-xl font-bold text-white">Work Completion Certificate</h1>
        
    
      </div>

      {/* Validation status */}
      <div className={`p-4 flex items-center gap-3 ${isValidated ? 'bg-green-50' : 'bg-red-50'} border-b`}>
        {isValidated ? (
          <CheckCircle2 className="w-6 h-6 text-green-600" />
        ) : (
          <XCircle className="w-6 h-6 text-red-600" />
        )}
        <div>
          <p className={`font-medium ${isValidated ? 'text-green-800' : 'text-red-800'}`}>
            {validationMessage}
          </p>
          <p className="text-sm text-gray-600">
            Certificate ID: {`${initialPaymentDetails.completionDate?.getFullYear()}${initialPaymentDetails.completionDate?.getMonth()}-${
              initialPaymentDetails.AwardofContract?.workodermenonumber
            }-${initialPaymentDetails.nitDetails.memoNumber}`}
          </p>
        </div>
      </div>

      {/* Main content */}
      <div className="p-6">
        {/* Certificate header */}
        <div className="text-center mb-8 relative">
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-white px-4 text-blue-600 font-bold">
            OFFICIAL CERTIFICATE
          </div>
          <div className="border-2 border-blue-100 rounded-lg p-6 pt-8">
            <h2 className="text-2xl font-bold text-blue-800 mb-2">Work Completion Certificate</h2>
            <p className="text-gray-700">No 3 Dhalpra Gram Panchayat</p>
            <p className="text-sm text-gray-500">Trimohini, Hili, Dakshin Dinajpur</p>
          </div>
        </div>

        {/* Recipient section */}
        <div className="mb-8 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm uppercase text-gray-500 font-medium mb-2">To Whom It May Concern</p>
          <p className="text-gray-700">
            This is to certify that <span className="font-semibold text-blue-800">
              {initialPaymentDetails.AwardofContract?.workorderdetails?.[0]?.Bidagency?.agencydetails.name}
            </span>, located at{" "}
            <span className="text-gray-800">
              {initialPaymentDetails.AwardofContract?.workorderdetails?.[0]?.Bidagency?.agencydetails.contactDetails}
            </span>, has successfully completed the following work:
          </p>
        </div>

        {/* Work details */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <h3 className="font-semibold text-blue-700 mb-3 flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              Work Information
            </h3>
            <dl className="space-y-3">
              <div className="flex justify-between">
                <dt className="text-gray-600">Work Name:</dt>
                <dd className="font-medium text-gray-800">
                  {initialPaymentDetails.ApprovedActionPlanDetails.activityDescription}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Work Order No:</dt>
                <dd className="font-medium text-gray-800">
                  {`${initialPaymentDetails.AwardofContract?.workodermenonumber}/${gpcode}/${initialPaymentDetails.AwardofContract?.workordeermemodate.getFullYear()}`}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Order Date:</dt>
                <dd className="font-medium text-gray-800">
                  {initialPaymentDetails.AwardofContract?.workordeermemodate
                    ? formatDate(initialPaymentDetails.AwardofContract?.workordeermemodate)
                    : "N/A"}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Completion Date:</dt>
                <dd className="font-medium text-gray-800">
                  {initialPaymentDetails.completionDate
                    ? formatDate(initialPaymentDetails.completionDate)
                    : "N/A"}
                </dd>
              </div>
            </dl>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <h3 className="font-semibold text-blue-700 mb-3 flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              Financial Details
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Sanctioned Amount</p>
                <p className="text-xl font-bold text-blue-800">₹{getSanctionedAmount()}</p>
              </div>
              <div className="border-t border-gray-200 pt-3">
                <p className="text-sm text-gray-500 mb-1">Gross Bill Amount</p>
                <p className="text-lg font-semibold text-gray-800">₹{getGrossBillAmount()}</p>
              </div>
              <div className="border-t border-gray-200 pt-3">
                <p className="text-sm text-gray-500 mb-1">Net Amount Payable</p>
                <p className="text-lg font-semibold text-green-600">₹{getNetAmount()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* NIT Details */}
        <div className="mb-8 p-4 bg-blue-50 rounded-lg border border-blue-100">
          <h3 className="font-semibold text-blue-700 mb-2">NIT Details</h3>
          <p className="text-sm text-gray-700">
            {`${initialPaymentDetails.nitDetails.memoNumber}/${gpcode}/${initialPaymentDetails.nitDetails.memoDate.getFullYear()} Date: ${formatDate(
              initialPaymentDetails.nitDetails.memoDate
            )} Work Sl no ${initialPaymentDetails.workslno}`}
          </p>
        </div>

        {/* Verification */}
        <div className="mb-8 p-4 bg-green-50 rounded-lg border-l-4 border-green-400">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-gray-700">
              The work has been inspected by the undersigned authorities and is found to be satisfactory 
              and in compliance with the stipulated guidelines and specifications.
            </p>
          </div>
        </div>

        

        
      </div>

      
    </div>
  );
};
