// app/api/generate-certificate/route.ts
import { generate } from "@pdfme/generator";
import type { Template } from "@pdfme/common";
import {
  text,
  image,
  table,
  multiVariableText,
  line,
  rectangle,
  barcodes,
} from "@pdfme/schemas";
import { db } from "@/lib/db";
import { formatDate } from "@/utils/utils";
import type { NextRequest } from "next/server";
import { gpcode } from "@/constants/gpinfor";
export const runtime = "edge";

function parseDate(dateString: string | Date): Date {
  return typeof dateString === "string" ? new Date(dateString) : dateString;
}

async function loadTemplate(request: NextRequest): Promise<Template> {
  // Construct URL to the template in public directory
  const templateUrl = new URL(
    "/templates/completationcertificate.json",
    request.nextUrl.origin
  );

  const response = await fetch(templateUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch template: ${response.statusText}`);
  }

  return await response.json();
}

function formatPaymentValues(amounts: number[]): string {
  if (amounts.length === 0) return "0.00";
  if (amounts.length === 1) return amounts[0].toFixed(2);
  const formatted = amounts.map((a) => a.toFixed(2));
  const total = amounts.reduce((sum, a) => sum + a, 0).toFixed(2);
  return `${formatted.join(" + ")} = ${total}`;
}

export async function POST(request: NextRequest) {
  try {
    const { workIds } = await request.json();

    // Validate input
    if (!Array.isArray(workIds)) throw new Error("Invalid request format");
    if (workIds.length === 0) throw new Error("No work IDs provided");

    // Load template first
    const template = await loadTemplate(request);

    // Limit batch size to prevent timeouts
    const batchSize = 5;
    const limitedWorkIds = workIds.slice(0, batchSize);

    // Database query
    const allworks = await db.worksDetail.findMany({
      where: { id: { in: limitedWorkIds } },
      include: {
        AwardofContract: {
          select: {
            workodermenonumber: true,
            workordeermemodate: true,
            workorderdetails: {
              select: {
                Bidagency: {
                  select: {
                    biddingAmount: true,
                    agencydetails: {
                      select: { name: true, contactDetails: true },
                    },
                  },
                },
              },
            },
          },
        },
        nitDetails: { select: { memoNumber: true, memoDate: true } },
        ApprovedActionPlanDetails: { select: { activityDescription: true } },
        paymentDetails: {
          select: { grossBillAmount: true, netAmt: true },
          take: 10,
        },
      },
    });

    if (allworks.length === 0) throw new Error("No matching works found");

    // Data transformation
    const inputs = allworks.map((work) => {
      const primaryWorkOrder =
        work.AwardofContract?.workorderdetails?.[0]?.Bidagency;
      const agencyName =
        primaryWorkOrder?.agencydetails?.name || "Unknown Agency";
      const agencyAddress =
        primaryWorkOrder?.agencydetails?.contactDetails || "Unknown Address";

      const memoDate = work.nitDetails?.memoDate
        ? formatDate(parseDate(work.nitDetails.memoDate))
        : "N/A";

      const workOrderDate = work.AwardofContract?.workordeermemodate
        ? formatDate(parseDate(work.AwardofContract.workordeermemodate))
        : "N/A";

      const paymentDetails = work.paymentDetails || [];
      const grossTotal = paymentDetails.reduce(
        (sum, p) => sum + (p.grossBillAmount || 0),
        0
      );
      const netTotal = paymentDetails.reduce(
        (sum, p) => sum + (p.netAmt || 0),
        0
      );

      return {
        agencydetails: `This is to certify that ${agencyName}, located at ${agencyAddress}, has successfully completed:`,
        workname:
          work.ApprovedActionPlanDetails?.activityDescription || "Unnamed Work",
        nitdetails: `${work.nitDetails?.memoNumber || "N/A"}/${gpcode}/${
          work.nitDetails?.memoDate
            ? parseDate(work.nitDetails.memoDate).getFullYear()
            : "N/A"
        } Date: ${memoDate} | Sl.No: ${work.workslno || work.id}`,
        workorderno: `${
          work.AwardofContract?.workodermenonumber || "N/A"
        }/${gpcode}/${
          work.AwardofContract?.workordeermemodate
            ? parseDate(work.AwardofContract.workordeermemodate).getFullYear()
            : "N/A"
        } Date: ${workOrderDate}`,
        completationdate: work.completionDate
          ? formatDate(parseDate(work.completionDate))
          : "Not Completed",
        sanctionamt: (primaryWorkOrder?.biddingAmount || 0).toFixed(2),
        grosbillamnt: formatPaymentValues(
          paymentDetails.map((p) => p.grossBillAmount || 0)
        ),
        netbill: formatPaymentValues(paymentDetails.map((p) => p.netAmt || 0)),
        qrcode: `https://example.com/work-verification/${work.id}`,
        certificateno: `Certificate No: ${
          work.completionDate
            ? new Date(work.completionDate).getFullYear()
            : "N/A"
        }${
          work.completionDate
            ? new Date(work.completionDate).getMonth() + 1
            : ""
        }-${work.AwardofContract?.workodermenonumber || "N/A"}-${
          work.nitDetails?.memoNumber || "N/A"
        }`,
        certificatedate: `Date: ${
          work.completionDate
            ? formatDate(parseDate(work.completionDate))
            : "N/A"
        }`,
      };
    });

    // Generate PDF
    const pdf = await generate({
      template,
      inputs,
      plugins: {
        text,
        image,
        table,
        line,
        multiVariableText,
        rectangle,
        ...barcodes,
      },
    });

    // Response headers
    const remainingCount = workIds.length - limitedWorkIds.length;
    const headers: Record<string, string> = {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="completion-certificates-${Date.now()}.pdf"`,
    };

    if (remainingCount > 0) {
      headers["X-Remaining-Items"] = remainingCount.toString();
      headers["X-Batch-Complete"] = "false";
    } else {
      headers["X-Batch-Complete"] = "true";
    }

    return new Response(pdf, { headers });
  } catch (error) {
    console.error("PDF Generation Error:", error);
    return new Response(
      JSON.stringify({
        error: "PDF generation failed",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
