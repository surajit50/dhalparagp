"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { workCoverPageType } from "@/types/worksdetails";
import { Printer, Loader2 } from "lucide-react";
import { generatePDF } from "@/lib/pdf-generator";
import { formatDate, getFinancialYear } from "@/utils/utils";
import { getBase64FromUrl } from "@/utils/index";
import { getworklenthbynitno } from "@/lib/auth";
import { gpcode } from "@/constants/gpinfor";

const templatePath = "/templates/coverpage.json";

type CoverPagePDFProps = {
  workCoverPageType: workCoverPageType;
};

export default function CoverPagePrint({ workCoverPageType }: CoverPagePDFProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const fyear = workCoverPageType.completionDate
    ? getFinancialYear(workCoverPageType.completionDate)
    : "N/A";

  const cropImageToCover = async (
    dataUrl: string,
    targetWidth: number,
    targetHeight: number
  ): Promise<string> => {
    return await new Promise((resolve) => {
      const img = new window.Image();
      img.onload = () => {
        const srcW = img.width;
        const srcH = img.height;
        if (!srcW || !srcH) {
          resolve(dataUrl);
          return;
        }

        const targetRatio = targetWidth / targetHeight;
        const srcRatio = srcW / srcH;

        let sx = 0;
        let sy = 0;
        let sw = srcW;
        let sh = srcH;

        if (srcRatio > targetRatio) {
          sw = srcH * targetRatio;
          sx = (srcW - sw) / 2;
        } else if (srcRatio < targetRatio) {
          sh = srcW / targetRatio;
          sy = (srcH - sh) / 2;
        }

        const canvas = document.createElement("canvas");
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(dataUrl);
          return;
        }

        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, targetWidth, targetHeight);
        resolve(canvas.toDataURL("image/jpeg", 0.92));
      };
      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    });
  };

  // Helper to fetch image and return a proper Data URL (cropped to cover frame)
  const getSafeImageBase64 = async (
    url: string | null | undefined,
    targetWidth?: number,
    targetHeight?: number
  ): Promise<string> => {
    if (!url) return "";
    try {
      let dataUrl = (await getBase64FromUrl(url)) as string;
      // Ensure it's a full Data URL (starts with data:image/)
      if (!dataUrl.startsWith("data:image/")) {
        const response = await fetch(url);
        const mime = response.headers.get("content-type") || "image/jpeg";
        dataUrl = `data:${mime};base64,${dataUrl}`;
      }

      if (targetWidth && targetHeight) {
        return await cropImageToCover(dataUrl, targetWidth, targetHeight);
      }
      return dataUrl;
    } catch (err) {
      console.error("Failed to load image:", url, err);
      return ""; // return empty string, label will show fallback text
    }
  };

  const handleGeneratePDF = async () => {
    setIsGenerating(true);
    try {
      const nitworkcount = await getworklenthbynitno(
        workCoverPageType.nitDetails.memoNumber,
        workCoverPageType.nitDetails.id
      );

      // Get verified photos by status
      const getPhotoByStatus = (status: string) =>
        workCoverPageType.workPhotos?.find((p) => p.status === status && p.isVerified);

      const onsetPhoto = getPhotoByStatus("onset");
      const ongoingPhoto = getPhotoByStatus("ongoing");
      const completePhoto = getPhotoByStatus("complete");

      const [onsetBase64, ongoingBase64, completeBase64] = await Promise.all([
        getSafeImageBase64(onsetPhoto?.imageUrl, 580, 320),
        getSafeImageBase64(ongoingPhoto?.imageUrl, 580, 320),
        getSafeImageBase64(completePhoto?.imageUrl, 580, 320),
      ]);

      const inputs = [
        {
          field3: `Financial Year : ${fyear}`,
          fund: `Fund-${workCoverPageType.ApprovedActionPlanDetails.schemeName}`,
          watermark: workCoverPageType.workslno.toFixed(),
          workname: workCoverPageType.ApprovedActionPlanDetails.activityDescription,

          nitmemo: `${workCoverPageType.nitDetails.memoNumber}/${gpcode}/${workCoverPageType.nitDetails.memoDate.getFullYear()}`,
          nitmeodate: formatDate(workCoverPageType.nitDetails.memoDate),
          workslno: `${workCoverPageType.workslno.toFixed()} out of ${nitworkcount}`,
          workordermemo: `${workCoverPageType.AwardofContract?.workodermenonumber}/${gpcode}/${workCoverPageType.AwardofContract?.workordeermemodate.getFullYear()}`,
          workmemodate: workCoverPageType.AwardofContract?.workordeermemodate
            ? formatDate(workCoverPageType.AwardofContract.workordeermemodate)
            : "",
          agrementdetails: `${workCoverPageType.AwardofContract?.workorderdetails[0].Bidagency?.AggrementModel[0].aggrementno} Date: ${
            workCoverPageType.AwardofContract?.workorderdetails[0].Bidagency?.AggrementModel[0].aggrementdate
              ? formatDate(workCoverPageType.AwardofContract.workorderdetails[0].Bidagency.AggrementModel[0].aggrementdate)
              : ""
          }`,
          agencydetails: `${workCoverPageType.AwardofContract?.workorderdetails[0].Bidagency?.agencydetails.name} Address: ${workCoverPageType.AwardofContract?.workorderdetails[0].Bidagency?.agencydetails.contactDetails} Mobile No ${workCoverPageType.AwardofContract?.workorderdetails[0].Bidagency?.agencydetails.mobileNumber}`,

          fundetailstable: [
            [
              `₹${workCoverPageType.finalEstimateAmount.toFixed(2)}`,
              `₹${workCoverPageType.AwardofContract?.workorderdetails[0].Bidagency?.biddingAmount?.toFixed(2) || "0.00"}`,
              `₹${workCoverPageType.paymentDetails[0]?.grossBillAmount.toFixed(2) || "0.00"}`,
            ],
          ],

          paymentdetails:
            workCoverPageType.paymentDetails?.map((item) => {
              const incomeTax = item.lessIncomeTax?.incomeTaaxAmount || 0;
              const labourCess = item.lessLabourWelfareCess?.labourWelfarecessAmt || 0;
              const securityDeposit = item.securityDeposit?.securityDepositAmt || 0;
              const cgst = item.lessTdsCgst?.tdscgstAmt || 0;
              const sgst = item.lessTdsSgst?.tdsSgstAmt || 0;
              const totalgst = cgst + sgst;
              const totalDeduction = incomeTax + labourCess + securityDeposit + cgst + sgst;

              return [
                `₹${item.grossBillAmount.toFixed(2)}`,
                `₹${incomeTax.toFixed(2)}`,
                `₹${labourCess.toFixed(2)}`,
                `₹${securityDeposit.toFixed(2)}`,
                `₹${totalgst.toFixed(2)}`,
                `₹${totalDeduction.toFixed(2)}`,
                `₹${item.netAmt.toFixed(2)}`,
                item.billType || "N/A",
              ];
            }) || [],

          activitycode: workCoverPageType.ApprovedActionPlanDetails.activityCode,
          workcompletation: workCoverPageType.completionDate ? formatDate(workCoverPageType.completionDate) : "",

          // Photos – ensure we provide the Data URL (or empty string)
          photo_onset: onsetBase64,
          photo_ongoing: ongoingBase64,
          photo_complete: completeBase64,
          onset_label: onsetBase64 ? "" : "ONSET PHOTO NOT AVAILABLE",
          ongoing_label: ongoingBase64 ? "" : "ONGOING PHOTO NOT AVAILABLE",
          complete_label: completeBase64 ? "" : "COMPLETE PHOTO NOT AVAILABLE",
        },
      ];

      const pdf = await generatePDF(templatePath, inputs);
      if (!pdf || !pdf.buffer) {
        throw new Error("PDF generation failed.");
      }

      const blob = new Blob([pdf.buffer], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "work_order_certificate.pdf";
      link.click();
      URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "Work Order Certificate PDF generated successfully.",
        variant: "default",
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unknown error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      variant="outline"
      onClick={handleGeneratePDF}
      disabled={isGenerating}
      aria-label="Generate PDF"
      className="w-full transition-colors hover:bg-primary hover:text-primary-foreground"
    >
      {isGenerating ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Printer className="h-4 w-4" />
      )}
    </Button>
  );
}
