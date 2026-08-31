import React, { forwardRef } from 'react';
import { formatDate } from "@/lib/utils/date";

type Complaint = {
  id: string;
  complaintNo: string;
  status: string;
  createdAt: string;
  assignedDate: string | null;
  streetLight: {
    lightId: string;
    landmark?: string | null;
    mouza?: { mouzaName: string } | null;
  };
};

type PrintableWorkOrderProps = {
  agency: { name: string; contactDetails: string };
  complaints: Complaint[];
  printDate: string;
};

const PrintableWorkOrder = forwardRef<HTMLDivElement, PrintableWorkOrderProps>(
  ({ agency, complaints, printDate }, ref) => {
    return (
      <div ref={ref} className="p-8 bg-white text-black font-serif w-full min-h-screen">
        {/* Outer Formal Border */}
        <div className="border-[3px] border-black p-8 min-h-[90vh] flex flex-col relative">
          
          {/* Header */}
          <div className="text-center border-b-2 border-black pb-6 mb-8 relative">
            <h1 className="text-3xl font-extrabold uppercase tracking-widest text-black mb-1">
              Dhalpara Gram Panchayat
            </h1>
            <p className="text-sm font-semibold uppercase tracking-wider text-gray-800 mb-4">
              Office of the Gram Panchayat
            </p>
            
            <div className="flex justify-center">
              <h2 className="inline-block border-2 border-black px-6 py-2 text-lg font-bold uppercase tracking-widest shadow-[3px_3px_0_0_#000]">
                Official Work Order
              </h2>
            </div>
          </div>

          {/* Meta Info Section */}
          <div className="flex justify-between mb-8 items-start text-sm font-medium">
            <div className="max-w-[50%]">
              <p className="mb-1"><span className="font-bold underline">To:</span></p>
              <p className="font-bold text-base uppercase">{agency.name}</p>
              <p className="whitespace-pre-wrap mt-1 leading-relaxed">{agency.contactDetails}</p>
            </div>
            <div className="text-right border-l-2 border-black pl-4">
              <p className="mb-2"><span className="font-bold">Date of Issue:</span> {formatDate(printDate)}</p>
              <p className="mb-2"><span className="font-bold">Work Category:</span> Street Light Maintenance</p>
              <p><span className="font-bold">Total Tasks:</span> {complaints.length}</p>
            </div>
          </div>

          <div className="mb-6 text-sm leading-relaxed text-justify">
            <p>
              <span className="font-bold mr-2">Subject:</span> Authorization for repair and maintenance of street lights within the jurisdiction of Dhalpara Gram Panchayat.
            </p>
            <p className="mt-3">
              You are hereby requested to arrange the repair of the following street lights at the earliest possible convenience. Ensure that proper diagnostics and repairs are conducted. Please submit the detailed completion report along with necessary photographs for billing purposes.
            </p>
          </div>

          {/* Table */}
          <div className="flex-1">
            <table className="w-full border-collapse border border-black text-left mb-12 text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-black p-3 w-16 text-center font-bold">Sl. No.</th>
                  <th className="border border-black p-3 font-bold">Complaint No</th>
                  <th className="border border-black p-3 font-bold">Light ID / Location</th>
                  <th className="border border-black p-3 font-bold text-center">Reported Date</th>
                </tr>
              </thead>
              <tbody>
                {complaints.map((c, idx) => (
                  <tr key={c.id}>
                    <td className="border border-black p-3 text-center font-medium">{idx + 1}</td>
                    <td className="border border-black p-3 font-mono">{c.complaintNo}</td>
                    <td className="border border-black p-3">
                      <div className="font-bold">{c.streetLight?.lightId || "—"}</div>
                      <div className="text-gray-700 mt-1">
                        {c.streetLight?.mouza?.mouzaName ? `${c.streetLight.mouza.mouzaName} - ` : ""}
                        {c.streetLight?.landmark || ""}
                      </div>
                    </td>
                    <td className="border border-black p-3 text-center">{formatDate(c.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer Signatures */}
          <div className="grid grid-cols-2 gap-8 mt-auto pt-16">
            <div className="text-center">
              <div className="w-48 border-t-2 border-black border-dashed mx-auto mb-2"></div>
              <p className="font-bold text-sm uppercase">Signature of Agency</p>
              <p className="text-xs mt-1 text-gray-600">(Seal & Date)</p>
            </div>
            <div className="text-center">
              <div className="w-48 border-t-2 border-black border-dashed mx-auto mb-2"></div>
              <p className="font-bold text-sm uppercase">Pradhan / Secretary</p>
              <p className="text-xs mt-1 text-gray-600">Dhalpara Gram Panchayat</p>
            </div>
          </div>
          
        </div>
      </div>
    );
  }
);

PrintableWorkOrder.displayName = "PrintableWorkOrder";

export default PrintableWorkOrder;
