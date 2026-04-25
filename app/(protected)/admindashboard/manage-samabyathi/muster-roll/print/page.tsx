import { db } from "@/lib/db";
import { format } from "date-fns";
import PdfDownloadButton from "@/components/samabathy/PdfDownloadButton";

export default async function MusterRollPrintPage({
  searchParams,
}: {
  searchParams: { no?: string };
}) {
  const musterRollNo = searchParams.no;

  const data = await db.musterRoll.findMany({
    where: musterRollNo ? { musterRollNo } : undefined,
    include: { application: true },
    orderBy: { createdAt: "desc" },
  });

  const totalAmount = data.reduce((sum, item) => sum + item.allottedAmount, 0);

  return (
    <div className="bg-gray-100 min-h-screen p-8 print:p-0 print:bg-white">
      <div className="max-w-5xl mx-auto">
        {/* Print Controls - Hidden during actual print */}
        <div className="mb-4 flex justify-end print:hidden">
          <PdfDownloadButton 
            elementId="pdf-content" 
            filename={`Muster_Roll_${musterRollNo || "All"}_${format(new Date(), "dd-MM-yyyy")}.pdf`} 
          />
        </div>

        {/* Content to be converted to PDF */}
        <div id="pdf-content" className="bg-white p-12 shadow-sm font-serif text-black border-2 border-black print:border-none print:shadow-none print:p-8">
          {/* Header Section */}
          <div className="text-center mb-8 border-b-2 border-black pb-6">
            <h1 className="text-3xl font-bold uppercase tracking-wider mb-2">Gram Panchayat Office</h1>
            <h2 className="text-xl font-bold uppercase mb-4">Samabyathi Prakalpa - Muster Roll</h2>
            <div className="flex justify-between text-sm font-medium mt-6 px-4">
              <p>Generated Date: {format(new Date(), "dd/MM/yyyy")}</p>
              <p className="font-bold text-base">{musterRollNo ? `Muster Roll No: ${musterRollNo}` : "All Records"}</p>
              <p>Financial Year: 2023-2024</p>
            </div>
          </div>

          {/* Table Section */}
          <table className="w-full border-collapse border border-black text-sm mb-12">
            <thead>
              <tr className="bg-gray-100 print:bg-gray-100/50">
                <th className="border border-black p-3 text-center w-12">Sl. No.</th>
                <th className="border border-black p-3 text-left">Name of the Applicant</th>
                <th className="border border-black p-3 text-left">Name of the Deceased</th>
                <th className="border border-black p-3 text-left">Village</th>
                <th className="border border-black p-3 text-center">Amount (₹)</th>
                <th className="border border-black p-3 text-center">Date of Death</th>
                <th className="border border-black p-3 text-center w-40">Signature of Beneficiary</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr key={item.id} className="h-16">
                  <td className="border border-black p-3 text-center">{index + 1}</td>
                  <td className="border border-black p-3 font-medium">{item.application.applicantName}</td>
                  <td className="border border-black p-3">{item.application.deceasedName}</td>
                  <td className="border border-black p-3">{item.application.villageName}</td>
                  <td className="border border-black p-3 text-center font-bold">₹{item.allottedAmount}</td>
                  <td className="border border-black p-3 text-center">
                    {item.application.dateOfDeath ? format(new Date(item.application.dateOfDeath), "dd/MM/yyyy") : "-"}
                  </td>
                  <td className="border border-black p-3 text-center"></td>
                </tr>
              ))}
              {data.length === 0 && (
                <tr>
                  <td colSpan={7} className="border border-black p-6 text-center text-gray-500">
                    No records available.
                  </td>
                </tr>
              )}
              {data.length > 0 && (
                <tr className="bg-gray-50 print:bg-gray-50/50 h-12 font-bold">
                  <td colSpan={4} className="border border-black p-3 text-right uppercase">Total Amount:</td>
                  <td className="border border-black p-3 text-center text-base">₹{totalAmount}</td>
                  <td colSpan={2} className="border border-black p-3"></td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Signatures Section */}
          <div className="mt-32 pt-10 grid grid-cols-3 gap-8 text-center text-sm font-medium">
            <div>
              <div className="border-t border-black w-48 mx-auto pt-2 mt-12">
                Prepared By (Signature)
              </div>
            </div>
            <div>
              <div className="border-t border-black w-48 mx-auto pt-2 mt-12">
                Executive Assistant / Secretary
              </div>
            </div>
            <div>
              <div className="border-t border-black w-48 mx-auto pt-2 mt-12">
                Pradhan Signature & Seal
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
