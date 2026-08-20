import { getIssuedNOCByNo } from "@/action/land-conversion-actions";
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
} from "lucide-react";

// ── helpers ──────────────────────────────────────────────────────────────
function fmt(d: Date | string | null | undefined) {
  if (!d) return "—";
  const date = d instanceof Date ? d : new Date(d);
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function isExpired(expiry: Date | null | undefined) {
  if (!expiry) return false;
  const expiryDate = expiry instanceof Date ? expiry : new Date(expiry);
  if (Number.isNaN(expiryDate.getTime())) return false;
  return new Date() > expiryDate;
}

// ── types ───────────────────────────────────────────────────────────────
interface PageProps {
  searchParams: Promise<{ noc?: string }>;
}

// ── page (Server Component) ───────────────────────────────────────────────────
export default async function VerifyNocPage({ searchParams }: PageProps) {
  const { noc } = await searchParams;
  const certNo = noc?.trim() ?? "";

  // Fetch
  const result = certNo ? await getIssuedNOCByNo(certNo) : null;
  const cert = result?.success ? result.data : null;
  const expired = cert ? isExpired(cert.expiryDate) : false;
  const valid = !!cert && !expired;

  return (
    <>
      {/* ── SEO ── */}
      <title>
        {cert
          ? `NOC Verified – ${cert.certificateNo} | Dhalpara GP`
          : "NOC Verification | Dhalpara GP"}
      </title>

      <div className="min-h-[70vh] flex flex-col items-center justify-start py-10 px-4">
        {/* ── Header banner ── */}
        <div className="w-full max-w-2xl mb-8 text-center">
          <div className="inline-flex items-center gap-2 bg-orange-50 border border-orange-200 text-orange-800 text-xs font-semibold px-4 py-1.5 rounded-full mb-4 tracking-wide">
            <ShieldCheck className="h-3.5 w-3.5" />
            OFFICIAL CERTIFICATE VERIFICATION PORTAL
          </div>
          <h1 className="text-2xl font-bold text-gray-900 leading-tight">
            No. 3 Dhalpara Gram Panchayat
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Land Conversion NOC — Authenticity Check
          </p>
        </div>

        {/* ── No query param yet ── */}
        {!certNo && (
          <div className="w-full max-w-2xl bg-white border border-gray-200 rounded-2xl shadow-sm p-10 text-center">
            <FileText className="h-12 w-12 mx-auto text-gray-300 mb-4" />
            <h2 className="text-lg font-semibold text-gray-700 mb-1">
              No certificate number provided
            </h2>
            <p className="text-sm text-gray-400">
              Scan the QR code on the issued certificate to verify its
              authenticity.
            </p>
          </div>
        )}

        {/* ── Certificate not found ── */}
        {certNo && !cert && (
          <div className="w-full max-w-2xl">
            <div className="bg-red-50 border border-red-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="flex flex-col items-center py-10 px-6 text-center">
                <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
                  <XCircle className="h-9 w-9 text-red-500" />
                </div>
                <h2 className="text-xl font-bold text-red-700 mb-2">
                  Certificate Not Found
                </h2>
                <p className="text-sm text-red-600 max-w-sm">
                  No issued NOC matches certificate number{" "}
                  <span className="font-mono font-bold bg-red-100 px-1.5 py-0.5 rounded">
                    {certNo}
                  </span>
                  . This document may be invalid or not issued by this
                  Gram Panchayat.
                </p>
              </div>
              <div className="bg-red-100/60 border-t border-red-200 px-6 py-3 text-center text-xs text-red-500">
                If you believe this is an error, contact the Gram Panchayat
                office directly.
              </div>
            </div>
          </div>
        )}

        {/* ── Expired ── */}
        {cert && expired && (
          <div className="w-full max-w-2xl mb-5">
            <div className="flex items-center gap-3 bg-amber-50 border border-amber-300 rounded-xl px-5 py-3 text-amber-800 text-sm font-medium">
              <Calendar className="h-4 w-4 shrink-0" />
              This NOC expired on{" "}
              <span className="font-bold">{fmt(cert.expiryDate)}</span> and is
              no longer valid.
            </div>
          </div>
        )}

        {/* ── Valid / found ── */}
        {cert && (
          <div className="w-full max-w-2xl space-y-5">
            {/* Status badge */}
            <div
              className={`rounded-2xl border shadow-sm overflow-hidden ${
                valid
                  ? "bg-emerald-50 border-emerald-200"
                  : "bg-amber-50 border-amber-200"
              }`}
            >
              <div className="flex flex-col sm:flex-row items-center gap-4 px-6 py-6">
                <div
                  className={`h-16 w-16 rounded-full flex items-center justify-center shrink-0 ${
                    valid ? "bg-emerald-100" : "bg-amber-100"
                  }`}
                >
                  {valid ? (
                    <CheckCircle2 className="h-9 w-9 text-emerald-500" />
                  ) : (
                    <XCircle className="h-9 w-9 text-amber-500" />
                  )}
                </div>
                <div className="text-center sm:text-left">
                  <p
                    className={`text-xs font-bold uppercase tracking-wider mb-1 ${
                      valid ? "text-emerald-600" : "text-amber-600"
                    }`}
                  >
                    {valid ? "✔ Verified & Valid" : "⚠ Expired Certificate"}
                  </p>
                  <h2
                    className={`text-xl font-extrabold ${
                      valid ? "text-emerald-800" : "text-amber-800"
                    }`}
                  >
                    {cert.certificateNo}
                  </h2>
                  <p className="text-sm text-gray-500 mt-0.5">
                    Issued by No. 3 Dhalpara Gram Panchayat
                  </p>
                </div>
              </div>
            </div>

            {/* Details card */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="bg-slate-50 border-b border-gray-200 px-6 py-3">
                <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-orange-500" />
                  Certificate Details
                </h3>
              </div>

              <div className="divide-y divide-gray-100">
                {/* Row helper */}
                {[
                  {
                    icon: <Hash className="h-3.5 w-3.5 text-gray-400" />,
                    label: "Certificate No.",
                    value: cert.certificateNo,
                    mono: true,
                  },
                  {
                    icon: <Hash className="h-3.5 w-3.5 text-gray-400" />,
                    label: "Memo No.",
                    value: cert.memoNumber || "—",
                    mono: true,
                  },
                  {
                    icon: <Hash className="h-3.5 w-3.5 text-gray-400" />,
                    label: "Application No.",
                    value: cert.applicationNo,
                    mono: true,
                  },
                  {
                    icon: <Calendar className="h-3.5 w-3.5 text-gray-400" />,
                    label: "Issue Date",
                    value: fmt(cert.issueDate),
                  },
                  {
                    icon: <Calendar className="h-3.5 w-3.5 text-gray-400" />,
                    label: "Valid Until",
                    value: cert.expiryDate ? fmt(cert.expiryDate) : "6 months from issue",
                  },
                  {
                    icon: <User className="h-3.5 w-3.5 text-gray-400" />,
                    label: "Signatory",
                    value: `${cert.signatoryName || "Pradhan"} (${cert.signatoryDesignation || "Pradhan"})`,
                  },
                ].map((row) => (
                  <div
                    key={row.label}
                    className="flex items-start gap-3 px-6 py-3"
                  >
                    <span className="mt-0.5">{row.icon}</span>
                    <span className="text-xs text-gray-500 w-32 shrink-0 pt-0.5">
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

            {/* Applicant card */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="bg-slate-50 border-b border-gray-200 px-6 py-3">
                <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <User className="h-4 w-4 text-orange-500" />
                  Applicant Information
                </h3>
              </div>
              <div className="divide-y divide-gray-100">
                {[
                  {
                    icon: <User className="h-3.5 w-3.5 text-gray-400" />,
                    label: "Name",
                    value: cert.applicantName,
                  },
                  {
                    icon: <Building2 className="h-3.5 w-3.5 text-gray-400" />,
                    label: "Address",
                    value: cert.applicantAddress || "—",
                  },
                ].map((row) => (
                  <div
                    key={row.label}
                    className="flex items-start gap-3 px-6 py-3"
                  >
                    <span className="mt-0.5">{row.icon}</span>
                    <span className="text-xs text-gray-500 w-32 shrink-0 pt-0.5">
                      {row.label}
                    </span>
                    <span className="text-sm font-semibold text-gray-800">
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Land parcel card */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="bg-slate-50 border-b border-gray-200 px-6 py-3">
                <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-orange-500" />
                  Land Parcel
                </h3>
              </div>
              <div className="divide-y divide-gray-100">
                {[
                  { label: "Mouza", value: cert.mouza || "—" },
                  { label: "JL No.", value: cert.jlNo || "—" },
                  { label: "Khatian No.", value: cert.khatianNo || "—" },
                  { label: "Plot No.", value: cert.plotNo || "—" },
                  {
                    label: "Area (Decimal)",
                    value: cert.landAreaDec || "—",
                  },
                  {
                    label: "Present Use",
                    value: cert.presentLandUse || "—",
                  },
                  {
                    label: "Proposed Use",
                    value: cert.proposedLandUse || "—",
                  },
                ].map((row) => (
                  <div
                    key={row.label}
                    className="flex items-start gap-3 px-6 py-3"
                  >
                    <span className="text-xs text-gray-500 w-36 shrink-0 pt-0.5">
                      {row.label}
                    </span>
                    <span className="text-sm font-semibold text-gray-800">
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer disclaimer */}
            <p className="text-center text-xs text-gray-400 pb-4">
              This is an automated digital verification. For official purposes,
              contact No. 3 Dhalpara Gram Panchayat, Trimohini, Hili,
              Dakshin Dinajpur – 733126.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
