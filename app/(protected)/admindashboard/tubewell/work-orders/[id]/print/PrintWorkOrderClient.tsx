"use client";

import { format } from "date-fns";
import { Printer, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { TubewelWorkOrder } from "@/components/PrintTemplet/tubewel-work-order";

interface PrintWorkOrderClientProps {
  order: any;
  gpProfile: any;
  allMaterials: any[];
}

export function PrintWorkOrderClient({
  order,
  gpProfile,
  allMaterials,
}: PrintWorkOrderClientProps) {
  const issueDate = order.issueDate
    ? format(new Date(order.issueDate), "dd.MM.yyyy")
    : "................";

  // Use materials from database
  const itemsFromDb = allMaterials.map((m) => m.name || m.name);

  const midPoint = Math.ceil(itemsFromDb.length / 2);
  const leftItems = itemsFromDb.slice(0, midPoint);
  const rightItems = itemsFromDb.slice(midPoint);

  const getMaterialQty = (itemName: string) => {
    const material = order.materials?.find(
      (m: any) =>
        m.material.name.toLowerCase().includes(itemName.toLowerCase()) ||
        itemName.toLowerCase().includes(m.material.name.toLowerCase()) ||
        (m.material.name &&
          (m.material.name.toLowerCase().includes(itemName.toLowerCase()) ||
            itemName.toLowerCase().includes(m.material.name.toLowerCase()))),
    );

    if (material)
      return `${material.quantity} ${material.material.unit || "P."}`;
    return "";
  };

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-10 print:bg-white print:p-0">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Top buttons */}
        <div className="flex justify-between print:hidden">
          <Button variant="outline" size="sm" asChild>
            <Link href="/admindashboard/tubewell/work-orders">
              <ArrowLeft className="h-4 w-4 mr-1" /> Back
            </Link>
          </Button>

          <Button onClick={() => window.print()} className="gap-2">
            <Printer className="h-4 w-4" /> Print Work Order
          </Button>
          <TubewelWorkOrder
            workOrder={order}
            allMaterials={allMaterials}
            gpProfile={gpProfile}
          />
        </div>

        {/* Main Paper */}
        <div className="bg-white shadow-xl print:shadow-none p-8 print:p-4 text-[12px] leading-relaxed">
          {/* Header */}
          <div className="text-center border-b-4 border-blue-900 pb-4 mb-6">
            <h1 className="text-3xl font-extrabold text-blue-900">
              {gpProfile?.gpname || "No. 3 Dhalpara Gram Panchayat"}
            </h1>
            <p className="text-sm font-semibold mt-1">
              {gpProfile?.gpaddress ||
                "PO: Trimohini, Block: Hilli, District: Dakshin Dinajpur"}
            </p>
            <h2 className="mt-3 text-xl font-bold underline decoration-double">
              Tube well Installation / Repair Order
            </h2>
            <p className="text-sm font-semibold">(WORK ORDER FORM)</p>
          </div>

          {/* Meta */}
          <div className="grid grid-cols-2 mb-4 text-sm">
            <div>
              <span className="font-bold">Serial No. :</span>
              <span className="border-b border-dotted ml-2 px-2 font-bold text-blue-900">
                {order.orderNumber}
              </span>
            </div>

            <div className="text-right">
              <span className="font-bold">Date :</span>
              <span className="border-b border-dotted ml-2 px-2">
                {issueDate}
              </span>
            </div>
          </div>

          {/* Contractor block */}
          <div className="border p-4 mb-6 text-sm space-y-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="font-bold">Contractor / Mechanic :</span>
                <span className="border-b border-dotted ml-2 px-2 font-bold">
                  {order.mistri?.name}
                </span>
              </div>
              <div>
                <span className="font-bold">Mobile :</span>
                <span className="border-b border-dotted ml-2 px-2">
                  {order.mistri?.mobileNumber || "........"}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="font-bold">Beneficiary Name :</span>
                <span className="border-b border-dotted ml-2 px-2 font-bold">
                  {order.request?.citizenName || ""}
                </span>
              </div>
              <div>
                <span className="font-bold">Address :</span>
                <span className="border-b border-dotted ml-2 px-2">
                  {order.request?.address || ""}
                </span>
              </div>
            </div>
          </div>

          {/* Materials */}
          <div className="mb-8">
            <h4 className="font-bold mb-3 underline text-center text-lg">
              For New Tube well / Repair
            </h4>
            <div className="grid grid-cols-2 gap-6">
              {/* Left Column */}
              <div>
                <table className="w-full border text-sm">
                  <thead className="bg-slate-200">
                    <tr>
                      <th className="border">Sl.</th>
                      <th className="border">Material</th>
                      <th className="border">Quantity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leftItems.map((item, i) => (
                      <tr key={i}>
                        <td className="border text-center">{i + 1}</td>
                        <td className="border pl-2">{item}</td>
                        <td className="border text-center font-bold text-blue-900">
                          {getMaterialQty(item)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Right Column */}
              <div>
                <table className="w-full border text-sm">
                  <thead className="bg-slate-200">
                    <tr>
                      <th className="border">Sl.</th>
                      <th className="border">Material</th>
                      <th className="border">Quantity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rightItems.map((item, i) => (
                      <tr key={i}>
                        <td className="border text-center">
                          {leftItems.length + i + 1}
                        </td>
                        <td className="border pl-2">{item}</td>
                        <td className="border text-center font-bold text-blue-900">
                          {getMaterialQty(item)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Labor / Master Roll */}
          {order.masterRollEntries && order.masterRollEntries.length > 0 && (
            <div className="mb-8 pl-4 pr-4">
              <h4 className="font-bold mb-3 underline text-center text-lg">
                Labor Details (Master Roll)
              </h4>
              <table className="w-full border text-sm max-w-4xl mx-auto">
                <thead className="bg-slate-200">
                  <tr>
                    <th className="border">Sl.</th>
                    <th className="border">Work Type</th>
                    <th className="border">Quantity</th>
                    <th className="border">Rate (₹)</th>
                    <th className="border">Total (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const entry = order.masterRollEntries[0];
                    if (!entry || !entry.items) return null;
                    const rows = entry.items.filter((r: any) => r.quantity > 0);

                    return rows.map((row: any, i: number) => (
                      <tr key={i}>
                        <td className="border text-center py-1">{i + 1}</td>
                        <td className="border px-2 py-1">{row.workType}</td>
                        <td className="border text-center font-bold text-blue-900 py-1">{row.quantity}</td>
                        <td className="border text-center py-1">{row.rate.toFixed(2)}</td>
                        <td className="border text-center font-bold py-1">{row.total.toFixed(2)}</td>
                      </tr>
                    ));
                  })()}
                </tbody>
              </table>
            </div>
          )}

          {/* Pradhan */}
          <div className="grid grid-cols-2 mt-16 mb-10 text-center">
            <div></div>
            <div>
              <p className="border-t border-black pt-2 font-bold inline-block px-10">
                Pradhan
              </p>
              <p className="font-bold">{gpProfile?.gpname}</p>
            </div>
          </div>

          {/* Mistri Declaration */}
          <div className="my-10">
            <h4 className="text-center font-bold text-lg border-y py-2 mb-4">
              Declaration by Contractor / Mechanic
            </h4>
            <p className="text-justify mb-8">
              I hereby declare that the installation / repair work of the
              above-mentioned tube well has been completed by me in accordance
              with the order issued by the Gram Panchayat. The materials
              supplied have been properly utilized and the work has been
              executed satisfactorily.
            </p>
            <div className="w-64 border-t border-black pt-2 text-center">
              <p className="font-bold">Signature of Contractor / Mechanic</p>
            </div>
          </div>

          {/* Completion */}
          <h4 className="text-center font-bold text-xl border-y-2 py-2 my-6">
            Certificate of Proper Use and Completion
          </h4>

          <p className="text-justify">
            It is hereby certified that the above tube well has been installed /
            repaired by Contractor / Mechanic Shri{" "}
            <span className="font-bold">{order.mistri?.name}</span> as per
            order. The tube well has been inspected and found to be functioning
            properly, and water is coming out satisfactorily. Therefore, the
            Contractor / Mechanic is recommended for payment of the work done.
          </p>

          {/* Final Sign */}
          <div className="grid grid-cols-3 gap-12 mt-24 text-center text-sm">
            <div>
              <p className="border-t border-black pt-2 font-bold">Member</p>
            </div>
            <div>
              <p className="border-t border-black pt-2 font-bold">Pradhan</p>
            </div>
            <div>
              <p className="border-t border-black pt-2 font-bold">
                Job Assistant
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
