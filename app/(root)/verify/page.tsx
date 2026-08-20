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
  AlertTriangle,
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

function obfuscateAppNo(appNo: string | null | undefined) {
  if (!appNo) return "—";
  if (appNo.length <= 6) return appNo;
  const first = appNo.slice(0, 4);
  const last = appNo.slice(-3);
  return `${first}${"*".repeat(appNo.length - 7)}${last}`;
}

// ── types ───────────────────────────────────────────────────────────────
interface PageProps {
  searchParams: Promise<{ noc?: string; token?: string }>;
}

// ── page (Server Component) ───────────────────────────────────────────────────
export default async function VerifyNocPage({ searchParams }: PageProps) {
  const { noc, token } = await searchParams;
  
  let certNo = "";
  if (token) {
    try {
      certNo = Buffer.from(token.trim(), "base64").toString("utf-8");
    } catch (e) {
      // ignore
    }
  } else if (noc) {
    certNo = noc.trim();
  }

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

      <div className="min-h-screen relative overflow-hidden bg-slate-50 flex flex-col items-center justify-start py-16 px-4 sm:px-6 lg:px-8">

        {/* Animated background decoration */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-tr from-orange-300/20 via-emerald-300/10 to-blue-300/20 blur-[100px] rounded-full pointer-events-none -z-10" />

        {/* ── Header banner ── */}
        <div className="w-full max-w-3xl mb-12 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-md border border-orange-200/50 text-orange-700 text-xs font-bold px-5 py-2 rounded-full mb-6 tracking-widest uppercase shadow-sm">
            <ShieldCheck className="h-4 w-4 text-orange-500" />
            Official Verification Portal
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight mb-3">
            No. 3 Dhalpara Gram Panchayat
          </h1>
          <p className="text-base sm:text-lg text-slate-600 max-w-xl mx-auto font-medium">
            Land Conversion NOC Authenticity Check
          </p>
        </div>

        {/* ── No query param yet ── */}
        {!certNo && (
          <div className="w-full max-w-3xl bg-white/70 backdrop-blur-xl border border-white/50 rounded-3xl shadow-xl p-12 text-center animate-in fade-in zoom-in-95 duration-500">
            <div className="bg-slate-100 h-24 w-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
              <FileText className="h-10 w-10 text-slate-400" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-3">
              Ready to Verify
            </h2>
            <p className="text-slate-500 max-w-md mx-auto text-lg">
              Please scan the QR code located on your issued certificate to verify its authenticity and status.
            </p>
          </div>
        )}

        {/* ── Certificate not found ── */}
        {certNo && !cert && (
          <div className="w-full max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-red-50/90 backdrop-blur-xl border border-red-200 rounded-3xl shadow-xl overflow-hidden">
              <div className="flex flex-col items-center py-12 px-6 text-center">
                <div className="h-20 w-20 rounded-full bg-red-100 flex items-center justify-center mb-6 ring-8 ring-red-50">
                  <XCircle className="h-10 w-10 text-red-600" />
                </div>
                <h2 className="text-2xl font-extrabold text-red-900 mb-3">
                  Certificate Not Found
                </h2>
                <p className="text-base text-red-700/80 max-w-md mx-auto leading-relaxed">
                  We couldn't find any NOC matching the certificate number{" "}
                  <span className="font-mono font-bold bg-red-200/50 text-red-900 px-2 py-1 rounded-md mx-1">
                    {certNo}
                  </span>
                  . This document may be invalid or not issued by this Gram Panchayat.
                </p>
              </div>
              <div className="bg-red-100/50 border-t border-red-200/50 px-6 py-4 text-center text-sm font-medium text-red-800">
                If you believe this is an error, please contact the Gram Panchayat office.
              </div>
            </div>
          </div>
        )}

        {/* ── Expired ── */}
        {cert && expired && (
          <div className="w-full max-w-3xl mb-6 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex items-center gap-4 bg-amber-50/90 backdrop-blur-md border border-amber-300/60 rounded-2xl px-6 py-4 shadow-md">
              <div className="bg-amber-100 p-2 rounded-full shrink-0">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
              </div>
              <div className="text-amber-900 text-sm sm:text-base">
                <strong className="font-semibold block sm:inline">Attention:</strong> This NOC expired on{" "}
                <span className="font-bold underline decoration-amber-400/50 underline-offset-2">{fmt(cert.expiryDate)}</span> and is no longer valid.
              </div>
            </div>
          </div>
        )}

        {/* ── Valid / found ── */}
        {cert && (
          <div className="w-full max-w-3xl space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {/* Status badge */}
            <div
              className={`rounded-3xl border shadow-xl overflow-hidden backdrop-blur-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${valid
                  ? "bg-emerald-50/80 border-emerald-200/60"
                  : "bg-amber-50/80 border-amber-200/60"
                }`}
            >
              <div className="flex flex-col sm:flex-row items-center gap-6 px-8 py-8 relative overflow-hidden">
                {/* Decorative background glow */}
                <div className={`absolute top-0 right-0 w-64 h-64 blur-[80px] rounded-full pointer-events-none ${valid ? 'bg-emerald-400/20' : 'bg-amber-400/20'}`} />

                <div
                  className={`h-20 w-20 rounded-full flex items-center justify-center shrink-0 ring-8 relative z-10 ${valid ? "bg-emerald-100 ring-emerald-50" : "bg-amber-100 ring-amber-50"
                    }`}
                >
                  {valid ? (
                    <CheckCircle2 className="h-10 w-10 text-emerald-600" />
                  ) : (
                    <XCircle className="h-10 w-10 text-amber-600" />
                  )}
                </div>
                <div className="text-center sm:text-left relative z-10">
                  <div
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-3 ${valid ? "bg-emerald-100/50 text-emerald-700" : "bg-amber-100/50 text-amber-700"
                      }`}
                  >
                    {valid ? (
                      <><CheckCircle2 className="w-3.5 h-3.5" /> Verified & Valid</>
                    ) : (
                      <><AlertTriangle className="w-3.5 h-3.5" /> Expired Certificate</>
                    )}
                  </div>
                  <h2
                    className={`text-2xl sm:text-3xl font-black tracking-tight ${valid ? "text-emerald-900" : "text-amber-900"
                      }`}
                  >
                    {cert.certificateNo}
                  </h2>
                  <p className={`text-sm mt-1.5 font-medium ${valid ? "text-emerald-700/70" : "text-amber-700/70"}`}>
                    Issued by No. 3 Dhalpara Gram Panchayat
                  </p>
                </div>
              </div>
            </div>

            {/* Grid for Details and Applicant */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Details card */}
              <div className="bg-white/80 backdrop-blur-xl border border-white/60 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group">
                <div className="bg-slate-50/50 px-6 py-5 border-b border-slate-100/50 flex items-center gap-3">
                  <div className="bg-orange-100 p-2 rounded-lg group-hover:scale-110 transition-transform duration-300">
                    <FileText className="h-5 w-5 text-orange-600" />
                  </div>
                  <h3 className="text-base font-bold text-slate-800">
                    Certificate Details
                  </h3>
                </div>

                <div className="divide-y divide-slate-100/50 flex-1 p-2">
                  {[
                    {
                      label: "Memo No.",
                      value: cert.memoNumber || "—",
                      mono: true,
                    },
                    {
                      label: "Application No.",
                      value: obfuscateAppNo(cert.applicationNo),
                      mono: true,
                    },
                    {
                      label: "Issue Date",
                      value: fmt(cert.issueDate),
                    },
                    {
                      label: "Valid Until",
                      value: cert.expiryDate ? fmt(cert.expiryDate) : "6 months from issue",
                    },
                  ].map((row) => (
                    <div
                      key={row.label}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 px-4 py-3 hover:bg-slate-50/50 rounded-xl transition-colors"
                    >
                      <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                        {row.label}
                      </span>
                      <span
                        className={`text-sm font-semibold text-slate-900 ${row.mono ? "font-mono" : ""
                          }`}
                      >
                        {row.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Applicant card */}
              <div className="bg-white/80 backdrop-blur-xl border border-white/60 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group">
                <div className="bg-slate-50/50 px-6 py-5 border-b border-slate-100/50 flex items-center gap-3">
                  <div className="bg-blue-100 p-2 rounded-lg group-hover:scale-110 transition-transform duration-300">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  <h3 className="text-base font-bold text-slate-800">
                    Applicant Info
                  </h3>
                </div>
                <div className="divide-y divide-slate-100/50 flex-1 p-2">
                  {[
                    {
                      label: "Name",
                      value: cert.applicantName,
                    },
                    {
                      label: "Address",
                      value: cert.applicantAddress || "—",
                    },
                    {
                      label: "Signatory",
                      value: `${cert.signatoryName || "Pradhan"}`,
                      sub: cert.signatoryDesignation || "Pradhan",
                    }
                  ].map((row) => (
                    <div
                      key={row.label}
                      className="flex flex-col gap-1 px-4 py-3 hover:bg-slate-50/50 rounded-xl transition-colors"
                    >
                      <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                        {row.label}
                      </span>
                      <span className="text-sm font-semibold text-slate-900 leading-snug">
                        {row.value}
                        {row.sub && <span className="block text-xs font-normal text-slate-500 mt-0.5">{row.sub}</span>}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Land parcel card */}
            <div className="bg-white/80 backdrop-blur-xl border border-white/60 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
              <div className="bg-slate-50/50 px-6 py-5 border-b border-slate-100/50 flex items-center gap-3">
                <div className="bg-emerald-100 p-2 rounded-lg group-hover:scale-110 transition-transform duration-300">
                  <MapPin className="h-5 w-5 text-emerald-600" />
                </div>
                <h3 className="text-base font-bold text-slate-800">
                  Land Parcel Information
                </h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-6 p-6">
                {[
                  { label: "Mouza", value: cert.mouza || "—" },
                  { label: "JL No.", value: cert.jlNo || "—" },
                  { label: "Khatian No.", value: cert.khatianNo || "—" },
                  { label: "Plot No.", value: cert.plotNo || "—" },
                  { label: "Area (Decimal)", value: cert.landAreaDec || "—" },
                  { label: "Present Use", value: cert.presentLandUse || "—" },
                  { label: "Proposed Use", value: cert.proposedLandUse || "—", colSpan2: true },
                ].map((row) => (
                  <div
                    key={row.label}
                    className={`flex flex-col gap-1 ${row.colSpan2 ? 'col-span-2' : ''}`}
                  >
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                      {row.label}
                    </span>
                    <span className="text-sm font-bold text-slate-900">
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer disclaimer */}
            <div className="pt-6">
              <p className="text-center text-xs font-medium text-slate-400/80 max-w-xl mx-auto leading-relaxed">
                This is an automated digital verification. For official purposes,
                contact No. 3 Dhalpara Gram Panchayat, Trimohini, Hili,
                Dakshin Dinajpur – 733126.
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
