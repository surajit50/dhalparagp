import Link from "next/link";
import { gpaddress, gpname } from "@/constants/gpinfor";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { db } from "@/lib/db";
import { formatDate, formatTime } from "@/lib/utils/date";
import { notFound } from "next/navigation";
import ClientActions from "./client-actions";

export default async function ViewQuotationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const quotation = await db.quotation.findUnique({
    where: { id },
    include: {
      createdBy: true,
      bids: {
        include: {
          agencyDetails: true,
        },
      },
    },
  });

  if (!quotation) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-muted/40 py-8">
      <div className="container mx-auto px-4">
        {/* Action Buttons - Hidden in print */}
        <div className="mb-6 print-hidden">
          <div className="flex justify-between items-center">
            <div>
              <Button variant="ghost" asChild>
                <Link href="/admindashboard/manage-qatation/view">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to List
                </Link>
              </Button>
            </div>
            <ClientActions quotation={quotation} />
          </div>
        </div>

        {/* Official Quotation Document */}
        <div className="print-area">
          <Card className="max-w-4xl mx-auto bg-white">
            <CardContent className="p-8">
              {/* Header */}
              <div className="text-center mb-8 border-b-2 border-gray-300 pb-6">
                <div className="flex items-center justify-center mb-4">
                  <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mr-4">
                    <span className="text-white font-bold text-xl">GP</span>
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-800">
                      {gpname}
                    </h1>
                    <p className="text-gray-600">{gpaddress}</p>
                  </div>
                </div>
                <h2 className="text-xl font-bold text-red-600 mb-2">
                  {quotation.quotationType === "WORK"
                    ? "NOTICE INVITING QUOTATION FOR WORK"
                    : quotation.quotationType === "SUPPLY"
                      ? "NOTICE INVITING QUOTATION FOR SUPPLY"
                      : "NOTICE INVITING QUOTATION FOR SALE OF ITEMS"}
                </h2>
                <p className="text-gray-700">
                  NIT/NIQ No:{" "}
                  <span className="font-semibold">{quotation.nitNo}</span>
                </p>
                <p className="text-gray-700">
                  Date:{" "}
                  <span className="font-semibold">
                    {formatDate(quotation.nitDate)}
                  </span>
                </p>
              </div>

              {/* Main Content */}
              <div className="space-y-6">
                {/* Introduction */}
                <div>
                  <p className="text-justify leading-relaxed">
                    {quotation.quotationType === "SALE"
                      ? `${gpname} invites sealed quotations from interested buyers for the sale of the following items:`
                      : `${gpname} invites sealed quotations from eligible ${
                          quotation.quotationType === "WORK"
                            ? "contractors"
                            : "suppliers"
                        } for the ${
                          quotation.quotationType === "WORK"
                            ? "execution of work"
                            : "supply of materials"
                        } as detailed below:`}
                  </p>
                </div>

                {/* Details Table */}
                <div className="border border-gray-300">
                  <table className="w-full">
                    <tbody>
                      <tr className="border-b border-gray-300">
                        <td className="p-3 font-semibold bg-gray-50 w-1/3">
                          {quotation.quotationType === "WORK"
                            ? "Name of Work"
                            : quotation.quotationType === "SUPPLY"
                              ? "Name of Material/Item"
                              : "Name of Item for Sale"}
                        </td>
                        <td className="p-3">{quotation.workName}</td>
                      </tr>
                      {quotation.quantity && (
                        <tr className="border-b border-gray-300">
                          <td className="p-3 font-semibold bg-gray-50">
                            Quantity
                          </td>
                          <td className="p-3">
                            {quotation.quantity} {quotation.unit}
                          </td>
                        </tr>
                      )}
                      <tr className="border-b border-gray-300">
                        <td className="p-3 font-semibold bg-gray-50">
                          {quotation.quotationType === "SALE"
                            ? "Reserve Price"
                            : "Estimated Amount"}
                        </td>
                        <td className="p-3">
                          ₹ {quotation.estimatedAmount.toLocaleString()}
                        </td>
                      </tr>
                      {quotation.specifications && (
                        <tr className="border-b border-gray-300">
                          <td className="p-3 font-semibold bg-gray-50">
                            Technical Specifications
                          </td>
                          <td className="p-3">{quotation.specifications}</td>
                        </tr>
                      )}
                      {quotation.itemCondition && (
                        <tr className="border-b border-gray-300">
                          <td className="p-3 font-semibold bg-gray-50">
                            Item Condition
                          </td>
                          <td className="p-3">{quotation.itemCondition}</td>
                        </tr>
                      )}
                      <tr className="border-b border-gray-300">
                        <td className="p-3 font-semibold bg-gray-50">
                          Last Date & Time for Submission
                        </td>
                        <td className="p-3">
                          {formatDate(quotation.submissionDate)} at{" "}
                          {formatTime(quotation.submissionTime)} hrs
                        </td>
                      </tr>
                      <tr className="border-b border-gray-300">
                        <td className="p-3 font-semibold bg-gray-50">
                          Date & Time of Opening
                        </td>
                        <td className="p-3">
                          {formatDate(quotation.openingDate)} at{" "}
                          {formatTime(quotation.openingTime)} hrs
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Description */}
                {quotation.description && (
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Description:</h3>
                    <p className="text-justify leading-relaxed border-l-4 border-orange-500 pl-4 bg-orange-50 p-3">
                      {quotation.description}
                    </p>
                  </div>
                )}

                {/* Eligibility Criteria */}
                {quotation.eligibilityCriteria && (
                  <div>
                    <h3 className="font-semibold text-lg mb-2">
                      Eligibility Criteria:
                    </h3>
                    <p className="text-justify leading-relaxed border-l-4 border-green-500 pl-4 bg-green-50 p-3">
                      {quotation.eligibilityCriteria}
                    </p>
                  </div>
                )}

                {/* Terms and Conditions */}
                <div>
                  <h3 className="font-semibold text-lg mb-3">
                    Terms and Conditions:
                  </h3>
                  <div className="bg-yellow-50 border border-yellow-200 p-4 rounded">
                    <ol className="list-decimal list-inside space-y-2 text-sm">
                      <li>
                        Quotations should be submitted in sealed envelope
                        clearly marked with quotation number and name of{" "}
                        {quotation.quotationType.toLowerCase()}.
                      </li>
                      <li>
                        {quotation.quotationType === "SALE"
                          ? "Payment should be made immediately after selection. Items to be lifted within 7 days."
                          : "Rates should be quoted inclusive of all taxes, duties, and charges."}
                      </li>
                      <li>
                        {quotation.quotationType === "WORK"
                          ? "Work should be completed within the stipulated time period."
                          : quotation.quotationType === "SUPPLY"
                            ? "Supply should be made within the specified delivery period."
                            : "Items are sold on 'as-is-where-is' basis without any warranty."}
                      </li>
                      <li>
                        The Gram Panchayat reserves the right to accept or
                        reject any quotation without assigning any reason.
                      </li>
                      <li>Conditional quotations will not be accepted.</li>
                      {quotation.quotationType === "SALE" && (
                        <li>
                          Interested buyers can inspect the items during office
                          hours before submitting quotations.
                        </li>
                      )}
                    </ol>
                  </div>
                </div>

                {/* Footer */}
                <div className="text-center mt-8 pt-6 border-t-2 border-gray-300">
                  <div className="flex justify-between items-end">
                    <div className="text-left">
                      <p className="text-sm text-gray-600">
                        Date: {formatDate(quotation.nitDate)}
                      </p>
                      <p className="text-sm text-gray-600">Place: {gpname}</p>
                    </div>
                    <div className="text-right">
                      <div className="border-t border-gray-400 pt-2 mt-12 w-48">
                        <p className="text-sm">Prodhan</p>
                        <p className="text-sm">{gpname}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
