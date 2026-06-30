"use client";

import { format } from "date-fns";
import { Printer, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface PrintReturnClientProps {
  order: any;
  gpProfile: any;
  returnedItems: any[];
}

export function PrintReturnClient({
  order,
  gpProfile,
  returnedItems,
}: PrintReturnClientProps) {
  const returnDate = returnedItems.length > 0 
    ? format(new Date(returnedItems[0].createdAt), "dd.MM.yyyy")
    : format(new Date(), "dd.MM.yyyy");

  // Aggregate items in case of multiple returns of same material
  const aggregatedItems = Object.values(
    returnedItems.reduce((acc: any, curr: any) => {
      const key = curr.materialId;
      if (!acc[key]) acc[key] = { ...curr };
      else acc[key].quantity += curr.quantity;
      return acc;
    }, {})
  );

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-10 print:bg-white print:p-0">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Top buttons */}
        <div className="flex justify-between print:hidden">
          <Button variant="outline" size="sm" asChild>
            <Link href="/admindashboard/tubewell/work-orders">
              <ArrowLeft className="h-4 w-4 mr-1" /> Back
            </Link>
          </Button>

          <Button onClick={() => window.print()} className="gap-2">
            <Printer className="h-4 w-4" /> Print Return Slip
          </Button>
        </div>

        {/* Main Paper */}
        <div className="bg-white shadow-xl print:shadow-none p-8 md:p-12 print:p-4 text-[13px] leading-relaxed">
          {/* Header */}
          <div className="text-center border-b-4 border-orange-900 pb-4 mb-8">
            <h1 className="text-3xl font-extrabold text-orange-900 tracking-tight">
              {gpProfile?.gpname || "No. 3 Dhalpara Gram Panchayat"}
            </h1>
            <p className="text-sm font-semibold mt-1 text-slate-700">
              {gpProfile?.gpaddress ||
                "PO: Trimohini, Block: Hilli, District: Dakshin Dinajpur"}
            </p>
            <h2 className="mt-4 text-xl font-bold underline decoration-double">
              Materials Return Receipt
            </h2>
            <p className="text-sm font-semibold mt-1">(FOR TUBE WELL REPAIR / INSTALLATION)</p>
          </div>

          {/* Meta Information */}
          <div className="grid grid-cols-2 mb-6 text-sm bg-slate-50 p-4 border rounded-md">
            <div className="space-y-2">
              <div>
                <span className="font-bold w-24 inline-block">Work Order:</span>
                <span className="font-bold text-orange-900">
                  {order.orderNumber}
                </span>
              </div>
              <div>
                <span className="font-bold w-24 inline-block">Mechanic:</span>
                <span className="font-semibold">{order.mistri?.name}</span>
              </div>
              <div>
                <span className="font-bold w-24 inline-block">Mobile:</span>
                <span className="font-semibold">{order.mistri?.mobileNumber || "N/A"}</span>
              </div>
            </div>

            <div className="text-right space-y-2">
              <div>
                <span className="font-bold">Return Date:</span>
                <span className="ml-2 px-2 font-semibold bg-white border rounded">
                  {returnDate}
                </span>
              </div>
              <div>
                <span className="font-bold">Location:</span>
                <span className="ml-2 font-semibold">
                  {order.request?.address || "N/A"}
                </span>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <p className="mb-4 font-medium text-slate-800 text-justify">
              The following unused materials, originally issued for the above-mentioned work order, have been successfully returned by the mechanic to the Gram Panchayat stock.
            </p>

            <table className="w-full border-collapse border border-black text-sm">
              <thead className="bg-slate-200">
                <tr>
                  <th className="border border-black p-2 w-16 text-center font-bold">Sl. No.</th>
                  <th className="border border-black p-2 text-left font-bold">Material Description</th>
                  <th className="border border-black p-2 w-40 text-center font-bold">Quantity Returned</th>
                </tr>
              </thead>
              <tbody>
                {aggregatedItems.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="border border-black p-6 text-center italic text-slate-500">
                      No materials have been returned for this work order.
                    </td>
                  </tr>
                ) : (
                  aggregatedItems.map((item: any, i: number) => (
                    <tr key={i}>
                      <td className="border border-black p-2 text-center">{i + 1}</td>
                      <td className="border border-black p-2 pl-3 font-semibold">{item.material?.name}</td>
                      <td className="border border-black p-2 text-center font-bold text-rose-700 bg-rose-50">
                        {item.quantity} {item.material?.unit}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Declaration */}
          <div className="mt-8">
            <p className="text-justify font-medium text-sm leading-relaxed border p-4 bg-slate-50 rounded-md">
              I acknowledge that the materials listed above have been returned to the Gram Panchayat inventory in good condition, and the stock register has been updated accordingly.
            </p>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-2 gap-12 mt-24 text-center">
            <div>
              <p className="border-t-2 border-black pt-2 font-bold inline-block px-8">
                Signature of Mechanic
              </p>
              <p className="font-medium mt-1 text-slate-600">{order.mistri?.name}</p>
            </div>
            <div>
              <p className="border-t-2 border-black pt-2 font-bold inline-block px-8">
                Signature of Returning Officer
              </p>
              <p className="font-medium mt-1 text-slate-600">Gram Panchayat Official</p>
            </div>
          </div>
          
          <div className="mt-16 text-center">
             <p className="border-t-2 border-black pt-2 font-bold inline-block px-12">
                Pradhan
              </p>
              <p className="font-bold">{gpProfile?.gpname}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
