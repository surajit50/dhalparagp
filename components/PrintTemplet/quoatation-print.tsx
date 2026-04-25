"use client";

import { Loader2, Printer } from "lucide-react";
import { Button } from "../ui/button";
import { useState } from "react";
import { generatePDF } from "../pdfgenerator";
import type { Prisma } from "@prisma/client";
import { formatDate } from "@/utils/utils";
import { gpcode } from "@/constants/gpinfor";
// Use an existing template from public/templates
const templatePath = "/templates/quotationformat.json";

type BaseQuotation = Prisma.QuotationGetPayload<{}>;

export const QuoatationPrint = ({
  quotation,
}: {
  quotation: BaseQuotation;
}) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGeneratePDF = async () => {
    setIsGenerating(true);

    try {
      const introText =
        quotation.quotationType === "SALE"
          ? "No 3 Dhalpara Gram Panchayat invites sealed quotations from interested buyers for the sale of the following items:"
          : `No 3 Dhalpara Gram Panchayat invites sealed quotations from eligible ${
              quotation.quotationType === "WORK" ? "contractors" : "suppliers"
            } for the ${
              quotation.quotationType === "WORK"
                ? "execution of work"
                : "supply of materials"
            } as detailed below:`;

      const nitDateText = quotation.nitDate
        ? (() => {
            try {
              return formatDate(
                new Date(quotation.nitDate as unknown as string)
              );
            } catch {
              return String(quotation.nitDate);
            }
          })()
        : "";

      const submissionDateText = quotation.submissionDate
        ? (() => {
            try {
              return formatDate(
                new Date(quotation.submissionDate as unknown as string)
              );
            } catch {
              return String(quotation.submissionDate);
            }
          })()
        : "";

      const openingDateText = quotation.openingDate
        ? (() => {
            try {
              return formatDate(
                new Date(quotation.openingDate as unknown as string)
              );
            } catch {
              return String(quotation.openingDate);
            }
          })()
        : "";

      const estimatedAmountText =
        quotation.estimatedAmount !== undefined &&
        quotation.estimatedAmount !== null
          ? `${Number(quotation.estimatedAmount).toLocaleString("en-IN")}`
          : "";

      const inputs = [
        {
          // Map only fields we are confident exist in the template
          // Adjust or extend as the template evolves
          field8:
            quotation.quotationType === "WORK"
              ? "NOTICE INVITING QUOTATION FOR WORK"
              : quotation.quotationType === "SUPPLY"
              ? "NOTICE INVITING QUOTATION FOR SUPPLY"
              : "NOTICE INVITING QUOTATION FOR SALE OF ITEMS",
          field9: String(introText),
          field6: `Memo No ${String(quotation.nitNo ?? "")}/${gpcode}/2025`,
          field7: `Date ${nitDateText}`,
          field11: [
            [
              quotation.quotationType === "WORK"
                ? "Name of Work"
                : quotation.quotationType === "SUPPLY"
                ? "Name of Material/Item"
                : "Name of Item for Sale",
              String(quotation.workName ?? ""),
            ],
            ["Estimated Amount", estimatedAmountText],
            [
              "Last Date & Time for Submission",
              `${submissionDateText}${
                quotation.submissionTime
                  ? ` at ${quotation.submissionTime} hrs`
                  : ""
              }`,
            ],
            [
              "Date & Time of Opening",
              `${openingDateText}${
                quotation.openingTime ? ` at ${quotation.openingTime} hrs` : ""
              }`,
            ],
          ],

          field12: [
            [
              `1. Quotations should be submitted in sealed envelope clearly marked with quotation number and name of ${quotation.quotationType.toLowerCase()}.`,
            ],
            [
              quotation.quotationType === "SALE"
                ? "2. Payment should be made immediately after selection. Items to be lifted within 7 days."
                : "2. Rates should be quoted inclusive of all taxes, duties, and charges.",
            ],
            [
              quotation.quotationType === "WORK"
                ? "3. Work should be completed within the stipulated time period."
                : quotation.quotationType === "SUPPLY"
                ? "3. Supply should be made within the specified delivery period."
                : "3. Items are sold on 'as-is-where-is' basis without any warranty.",
            ],
            [
              "4. The Gram Panchayat reserves the right to accept or reject any quotation without assigning any reason.",
            ],
            ["5. Conditional quotations will not be accepted."],
            ...(quotation.quotationType === "SALE"
              ? [
                  [
                    "Interested buyers can inspect the items during office hours before submitting quotations.",
                  ],
                ]
              : []),
          ],
        },
      ];

      const pdf = await generatePDF(templatePath, inputs);
      const blob = new Blob([pdf], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Quotation_${quotation.nitNo}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error in PDF generation:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-4">
      <Button
        onClick={handleGeneratePDF}
        disabled={isGenerating}
        className="bg-blue-500 text-white px-4 py-2 rounded flex items-center"
        aria-busy={isGenerating}
      >
        {isGenerating ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Printer className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
};



