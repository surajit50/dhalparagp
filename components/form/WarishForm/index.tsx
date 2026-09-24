"use client";
import {
  useState,
  useRef,
  useTransition,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { createNestedWarishDetails } from "@/action/warishApplicationAction";
import {
  warishFormSchema,
  type WarishFormValuesType,
} from "@/schema/warishSchema";
import { ApplicationInfo } from "./application-info";
import { WarishTable } from "./warish-table";
import { defaultValues } from "./constants";
import {
  CheckCircle2,
  ClipboardList,
  Users,
  SendHorizonal,
  ChevronLeft,
  Eye,
  ChevronRight,
  UploadCloud,
  FileText,
  FileCheck,
  X,
  AlertCircle,
} from "lucide-react";
import { formatDate } from "@/utils/utils";
import { cn } from "@/lib/utils";

// Document types required for warish application
const DOCUMENT_TYPES = [
  {
    type: "death_certificate",
    title: "Death Certificate / মৃত্যু সনদ",
    description: "Scanned copy of official death certificate (PDF/Image)",
    required: true,
    accept: "application/pdf,image/jpeg,image/png",
  },
  {
    type: "application_form",
    title: "Application Form / আবেদন ফর্ম",
    description: "Completed and signed application form (PDF)",
    required: true,
    accept: "application/pdf",
  },
  {
    type: "affidavit",
    title: "Affidavit / হলফনামা",
    description: "Notarized affidavit document (PDF)",
    required: false,
    accept: "application/pdf",
  },
  {
    type: "heir_proof",
    title: "Heir Proof / উত্তরাধিকার প্রমাণ",
    description: "Legal heir verification documents (PDF)",
    required: false,
    accept: "application/pdf",
  },
] as const;

type DocumentType = (typeof DOCUMENT_TYPES)[number]["type"];
type SelectedFiles = Partial<Record<DocumentType, File>>;

// Document Upload Step Component
const DocumentUploadStep = ({
  selectedFiles,
  onFileSelect,
  onFileRemove,
  uploading,
}: {
  selectedFiles: SelectedFiles;
  onFileSelect: (docType: DocumentType, file: File) => void;
  onFileRemove: (docType: DocumentType) => void;
  uploading: boolean;
}) => (
  <div className="space-y-5">
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3 shadow-sm">
      <div className="p-1.5 bg-blue-100 rounded-lg flex-shrink-0">
        <AlertCircle className="h-4 w-4 text-blue-600" />
      </div>
      <div>
        <p className="text-sm font-semibold text-blue-900 mb-0.5">
          Document Upload Instructions / নথি আপলোড নির্দেশাবলী
        </p>
        <p className="text-sm text-blue-800">
          Upload required documents for your warish application. Documents marked as
          <span className="font-semibold text-red-600"> Required</span> must be uploaded.
          You can also upload optional documents to support your application.
        </p>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {DOCUMENT_TYPES.map((docType) => {
        const file = selectedFiles[docType.type];
        return (
          <div
            key={docType.type}
            className={cn(
              "border-2 rounded-2xl p-5 transition-all duration-300 shadow-sm",
              file
                ? "border-green-300 bg-gradient-to-br from-green-50 to-emerald-50 shadow-green-100 shadow-md"
                : "border-gray-200 bg-white hover:border-primary/40 hover:shadow-md hover:shadow-primary/5 hover:-translate-y-0.5"
            )}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "p-2 rounded-lg shadow-sm",
                    file
                      ? "bg-gradient-to-br from-green-100 to-emerald-100"
                      : "bg-gradient-to-br from-primary/10 to-primary/5"
                  )}
                >
                  {file ? (
                    <FileCheck className="h-5 w-5 text-green-600" />
                  ) : (
                    <FileText className="h-5 w-5 text-primary" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-800 leading-tight">
                    {docType.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">{docType.description}</p>
                </div>
              </div>
              {docType.required && (
                <span className="text-xs font-bold text-red-600 bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 px-2.5 py-1 rounded-full shadow-sm">
                  Required
                </span>
              )}
            </div>

            {/* File picker */}
            {file ? (
              <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl shadow-inner">
                <div className="p-1.5 bg-green-200/60 rounded-lg">
                  <FileText className="h-4 w-4 text-green-700 flex-shrink-0" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium text-green-800 truncate block">
                    {file.name}
                  </span>
                  <span className="text-xs text-green-600">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => onFileRemove(docType.type)}
                  disabled={uploading}
                  className="p-2 rounded-xl bg-green-100 hover:bg-red-100 hover:text-red-600 transition-all duration-200 group"
                >
                  <X className="h-4 w-4 text-green-700 group-hover:text-red-600" />
                </button>
              </div>
            ) : (
              <label
                htmlFor={`warish-doc-${docType.type}`}
                className={cn(
                  "flex flex-col items-center justify-center gap-2.5 p-6 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300",
                  "border-gray-300 hover:border-primary/60 hover:bg-gradient-to-br hover:from-primary/5 hover:to-primary/10",
                  uploading && "opacity-50 cursor-not-allowed pointer-events-none"
                )}
              >
                <div className={cn(
                  "p-3 rounded-xl transition-all duration-300",
                  "bg-gray-100 text-gray-500",
                  "hover:bg-primary/15 hover:text-primary"
                )}>
                  <UploadCloud className="h-6 w-6" />
                </div>
                <div className="text-center">
                  <span className="text-sm font-semibold text-gray-600 block">
                    Click to browse
                  </span>
                  <span className="text-xs text-gray-400 mt-0.5 block">
                    or drag & drop file here
                  </span>
                </div>
                <input
                  id={`warish-doc-${docType.type}`}
                  type="file"
                  className="hidden"
                  accept={docType.accept}
                  disabled={uploading}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) onFileSelect(docType.type, f);
                    e.target.value = "";
                  }}
                />
              </label>
            )}
          </div>
        );
      })}
    </div>

    <div className="flex items-center justify-center gap-2 bg-gray-50 py-3 px-4 rounded-xl border border-gray-100">
      <FileText className="h-4 w-4 text-gray-400" />
      <p className="text-xs text-gray-500 font-medium">
        Accepted formats: PDF, JPEG, PNG &bull; Max file size: 5MB per document
      </p>
    </div>
  </div>
);

const FormPreview = ({ values }: { values: WarishFormValuesType }) => (
  <div className="space-y-7 focus:outline-none">
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-primary/15 via-primary/10 to-primary/5 px-5 py-4 border-b border-primary/10">
        <h3 className="font-bold text-lg md:text-xl text-primary flex items-center gap-3">
          <div className="p-2 bg-white rounded-lg shadow-sm">
            <ClipboardList className="h-5 w-5" />
          </div>
          Applicant & Deceased Information / আবেদনকারী ও মৃত ব্যক্তির তথ্য
        </h3>
      </div>

      <div className="p-5 md:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-gradient-to-br from-gray-50 to-slate-50 p-5 rounded-xl border border-gray-200 shadow-sm">
            <h4 className="font-bold mb-4 text-gray-800 flex items-center gap-2 pb-2 border-b border-gray-200">
              <span className="bg-gradient-to-br from-primary/15 to-primary/5 text-primary p-1.5 rounded-lg shadow-sm">
                <Users className="h-4 w-4" />
              </span>
              Applicant Details / আবেদনকারীর বিবরণ
            </h4>
            <dl className="space-y-3.5">
              {[
                { label: "Name / নাম", value: values.applicantName },
                { label: "Mobile / মোবাইল", value: values.applicantMobileNumber },
                { label: "Father / পিতা", value: values.fatherName },
                { label: "Village / গ্রাম", value: values.villageName },
                { label: "Post Office / ডাকঘর", value: values.postOffice },
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <dt className="text-xs font-semibold text-gray-500 w-2/5 min-w-[100px] pt-0.5">{item.label}</dt>
                  <dd className="text-sm font-semibold text-gray-800 flex-1">
                    {item.value ? (
                      <span className="bg-white px-3 py-1.5 rounded-lg border border-gray-100 shadow-sm inline-block min-w-full">
                        {item.value}
                      </span>
                    ) : (
                      <span className="text-gray-400 italic">N/A</span>
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="bg-gradient-to-br from-rose-50 to-pink-50 p-5 rounded-xl border border-rose-200 shadow-sm">
            <h4 className="font-bold mb-4 text-gray-800 flex items-center gap-2 pb-2 border-b border-rose-100">
              <span className="bg-gradient-to-br from-rose-100 to-pink-100 text-rose-600 p-1.5 rounded-lg shadow-sm">
                <Users className="h-4 w-4" />
              </span>
              Deceased Details / মৃত ব্যক্তির বিবরণ
            </h4>
            <dl className="space-y-3.5">
              {[
                { label: "Name / নাম", value: values.nameOfDeceased },
                {
                  label: "Date of Death / মৃত্যুর তারিখ",
                  value: values.dateOfDeath
                    ? formatDate(values.dateOfDeath)
                    : "",
                },
                {
                  label: "Relation / সম্পর্ক",
                  value: values.relationwithdeceased,
                },
                { label: "Gender / লিঙ্গ", value: values.gender },
                { label: "Marital Status / বৈবাহিক অবস্থা", value: values.maritialStatus },
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <dt className="text-xs font-semibold text-rose-600 w-2/5 min-w-[100px] pt-0.5">{item.label}</dt>
                  <dd className="text-sm font-semibold text-gray-800 flex-1">
                    {item.value ? (
                      <span className="bg-white px-3 py-1.5 rounded-lg border border-rose-100 shadow-sm inline-block min-w-full">
                        {item.value}
                      </span>
                    ) : (
                      <span className="text-gray-400 italic">N/A</span>
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </div>

    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-primary/15 via-primary/10 to-primary/5 px-5 py-4 border-b border-primary/10">
        <h3 className="font-bold text-lg md:text-xl text-primary flex items-center gap-3">
          <div className="p-2 bg-white rounded-lg shadow-sm">
            <Users className="h-5 w-5" />
          </div>
          Warish Details / ওয়ারিশ তথ্য
        </h3>
      </div>

      <div className="p-5 md:p-6">
        <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-inner">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-gray-50 to-slate-50">
              <tr>
                {[
                  "Name / নাম",
                  "Relation / সম্পর্ক",
                  "Gender / লিঙ্গ",
                  "Living Status / অবস্থা",
                  "Spouse / স্বামী/স্ত্রী",
                ].map((header, idx) => (
                  <th
                    key={idx}
                    className="px-4 py-3.5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider"
                  >
                    <span className="bg-white px-2 py-1 rounded border border-gray-100 shadow-sm inline-block">
                      {header}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {(() => {
                const renderRows = (details: any[], depth = 0, parentIndex = ""): React.ReactNode[] => {
                  const getSerialNumber = (d: number, i: number) => {
                    if (d === 0) return `${i + 1}`;
                    if (d === 1) return String.fromCharCode(65 + i);
                    return String.fromCharCode(97 + i);
                  };

                  return details.flatMap((warish, index) => {
                    const currentIndex = parentIndex
                      ? `${parentIndex}.${getSerialNumber(depth, index)}`
                      : getSerialNumber(depth, index);

                    return [
                      <tr
                        key={`${warish.name}-${index}-${depth}`}
                        className={cn(
                          index % 2 === 0 ? "bg-white" : "bg-gray-50/50",
                          depth > 0 && "bg-primary/5",
                          "hover:bg-primary/10 transition-colors duration-150"
                        )}
                      >
                        <td className="px-4 py-3 text-sm text-gray-900">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-500 font-mono text-xs w-8 text-right inline-block bg-gray-100 px-1.5 py-0.5 rounded font-bold">
                              {currentIndex}
                            </span>
                            <div style={{ paddingLeft: `${depth * 20}px` }}>
                              <span className="font-semibold">{warish.name}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          <span className="font-medium">{warish.relation}</span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-gray-100 text-gray-700">
                            {warish.gender}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          <span
                            className={cn(
                              "px-3 py-1 rounded-full text-xs font-bold inline-flex items-center shadow-sm",
                              warish.livingStatus === "Alive" || warish.livingStatus === "alive"
                                ? "bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200"
                                : "bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border border-red-200"
                            )}
                          >
                            {warish.livingStatus}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          <span className="font-medium">{warish.husbandName || (
                            <span className="text-gray-400 italic">N/A</span>
                          )}</span>
                        </td>
                      </tr>,
                      ...(warish.children && warish.children.length > 0
                        ? renderRows(warish.children, depth + 1, currentIndex)
                        : []),
                    ];
                  });
                };

                return renderRows(values.warishDetails || []);
              })()}
            </tbody>
          </table>
        </div>
        <div className="mt-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-gradient-to-r from-gray-50 to-slate-50 p-4 rounded-xl border border-gray-200">
          <p className="text-sm text-gray-600 font-medium">
            <span className="bg-primary/10 text-primary px-2.5 py-1 rounded-lg font-bold mr-2">
              Total Warish: {values.warishDetails?.length || 0}
            </span>
          </p>
          <p className="text-sm font-bold text-primary flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Please review all information before submitting / জমা দেওয়ার আগে সব তথ্য পর্যালোচনা করুন
          </p>
        </div>
      </div>
    </div>
  </div>
);

export default function WarishFormComponent() {
  const [acnumber, setAcnumber] = useState("");
  const [applicationId, setApplicationId] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<SelectedFiles>({});
  const [uploadingDocs, setUploadingDocs] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [step, setStep] = useState(1);
  const formRef = useRef<HTMLFormElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  const form = useForm<WarishFormValuesType>({
    resolver: zodResolver(warishFormSchema),
    defaultValues,
    shouldUnregister: false,
  });

  const step1Fields = useMemo<(keyof WarishFormValuesType)[]>(
    () => [
      "applicantName",
      "applicantMobileNumber",
      "nameOfDeceased",
      "dateOfDeath",
      "gender",
      "maritialStatus",
      "fatherName",
      "spouseName",
      "villageName",
      "postOffice",
      "relationwithdeceased",
    ],
    []
  );

  const step2Fields = useMemo<(keyof WarishFormValuesType)[]>(
    () => ["warishDetails"],
    []
  );

  const handleFileSelect = useCallback(
    (docType: DocumentType, file: File) => {
      setSelectedFiles((prev) => ({ ...prev, [docType]: file }));
    },
    []
  );

  const handleFileRemove = useCallback((docType: DocumentType) => {
    setSelectedFiles((prev) => {
      const next = { ...prev };
      delete next[docType];
      return next;
    });
  }, []);

  const [showSuccessBanner, setShowSuccessBanner] = useState(false);

  const resetForm = useCallback(() => {
    form.reset(defaultValues);
    setStep(1);
    setSelectedFiles({});
    setAcnumber("");
    setApplicationId("");
  }, [form]);

  useEffect(() => {
    if (acnumber) {
      setShowSuccessBanner(true);
      const timer = setTimeout(() => {
        setShowSuccessBanner(false);
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [acnumber]);

  const nextStep = useCallback(
    async (e?: React.MouseEvent) => {
      e?.preventDefault();
      e?.stopPropagation();

      if (step === 1) {
        const isValid = await form.trigger(step1Fields);
        if (isValid) setStep(2);
      } else if (step === 2) {
        const isValid = await form.trigger(step2Fields);
        if (isValid) setStep(3);
      } else if (step === 3) {
        // Step 3 is document upload — optional, proceed to review
        setStep(4);
      }
    },
    [step, form, step1Fields, step2Fields]
  );

  const prevStep = useCallback(() => {
    if (step > 1) setStep(step - 1);
  }, [step]);

  // Upload selected documents to the server after form submission
  const uploadDocuments = useCallback(
    async (warishId: string) => {
      const fileEntries = Object.entries(selectedFiles) as [
        DocumentType,
        File,
      ][];
      if (fileEntries.length === 0) return;

      setUploadingDocs(true);
      let successCount = 0;
      let failCount = 0;

      for (const [docType, file] of fileEntries) {
        try {
          const formData = new FormData();
          formData.append("file", file);
          formData.append("warishId", warishId);
          formData.append("documentType", docType);

          const res = await fetch("/api/warish/upload", {
            method: "POST",
            body: formData,
          });
          if (res.ok) {
            successCount++;
          } else {
            failCount++;
          }
        } catch {
          failCount++;
        }
      }

      setUploadingDocs(false);

      if (successCount > 0) {
        toast({
          title: `${successCount} document(s) uploaded`,
          description:
            failCount > 0
              ? `${failCount} document(s) failed to upload.`
              : "All documents uploaded successfully.",
        });
      }
      if (failCount > 0 && successCount === 0) {
        toast({
          title: "Document upload failed",
          description: "Some documents could not be uploaded. Please use the upload page to retry.",
          variant: "destructive",
        });
      }
    },
    [selectedFiles, toast]
  );

  const handleNextClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      nextStep(e);
    },
    [nextStep]
  );

  const onSubmit = useCallback(
    async (data: WarishFormValuesType) => {
      if (step !== 4) {
        console.log("Form submission prevented - not in step 4");
        return;
      }

      console.log("Submitting form in step 4");

      let appId = "";
      let ack = "";
      let submissionSuccess = false;

      await new Promise<void>((resolve) => {
        startTransition(async () => {
          try {
            const result = await createNestedWarishDetails(data);
            if (result?.errors) {
              toast({
                title: "Error / ত্রুটি",
                description: result.message,
                variant: "destructive",
              });
            } else if (result?.success) {
              ack = result.data?.acknowlegment?.toString() || "";
              appId = result.data?.id || "";
              submissionSuccess = true;
              setAcnumber(ack);
              setApplicationId(appId);
              toast({
                title: "Success / সফল",
                description: ack,
              });
            }
          } catch (error) {
            console.error("Failed to add warish details:", error);
            toast({
              title: "Error / ত্রুটি",
              description:
                "An unexpected error occurred. Please try again. / একটি অপ্রত্যাশিত ত্রুটি ঘটেছে। অনুগ্রহ করে আবার চেষ্টা করুন।",
              variant: "destructive",
            });
          } finally {
            resolve();
          }
        });
      });

      if (submissionSuccess) {
        // Upload documents outside startTransition so async/await works correctly
        if (appId && Object.keys(selectedFiles).length > 0) {
          await uploadDocuments(appId);
        }
        resetForm();
        router.refresh();
      }
    },
    [step, startTransition, toast, resetForm, router, selectedFiles, uploadDocuments]
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        if (step !== 4) {
          e.preventDefault();
          nextStep();
        } else {
          e.preventDefault();
        }
      }
    };

    const formElement = formRef.current;
    formElement?.addEventListener("keydown", handleKeyDown);

    return () => formElement?.removeEventListener("keydown", handleKeyDown);
  }, [nextStep, step]);

  useEffect(() => {
    if (step === 4) {
      previewRef.current?.focus({ preventScroll: true });
    }
  }, [step]);

  return (
    <div className="container mx-auto px-4 md:px-6 py-6 md:py-10 max-w-6xl">
      <Form {...form}>
        <form
          ref={formRef}
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-7 md:space-y-9"
        >
          {showSuccessBanner && acnumber && (
            <div className="relative bg-gradient-to-r from-emerald-50 via-green-50 to-teal-50 p-4 md:p-5 rounded-2xl border border-emerald-200 flex items-start justify-between gap-4 shadow-lg shadow-emerald-100 animate-in slide-in-from-top-4 fade-in duration-500">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-emerald-100 to-green-100 rounded-full shadow-sm">
                  <CheckCircle2 className="h-7 w-7 text-emerald-600" />
                </div>
                <div>
                  <p className="font-bold text-emerald-900 text-sm md:text-base">
                    Application Submitted Successfully / আবেদন সফলভাবে জমা দেওয়া হয়েছে
                  </p>
                  <p className="text-sm text-emerald-700 mt-1">
                    Acknowledgment Number / স্বীকৃতি নম্বর:{" "}
                    <span className="font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md ml-1">{acnumber}</span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowSuccessBanner(false)}
                className="p-2 rounded-xl hover:bg-emerald-100 transition-colors transition-all duration-200 group flex-shrink-0"
              >
                <X className="h-5 w-5 text-emerald-600 group-hover:text-emerald-800" />
              </button>
            </div>
          )}

          <div className="flex justify-center mb-10">
            <ol className="flex items-center w-full max-w-4xl">
              {[
                { number: 1, label: "Applicant & Deceased", short: "Applicant" },
                { number: 2, label: "Warish Details", short: "Warish" },
                { number: 3, label: "Upload Documents", short: "Documents" },
                { number: 4, label: "Review & Submit", short: "Review" },
              ].map((stepData, index) => (
                <li
                  key={stepData.number}
                  className={cn(
                    "flex items-center relative z-10",
                    index > 0 ? "flex-1" : ""
                  )}
                >
                  {index > 0 && (
                    <div
                    className={cn(
                      "absolute h-1.5 w-full left-0 right-0 -top-[2px] z-0 rounded-full transition-all duration-500",
                      step >= stepData.number
                        ? "bg-gradient-to-r from-primary to-primary/80"
                        : "bg-gray-200"
                    )}
                    style={{ top: "18px" }}
                    ></div>
                  )}
                  <div className={cn(
                    "flex flex-col items-center relative z-10",
                    index === 0 ? "items-start" : "",
                    index === 3 ? "items-end" : ""
                  )}>
                    <div
                      className={cn(
                        "rounded-full h-10 w-10 flex items-center justify-center border-2 transition-all duration-300 shadow-md",
                        step === stepData.number
                          ? "bg-gradient-to-br from-primary to-primary/80 border-primary text-white scale-110 ring-4 ring-primary/20 shadow-lg shadow-primary/20"
                          : step > stepData.number
                          ? "bg-gradient-to-br from-primary to-primary/80 border-primary text-white shadow-primary/10"
                          : "bg-white border-gray-300 shadow-sm"
                      )}
                    >
                      {step > stepData.number ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : (
                        <span className="font-bold text-sm">{stepData.number}</span>
                      )}
                    </div>
                    <span className={cn(
                      "mt-3 text-xs font-semibold text-center transition-colors duration-300 max-w-[110px]",
                      step >= stepData.number ? "text-primary" : "text-gray-500",
                      "hidden sm:block"
                    )}>
                      {stepData.label}
                    </span>
                    <span className={cn(
                      "mt-3 text-[10px] font-bold text-center transition-colors duration-300 sm:hidden",
                      step >= stepData.number ? "text-primary" : "text-gray-500"
                    )}>
                      {stepData.short}
                    </span>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          {step === 1 && (
            <section aria-labelledby="step1-heading" className="animate-in fade-in slide-in-from-right-8 duration-500">
              <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-primary/15 via-primary/10 to-primary/5 px-6 py-5 border-b border-primary/10">
                  <h2
                    id="step1-heading"
                    className="text-xl md:text-2xl font-bold text-primary flex items-center gap-3"
                  >
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      <ClipboardList className="h-6 w-6" />
                    </div>
                    Applicant & Deceased Information / আবেদনকারী ও মৃত ব্যক্তির তথ্য
                  </h2>
                </div>
                <div className="p-5 md:p-8">
                  <ApplicationInfo form={form} />
                </div>
              </div>
            </section>
          )}

          {step === 2 && (
            <section aria-labelledby="step2-heading" className="animate-in fade-in slide-in-from-right-8 duration-500">
              <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-primary/15 via-primary/10 to-primary/5 px-6 py-5 border-b border-primary/10">
                  <h2
                    id="step2-heading"
                    className="text-xl md:text-2xl font-bold text-primary flex items-center gap-3"
                  >
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      <Users className="h-6 w-6" />
                    </div>
                    Warish Details / ওয়ারিশ তথ্য
                  </h2>
                </div>
                <div className="p-5 md:p-8">
                  <WarishTable form={form} />
                </div>
              </div>
            </section>
          )}

          {step === 3 && (
            <section aria-labelledby="step3-heading" className="animate-in fade-in slide-in-from-right-8 duration-500">
              <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-primary/15 via-primary/10 to-primary/5 px-6 py-5 border-b border-primary/10">
                  <h2
                    id="step3-heading"
                    className="text-xl md:text-2xl font-bold text-primary flex items-center gap-3"
                  >
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      <UploadCloud className="h-6 w-6" />
                    </div>
                    Upload Documents / নথি আপলোড করুন
                  </h2>
                </div>
                <div className="p-5 md:p-8">
                  <DocumentUploadStep
                    selectedFiles={selectedFiles}
                    onFileSelect={handleFileSelect}
                    onFileRemove={handleFileRemove}
                    uploading={uploadingDocs}
                  />
                </div>
              </div>
            </section>
          )}

          {step === 4 && (
            <section aria-labelledby="step4-heading" className="animate-in fade-in slide-in-from-right-8 duration-500">
              <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-primary/15 via-primary/10 to-primary/5 px-6 py-5 border-b border-primary/10">
                  <h2
                    id="step4-heading"
                    className="text-xl md:text-2xl font-bold text-primary flex items-center gap-3"
                  >
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      <Eye className="h-6 w-6" />
                    </div>
                    Review Application / আবেদন পর্যালোচনা
                  </h2>
                </div>
                <div className="p-5 md:p-8">
                  <div
                    ref={previewRef}
                    tabIndex={-1}
                    className="focus:outline-none"
                  >
                    <FormPreview values={form.getValues()} />
                    {Object.keys(selectedFiles).length > 0 && (
                      <div className="mt-8 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border border-blue-200 rounded-2xl p-5 shadow-sm">
                        <h4 className="font-bold text-blue-900 mb-4 flex items-center gap-2">
                          <div className="p-1.5 bg-blue-100 rounded-lg">
                            <UploadCloud className="h-4 w-4 text-blue-700" />
                          </div>
                          Documents to be uploaded / আপলোড করা নথিসমূহ ({Object.keys(selectedFiles).length})
                        </h4>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {(Object.entries(selectedFiles) as [DocumentType, File][]).map(
                            ([docType, file]) => (
                              <li
                                key={docType}
                                className="flex items-center gap-3 p-3 bg-white rounded-xl border border-blue-100 shadow-sm"
                              >
                                <FileCheck className="h-4 w-4 text-green-600 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <span className="text-xs font-bold text-blue-800 capitalize block">
                                    {docType.replace(/_/g, " ")}
                                  </span>
                                  <span className="text-xs text-gray-600 truncate block">
                                    {file.name}
                                  </span>
                                </div>
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>
          )}

          <div className="flex flex-col sm:flex-row justify-between gap-4 mt-10 pt-6 border-t border-gray-100">
            {step > 1 && (
              <Button
                type="button"
                onClick={prevStep}
                variant="outline"
                className="flex items-center gap-2 h-12 px-6 w-full sm:w-auto rounded-xl font-semibold border-2 hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow"
              >
                <ChevronLeft className="h-5 w-5" />
                Previous Step / পূর্ববর্তী ধাপ
              </Button>
            )}

            <div className="flex-1" />

            {step < 4 ? (
              <Button
                type="button"
                onClick={handleNextClick}
                className="h-12 px-8 w-full sm:w-auto bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary rounded-xl font-bold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 hover:-translate-y-0.5"
              >
                {step === 1
                  ? "Next: Warish Details"
                  : step === 2
                  ? "Next: Upload Documents"
                  : "Review Application / পর্যালোচনা করুন"}
                <ChevronRight className="h-5 w-5 ml-2" />
              </Button>
            ) : (
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(3)}
                  className="h-12 px-6 rounded-xl font-semibold border-2 hover:bg-gray-50 transition-all duration-200 shadow-sm"
                >
                  Edit Documents / নথি সম্পাদনা
                </Button>
                <Button
                  type="submit"
                  className="h-12 px-8 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary rounded-xl font-bold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0"
                  disabled={isPending || uploadingDocs}
                >
                  {isPending || uploadingDocs ? (
                    <span className="flex items-center gap-2">
                      <span className="inline-block h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>
                        {uploadingDocs ? "Uploading documents..." : "Submitting..."}
                      </span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <SendHorizonal className="w-5 h-5" />
                      Submit Application / আবেদন জমা দিন
                    </span>
                  )}
                </Button>
              </div>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
}
