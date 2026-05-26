import { getBirthVerificationReport } from "@/action/birth-verification-report";
import {
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Calendar,
  FileText,
  MapPin,
  User,
  Building2,
  Hash,
  AlertTriangle
} from "lucide-react";

// helper to format dates safely
function fmt(d: Date | string | null | undefined) {
  if (!d) return "—";
  const date = d instanceof Date ? d : new Date(d);
  if (isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

interface PageProps {
  searchParams: Promise<{ id?: string }>;
}

export default async function VerifyBirthReportPage({ searchParams }: PageProps) {
  const { id } = await searchParams;
  const reportId = id?.trim() ?? "";

  // Fetch
  const result = reportId ? await getBirthVerificationReport(reportId) : null;
  const report = result?.success ? result.data : null;

  return (
    <>
      <title>
        {report
          ? `Birth Report Verified – ${report.gpMemoNo} | Dhalpara GP`
          : "Birth Verification Check | Dhalpara GP"}
      </title>

      <div className="min-h-[70vh] flex flex-col items-center justify-start py-10 px-4">
        {/* Header banner */}
        <div className="w-full max-w-2xl mb-8 text-center">
          <div className="inline-flex items-center gap-2 bg-orange-50 border border-orange-200 text-orange-800 text-xs font-semibold px-4 py-1.5 rounded-full mb-4 tracking-wide">
            <ShieldCheck className="h-3.5 w-3.5" />
            OFFICIAL CERTIFICATE VERIFICATION PORTAL
          </div>
          <h1 className="text-2xl font-bold text-gray-900 leading-tight">
            No. 3 Dhalpara Gram Panchayat
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Birth Verification Report — Authenticity Check
          </p>
        </div>

        {/* No query param */}
        {!reportId && (
          <div className="w-full max-w-2xl bg-white border border-gray-200 rounded-2xl shadow-sm p-10 text-center">
            <FileText className="h-12 w-12 mx-auto text-gray-300 mb-4" />
            <h2 className="text-lg font-semibold text-gray-700 mb-1">
              No report ID provided
            </h2>
            <p className="text-sm text-gray-400">
              Scan the QR code on the official verification report to check its authenticity.
            </p>
          </div>
        )}

        {/* Report not found */}
        {reportId && !report && (
          <div className="w-full max-w-2xl">
            <div className="bg-red-50 border border-red-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="flex flex-col items-center py-10 px-6 text-center">
                <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
                  <XCircle className="h-9 w-9 text-red-500" />
                </div>
                <h2 className="text-xl font-bold text-red-700 mb-2">
                  Verification Report Not Found
                </h2>
                <p className="text-sm text-red-600 max-w-sm">
                  No verification report matches the ID{" "}
                  <span className="font-mono font-bold bg-red-100 px-1.5 py-0.5 rounded">
                    {reportId}
                  </span>
                  . This document may be invalid or not issued by this Gram Panchayat.
                </p>
              </div>
              <div className="bg-red-100/60 border-t border-red-200 px-6 py-3 text-center text-xs text-red-500">
                If you believe this is an error, contact the Gram Panchayat office directly.
              </div>
            </div>
          </div>
        )}

        {/* Report found */}
        {report && (
          <div className="w-full max-w-2xl space-y-5">
            {/* Status card */}
            <div
              className={`rounded-2xl border shadow-sm overflow-hidden ${
                report.status === "APPROVED"
                  ? "bg-emerald-50 border-emerald-200"
                  : report.status === "REJECTED"
                  ? "bg-red-50 border-red-200"
                  : "bg-amber-50 border-amber-200"
              }`}
            >
              <div className="flex flex-col sm:flex-row items-center gap-4 px-6 py-6">
                <div
                  className={`h-16 w-16 rounded-full flex items-center justify-center shrink-0 ${
                    report.status === "APPROVED"
                      ? "bg-emerald-100"
                      : report.status === "REJECTED"
                      ? "bg-red-100"
                      : "bg-amber-100"
                  }`}
                >
                  {report.status === "APPROVED" ? (
                    <CheckCircle2 className="h-9 w-9 text-emerald-500" />
                  ) : report.status === "REJECTED" ? (
                    <XCircle className="h-9 w-9 text-red-500" />
                  ) : (
                    <AlertTriangle className="h-9 w-9 text-amber-500" />
                  )}
                </div>
                <div className="text-center sm:text-left">
                  <p
                    className={`text-xs font-bold uppercase tracking-wider mb-1 ${
                      report.status === "APPROVED"
                        ? "text-emerald-600"
                        : report.status === "REJECTED"
                        ? "text-red-600"
                        : "text-amber-600"
                    }`}
                  >
                    {report.status === "APPROVED"
                      ? "✔ Approved & Authenticated"
                      : report.status === "REJECTED"
                      ? "✘ Rejected Verification"
                      : "⚠ Verification Report Pending Approval"}
                  </p>
                  <h2
                    className={`text-xl font-extrabold ${
                      report.status === "APPROVED"
                        ? "text-emerald-800"
                        : report.status === "REJECTED"
                        ? "text-red-800"
                        : "text-amber-800"
                    }`}
                  >
                    GP Ref No: {report.gpMemoNo}
                  </h2>
                  <p className="text-sm text-gray-500 mt-0.5 font-medium">
                    GP Outgoing Memo Date: {fmt(report.gpMemoDate)}
                  </p>
                </div>
              </div>
            </div>

            {/* Verification Result Card */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="bg-slate-50 border-b border-gray-200 px-6 py-3">
                <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-orange-500" />
                  Verification Conclusion
                </h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex flex-col gap-2">
                  <span className="text-xs text-gray-400 uppercase tracking-wider">Result State</span>
                  <div>
                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${
                      report.verificationResult === "GENUINE"
                        ? "bg-green-50 text-green-700 border border-green-200"
                        : report.verificationResult === "NOT_GENUINE"
                        ? "bg-red-50 text-red-700 border border-red-200"
                        : "bg-amber-50 text-amber-700 border border-amber-200"
                    }`}>
                      {report.verificationResult === "GENUINE"
                        ? "Genuine & Authentic"
                        : report.verificationResult === "NOT_GENUINE"
                        ? "Not Genuine"
                        : "Register Not Available"}
                    </span>
                  </div>
                </div>
                
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-gray-400 uppercase tracking-wider">Statement of verification</span>
                  <p className="text-sm font-medium text-slate-800 bg-slate-50 p-3 rounded-lg border border-slate-100">
                    {report.verificationResult === "GENUINE"
                      ? "This is to certify that, upon verification of the Birth Register maintained at this Gram Panchayat, the particulars furnished in the said Birth Certificate have been duly traced and verified with the official records maintained by this office and have been found to be genuine and authentic."
                      : report.verificationResult === "NOT_GENUINE"
                      ? "This is to certify that, upon verification of the Birth Register maintained at this Gram Panchayat, the particulars furnished in the said Birth Certificate have been checked and have been found to be not genuine and authentic."
                      : "This is to certify that the particulars furnished in the said Birth Certificate could not be verified as the relevant Birth Register is not available in this office."}
                  </p>
                </div>

                {report.remarks && (
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-gray-400 uppercase tracking-wider">Official Remarks</span>
                    <p className="text-sm text-slate-600 bg-orange-50/30 p-3 rounded-lg border border-orange-100/50 italic">
                      &ldquo;{report.remarks}&rdquo;
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Reference Details */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="bg-slate-50 border-b border-gray-200 px-6 py-3">
                <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-orange-500" />
                  Reference & Recipient Information
                </h3>
              </div>
              <div className="divide-y divide-gray-100">
                {[
                  {
                    icon: <Hash className="h-3.5 w-3.5 text-gray-400" />,
                    label: "Incoming Memo No.",
                    value: report.memoNo,
                    mono: true,
                  },
                  {
                    icon: <Calendar className="h-3.5 w-3.5 text-gray-400" />,
                    label: "Incoming Memo Date",
                    value: fmt(report.memoDate),
                  },
                  {
                    icon: <User className="h-3.5 w-3.5 text-gray-400" />,
                    label: "Recipient Authority",
                    value: report.toAuthority,
                  },
                  {
                    icon: <MapPin className="h-3.5 w-3.5 text-gray-400" />,
                    label: "Recipient Zone",
                    value: report.toZone,
                  },
                  {
                    icon: <FileText className="h-3.5 w-3.5 text-gray-400" />,
                    label: "Subject",
                    value: report.subject,
                  },
                ].map((row) => (
                  <div
                    key={row.label}
                    className="flex items-start gap-3 px-6 py-3"
                  >
                    <span className="mt-0.5">{row.icon}</span>
                    <span className="text-xs text-gray-500 w-32 shrink-0 pt-0.5 font-medium">
                      {row.label}
                    </span>
                    <span
                      className={`text-sm font-semibold text-gray-800 ${
                        row.mono ? "font-mono" : ""
                      }`}
                    >
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Certificate Particulars */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="bg-slate-50 border-b border-gray-200 px-6 py-3">
                <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <User className="h-4 w-4 text-orange-500" />
                  Birth Certificate Particulars
                </h3>
              </div>
              <div className="divide-y divide-gray-100">
                {[
                  {
                    icon: <User className="h-3.5 w-3.5 text-gray-400" />,
                    label: "Certificate Holder",
                    value: report.certificateHolder,
                  },
                  {
                    icon: <Calendar className="h-3.5 w-3.5 text-gray-400" />,
                    label: "Date of Birth",
                    value: fmt(report.dateOfBirth),
                  },
                  {
                    icon: <User className="h-3.5 w-3.5 text-gray-400" />,
                    label: "Father's Name",
                    value: report.fatherName,
                  },
                  {
                    icon: <User className="h-3.5 w-3.5 text-gray-400" />,
                    label: "Mother's Name",
                    value: report.motherName,
                  },
                  {
                    icon: <Building2 className="h-3.5 w-3.5 text-gray-400" />,
                    label: "Address",
                    value: report.address,
                  },
                  {
                    icon: <Hash className="h-3.5 w-3.5 text-gray-400" />,
                    label: "Registration No.",
                    value: report.registrationNo,
                    mono: true,
                  },
                  {
                    icon: <Calendar className="h-3.5 w-3.5 text-gray-400" />,
                    label: "Registration Date",
                    value: fmt(report.dateOfRegistration),
                  },
                  {
                    icon: <MapPin className="h-3.5 w-3.5 text-gray-400" />,
                    label: "Place of Registration",
                    value: report.placeOfRegistration,
                  },
                ].map((row) => (
                  <div
                    key={row.label}
                    className="flex items-start gap-3 px-6 py-3"
                  >
                    <span className="mt-0.5">{row.icon}</span>
                    <span className="text-xs text-gray-500 w-32 shrink-0 pt-0.5 font-medium">
                      {row.label}
                    </span>
                    <span
                      className={`text-sm font-semibold text-gray-800 ${
                        row.mono ? "font-mono" : ""
                      }`}
                    >
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer disclaimer */}
            <p className="text-center text-xs text-gray-400 pb-4">
              This is an automated digital verification of the birth certificate verification report. For official purposes, contact No. 3 Dhalpara Gram Panchayat, Trimohini, Hili, Dakshin Dinajpur – 733126.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
