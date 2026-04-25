"use server";

import { blockname, gpcode, gpname, nameinprodhan, gpaddress } from "@/constants/gpinfor";
import { Workorderdetails } from "@/types/tender-manage";
import { workorderforward } from "@/constants";
import { formatDate } from "@/utils/utils";
import { getworklenthbynitno } from "@/lib/auth";

import fs from "fs";
import path from "path";

/* ============================================================
   Utility: Convert Image to Base64 Data URL (PDFMe Compatible)
============================================================ */
function getBase64Image(filePath: string, mimeType = "image/png") {
  try {
    const file = fs.readFileSync(filePath);
    return `data:${mimeType};base64,${file.toString("base64")}`;
  } catch (error) {
    console.error("Error loading image:", error);
    return "";
  }
}

/* ============================================================
   Load Logo (IMPORTANT FIX)
============================================================ */
const logoBase64 = getBase64Image(
  path.join(process.cwd(), "public/images/logo.png"),
  "image/png"
);

/* ============================================================
   Convert Uploaded PDF to Base64
============================================================ */
export async function convertPdfToBase64(
  file: File,
  returnFullDataUrl: boolean = false
): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    if (!file) {
      return reject(new Error("No file provided"));
    }

    if (file.type !== "application/pdf") {
      return reject(new Error("Invalid file type. Only PDFs are allowed."));
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = () => {
      if (reader.result && typeof reader.result === "string") {
        const result = reader.result;
        resolve(returnFullDataUrl ? result : result.split(",")[1]);
      } else {
        reject(new Error("Failed to convert file to Base64"));
      }
    };

    reader.onerror = () => {
      reject(new Error("Error reading file"));
    };
  });
}

/* ============================================================
   Fetch PDF From Public & Convert to Base64
============================================================ */
export async function fetchPdfFromPublicAndConvertToBase64(
  filePath: string
): Promise<string> {
  try {
    const absolutePath = path.join(process.cwd(), "public", filePath);
    const file = fs.readFileSync(absolutePath);
    return file.toString("base64");
  } catch (error) {
    throw new Error("Error fetching or converting the file");
  }
}

/* ============================================================
   Main: Generate Work Order Certificate Input for PDF Template
============================================================ */
export async function getWorkOrderCertificateInput(
  workOrderDetails: Workorderdetails
) {
  const getNitYear = (): number => {
    const memoDate =
      workOrderDetails.Bidagency?.WorksDetail?.nitDetails?.memoDate;
    return memoDate
      ? new Date(memoDate).getFullYear()
      : new Date().getFullYear();
  };

  const workorderyear =
    workOrderDetails.awardofcontractdetails?.workordeermemodate?.getFullYear() ||
    "";

  const calculateBidPercentage = (): string => {
    const estimateAmount =
      workOrderDetails.Bidagency?.WorksDetail?.finalEstimateAmount || 0;

    const biddingAmount =
      workOrderDetails.Bidagency?.biddingAmount || 0;

    if (estimateAmount > 0 && biddingAmount > 0) {
      const percentage =
        ((estimateAmount - biddingAmount) / estimateAmount) * 100;
      return percentage.toFixed(2);
    }

    return "0.00";
  };

  const createTableData = (): string[][] => {
    const row = [
      "1",
      workOrderDetails.Bidagency?.WorksDetail?.ApprovedActionPlanDetails
        ?.activityDescription || "N/A",
      `${workOrderDetails.Bidagency?.WorksDetail?.finalEstimateAmount || 0}`,
      `${workOrderDetails.Bidagency?.biddingAmount || 0}`,
      "As per Govt. Norms and latest guideline of Govt.",
    ];

    return [row];
  };

  const nitworkcount = await getworklenthbynitno(
    workOrderDetails.Bidagency?.WorksDetail?.nitDetails?.memoNumber || 0,
    workOrderDetails.Bidagency?.WorksDetail?.nitDetailsId || ""
  );

  const bidPercentage = calculateBidPercentage();
  const table = createTableData();

  return {
    /* ================= Header Section ================= */

    refno: `${workOrderDetails.awardofcontractdetails?.workodermenonumber || ""}/${gpcode}/${workorderyear}`,

    gpname: gpname,
    gpaddress: `${gpaddress}, ${blockname}, Dakshin Dinajpur`,
    gpname2: nameinprodhan,
    gpname3: nameinprodhan,

    logo: logoBase64, // ✅ Fixed logo

    refdate:
      formatDate(
        workOrderDetails.awardofcontractdetails?.workordeermemodate
      ) || "",

    /* ================= Agency Section ================= */

    agencyname:
      workOrderDetails.Bidagency?.agencydetails?.name || "",

    agencyadd: `${
      workOrderDetails.Bidagency?.agencydetails?.contactDetails || ""
    } - ${
      workOrderDetails.Bidagency?.agencydetails?.mobileNumber || ""
    }`,

    /* ================= Work Details ================= */

    fund:
      workOrderDetails.Bidagency?.WorksDetail
        ?.ApprovedActionPlanDetails?.schemeName || "",

    worksl: `${
      workOrderDetails.Bidagency?.WorksDetail?.workslno || ""
    } out of ${nitworkcount}`,

    nitno: `${
      workOrderDetails.Bidagency?.WorksDetail?.nitDetails?.memoNumber || ""
    }/${gpcode}/${getNitYear()} ${
      workOrderDetails.Bidagency?.WorksDetail?.nitDetails?.memoDate
        ? formatDate(
            workOrderDetails.Bidagency?.WorksDetail?.nitDetails?.memoDate
          )
        : ""
    }`,

    workname: `${
      workOrderDetails.Bidagency?.WorksDetail
        ?.ApprovedActionPlanDetails?.activityDescription || ""
    }-${
      workOrderDetails.Bidagency?.WorksDetail
        ?.ApprovedActionPlanDetails?.activityCode || ""
    }`,

    /* ================= Body Section ================= */

    body1: `As the rate offered by you for execution of the above mentioned scheme under ${
      workOrderDetails.Bidagency?.WorksDetail
        ?.ApprovedActionPlanDetails?.schemeName || ""
    } fund, invited vide above NIT is found to be the 1st lowest, also in view of the agreement executed by you on ${
      formatDate(
        workOrderDetails.awardofcontractdetails?.workordeermemodate
      ) || ""
    } for accomplishing the proposed consolidated work, following are the stipulated terms and conditions and the work order is hereby issued for execution of work at the accepted rate which is ${bidPercentage}% less than the NIT Tendered Amount.`,

    body2:
      "Entire work will have to be completed under the effective and technical guidance of Nirman Sahayak of Gram Panchayat. The said work shall have to be completed within 30 (Thirty) days from the date of receiving the work order.",

    /* ================= Tables ================= */

    table: table,

    forwardtable:
      workorderforward?.map((term, i) => [
        `${i + 1}. ${term}`,
      ]) || [],
  };
}