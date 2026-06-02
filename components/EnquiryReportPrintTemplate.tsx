import React from "react";
import { format } from "date-fns";

interface EnquiryReportPrintTemplateProps {
  reportType: "combined" | "residence";
  applicationData: any;
  printRef: React.RefObject<HTMLDivElement | null>;
  memoNo: string;
  memoDate: string;
  refMemoNo: string;
  refMemoDate: string;
  bdoTitle: string;
  blockName: string;
  district: string;
  policeStation: string;
  gramPanchayat: string;
  personName: string;
  fatherName: string;
  villageName: string;
  postOffice: string;
  docs: any[];
}

export default function EnquiryReportPrintTemplate({
  reportType,
  applicationData,
  printRef,
  memoNo,
  memoDate,
  refMemoNo,
  refMemoDate,
  bdoTitle,
  blockName,
  district,
  policeStation,
  gramPanchayat,
  personName,
  fatherName,
  villageName,
  postOffice,
  docs,
}: EnquiryReportPrintTemplateProps) {
  if (reportType !== "residence" && !(reportType === "combined" && applicationData)) {
    return null;
  }

  return (
    <div
      className="hidden print:block absolute left-[-9999px] top-0 print:static print:left-auto"
      ref={printRef}
    >
      <div className="bg-white text-black w-[210mm] min-h-[297mm] p-8 mx-auto">
        <style
          dangerouslySetInnerHTML={{
            __html: `
            @media print {
              @page { size: A4; margin: 20mm; }
              body { background: white; }
            }
          `,
          }}
        />

        <div className="font-serif text-[15px] leading-relaxed max-w-4xl mx-auto space-y-6">
          {/* Office Heading */}
          <div className="text-center mb-4 border-b-2 pb-2" style={{ borderColor: "#1a4d8c" }}>
            <div className="text-xl font-bold italic leading-none" style={{ color: "#1a4d8c" }}>
              Office of The Pradhan
            </div>
            <div className="text-3xl font-bold leading-tight mt-1" style={{ color: "#1a4d8c" }}>
              No 3 Dhalpara Gram Panchayat
            </div>
            <div className="text-sm text-gray-600 leading-tight mt-1">
              Trimohini, Hili, Dakshin Dinajpur, West Bengal
            </div>
          </div>

          <div className="flex justify-between mb-8">
            <div>
              Memo No: {memoNo ? <span className="font-bold">{memoNo}</span> : "________________"}
            </div>
            <div>
              Date:{" "}
              {memoDate ? (
                <span className="font-bold">{format(new Date(memoDate), "dd/MM/yyyy")}</span>
              ) : (
                "________________"
              )}
            </div>
          </div>

          <div className="space-y-1 mb-8">
            <div>To</div>
            <div className="font-semibold">{bdoTitle}</div>
            <div>{blockName}</div>
            <div>{district}</div>
          </div>

          <div className="mb-6">
            <span className="font-bold border-b border-black pb-0.5">Subject:</span>
            <span className="font-bold ml-2">
              {reportType === "combined"
                ? `Enquiry Report Regarding Permanent Residence and Legal Heirs of Late ${personName}`
                : `Enquiry Report Regarding Permanent Residence of ${personName}`}
            </span>
          </div>

          <div className="mb-6">
            <span className="font-bold border-b border-black pb-0.5">Reference:</span>
            <span className="ml-2">
              Memo No. {refMemoNo} dated{" "}
              {refMemoDate ? format(new Date(refMemoDate), "dd/MM/yyyy") : "____________"}
            </span>
          </div>

          <div>Sir,</div>

          <p className="text-justify indent-8">
            With reference to the memo cited above, an enquiry was conducted regarding the permanent
            residential status {reportType === "combined" && "and legal heirs "}of{" "}
            {reportType === "combined" && "Late "}
            <span className="font-bold">{personName}</span>, son/wife of{" "}
            {reportType === "combined" && ""}
            <span className="font-bold">{fatherName || "________________"}</span>.
          </p>

          <p className="text-justify indent-8">
            Upon verification of the records available with this office, scrutiny of the documents
            produced, and local enquiry conducted in the locality, it has been found that{" "}
            {reportType === "combined" && "Late "}
            <span className="font-bold">{personName}</span> {reportType === "combined" ? "was" : "is"}{" "}
            a permanent resident of Village &ndash; {villageName || "________________"}, Gram
            Panchayat &ndash; {gramPanchayat}, Post Office &ndash; {postOffice || "________________"},
            Police Station &ndash; {policeStation}, District &ndash; {district}.
          </p>

          <p className="text-justify">
            The following documents were produced and verified during the enquiry:
          </p>

          <ol className="list-decimal pl-12 space-y-1">
            {docs.filter((d) => d.checked).map((doc, idx) => (
              <li key={doc.id}>
                {doc.label} {doc.details ? `(${doc.details})` : ""}
              </li>
            ))}
          </ol>

          {reportType === "combined" && (
            <>
              <p className="text-justify">
                As per the documents produced, records available, and local enquiry conducted, the
                following persons have been identified as the legal heirs of Late{" "}
                <span className="font-bold">{applicationData?.nameOfDeceased}</span>:
              </p>

              <ol className="list-decimal pl-12 space-y-1 mb-6">
                {applicationData?.warishDetails?.map((heir: any, idx: number) => (
                  <li key={heir.id || idx}>
                    Shri/Smt. <span className="font-bold">{heir.name}</span> &ndash; {heir.relation}
                  </li>
                ))}
              </ol>
            </>
          )}

          <p className="text-justify indent-8">
            Based on the enquiry conducted and the records verified, this office is of the opinion
            that the above-mentioned particulars are found to be correct to the best of our knowledge
            and belief.
          </p>

          <p className="text-justify">
            This report is submitted for your kind information and necessary action.
          </p>

          <div className="flex justify-end mt-16">
            <div className="text-center">
              <div className="mb-12">Yours faithfully,</div>
              <div>(Signature)</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
