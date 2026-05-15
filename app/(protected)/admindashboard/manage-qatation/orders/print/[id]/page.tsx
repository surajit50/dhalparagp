import { db } from "@/lib/db";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PrintButton } from "../PrintButton";
import { gpaddress, gpname } from "@/constants/gpinfor";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PrintOrderPage({ params }: PageProps) {
  const { id } = await params;
  const order = await db.order.findUnique({
    where: { id },
    include: {
      agencyDetails: true,
      items: true,
      quotation: true,
    },
  });

  if (!order) {
    return (
      <div className="min-h-screen bg-muted/40 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Order Not Found</h1>
            <Button asChild>
              <Link href="/admindashboard/manage-qatation/orders">
                Back to Orders
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const supplier = order.agencyDetails || {};

  return (
    <div className="min-h-screen bg-white">
      {/* Print Controls */}
      <div className="print:hidden bg-muted/40 py-4 sticky top-0 z-10">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <Button asChild variant="outline">
              <Link href="/admindashboard/manage-qatation/orders">
                ← Back to Orders
              </Link>
            </Button>
            <div className="space-x-2">
              <PrintButton />
              <Button asChild>
                <Link href={`/orders/${id}`}>View Details</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Printable Area - A4 Size */}
      <div className="flex justify-center p-4 print:p-0">
        <div className="w-[210mm] min-h-[297mm] bg-white shadow-lg print:shadow-none border print:border-0 border-gray-200 my-8 print:my-0">
          <div className="p-10 print:p-10">
            {/* Letterhead */}
            <div className="text-center mb-8 border-b-2 border-black pb-6">
              <div className="mb-2">
                <h1 className="text-xl font-bold text-black">{gpname}</h1>
                <p className="text-sm">{gpaddress}</p>
              </div>

              <div className="flex justify-between items-start mt-6">
                <div className="text-left">
                  <p className="text-sm font-medium">Memo. No.:</p>
                  <p className="font-semibold">{order.orderNo}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">Date:</p>
                  <p className="font-semibold">
                    {order.orderDate
                      ? new Date(order.orderDate).toLocaleDateString("en-GB")
                      : ""}
                  </p>
                </div>
              </div>

              <h2 className="text-lg font-bold mt-6 underline">
                LETTER OF ACCEPTANCE CUM WORK ORDER
              </h2>
              <p className="text-sm italic">For execution of compact work</p>
            </div>

            {/* Recipient */}
            <div className="mb-6">
              <p className="font-semibold mb-2">To:</p>
              <div className="ml-4 border-l-2 border-gray-300 pl-4">
                <p className="font-semibold">{supplier.name}</p>
                <p>{supplier.contactDetails}</p>
                <p>{supplier.mobileNumber}</p>
              </div>
            </div>

            {/* Reference */}
            <div className="mb-8">
              <p className="font-semibold">Reference:</p>
              <p>
                NIT Vide Memo. No. {order.quotation.nitNo} dated{" "}
                {order.orderDate
                  ? new Date(order.orderDate).toLocaleDateString("en-GB")
                  : ""}
              </p>
              <p className="mt-2 font-semibold">
                Subject: Work Order for execution of work against the scheme
              </p>
              <p className="font-semibold text-orange-800">
                {order.quotation.workName}
              </p>
            </div>

            {/* Body Content */}
            <div className="text-justify mb-8 text-sm leading-relaxed">
              <p className="mb-3 indent-8">
                As the rate offered by you for execution of the above mentioned
                scheme under 15th CFC fund, invited vide above NIT is found to
                be the 1st lowest, also in view of the agreement executed by you
                on{" "}
                {order.orderDate
                  ? new Date(order.orderDate).toLocaleDateString("en-GB")
                  : ""}{" "}
                for accomplishing the proposed consolidated work, following are
                the stipulated terms and conditions and the work order is hereby
                issued for execution of work at the accepted rate which is 0.10%
                less than the NIT Tendered Amount.
              </p>

              <p className="mb-3 indent-8">
                Entire work will have to be completed under the effective and
                technical guidance of Nirman Sahayak of Gram Panchayat. The said
                work shall have to be completed within 30(Thirty) days from the
                date of receiving the work order.
              </p>

              <p className="indent-8">
                If the executed works are found to be of inferior quality, then
                the contractor will have to remove the same from the work site
                at his own cost. Other terms and conditions as mentioned in the
                agreement will have to follow seriously to release the payment.
              </p>
            </div>

            {/* Work Details Table */}
            <div className="mb-8 overflow-x-auto">
              <table className="w-full border-collapse border border-black text-xs">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-black p-2 w-12">Sl No.</th>
                    <th className="border border-black p-2">
                      Name of the consolidated work
                    </th>
                    <th className="border border-black p-2 w-28">
                      Tender Amount (₹)
                    </th>
                    <th className="border border-black p-2 w-28">
                      Rate accepted (₹)
                    </th>
                    <th className="border border-black p-2 w-40">
                      Deduction at source
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-black p-2 text-center">1</td>
                    <td className="border border-black p-2">
                      {order.quotation.workName}
                    </td>
                    <td className="border border-black p-2 text-right">
                      {Number(order.quotation.estimatedAmount).toLocaleString(
                        "en-IN",
                      )}
                    </td>
                    <td className="border border-black p-2 text-right">
                      {Number(order.orderAmount).toLocaleString("en-IN")}
                    </td>
                    <td className="border border-black p-2 text-center">
                      As per Govt. Norms
                    </td>
                  </tr>
                  <tr>
                    <td
                      colSpan={2}
                      className="border border-black p-2 text-right font-semibold"
                    >
                      Total
                    </td>
                    <td className="border border-black p-2 text-right font-semibold">
                      {Number(order.quotation.estimatedAmount).toLocaleString(
                        "en-IN",
                      )}
                    </td>
                    <td className="border border-black p-2 text-right font-semibold">
                      {Number(order.orderAmount).toLocaleString("en-IN")}
                    </td>
                    <td className="border border-black p-2"></td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Terms and Conditions */}
            <div className="mb-8">
              <h3 className="font-bold text-base mb-3 text-red-700 border-b pb-1">
                TERMS AND CONDITIONS:
              </h3>
              <ol className="list-decimal list-inside space-y-2 text-sm pl-2">
                <li className="pl-2">
                  <span className="font-semibold">Payment Terms:</span>{" "}
                  {order.paymentTerms || "As per government payment schedule"}
                </li>
                <li className="pl-2">
                  Work must be completed within 30 days from the date of this
                  order
                </li>
                <li className="pl-2">
                  All materials must meet government quality standards
                </li>
                <li className="pl-2">
                  Contractor is responsible for site safety and worker insurance
                </li>
                <li className="pl-2">
                  2 years warranty on all construction works
                </li>
                <li className="pl-2">
                  Delay penalty: 0.5% of contract value per day
                </li>
                <li className="pl-2">
                  All disputes subject to jurisdiction of Dakshin Dinajpur
                </li>
              </ol>

              {order.specialInstructions && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                  <p className="font-semibold text-sm">Special Instructions:</p>
                  <p className="text-sm">{order.specialInstructions}</p>
                </div>
              )}
            </div>

            {/* Signatures */}
            <div className="mt-12">
              <div className="flex justify-between">
                <div>
                  <p className="font-semibold mb-1">Contractor Signature:</p>
                  <div className="h-16 w-64 border-b border-black"></div>
                  <p className="text-xs mt-1">Name & Stamp</p>
                </div>

                <div className="text-center">
                  <p className="font-semibold">For {gpname}</p>
                  <div className="h-16 w-64 mx-auto border-b border-black mt-4"></div>
                  <p className="font-semibold mt-1">Pradhan</p>
                  <p className="text-xs">Seal & Signature</p>
                </div>
              </div>

              <div className="mt-8 text-center border-t border-gray-300 pt-4">
                <p className="font-semibold">
                  Issued under the authority of Gram Panchayat
                </p>
                <p className="text-sm">
                  Copy to: Executive Assistant, Nirman Sahayak, Secretary,
                  Concerned Sansad Member
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
