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
  <div className="space-y-4">
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2">
      <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
      <p className="text-sm text-blue-800">
        Upload required documents for your warish application. Documents marked as
        <span className="font-semibold text-red-600"> Required</span> must be uploaded.
        You can also upload optional documents to support your application.
      </p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {DOCUMENT_TYPES.map((docType) => {
        const file = selectedFiles[docType.type];
        return (
          <div
            key={docType.type}
            className={cn(
              "border rounded-xl p-4 transition-all duration-200",
              file
                ? "border-green-200 bg-green-50/50"
                : "border-gray-200 bg-white hover:border-primary/30"
            )}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    "p-1.5 rounded-md",
                    file ? "bg-green-100" : "bg-primary/10"
                  )}
                >
                  {file ? (
                    <FileCheck className="h-4 w-4 text-green-600" />
                  ) : (
                    <FileText className="h-4 w-4 text-primary" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">
                    {docType.title}
                  </p>
                  <p className="text-xs text-gray-500">{docType.description}</p>
                </div>
              </div>
              {docType.required && (
                <span className="text-xs font-medium text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                  Required
                </span>
              )}
            </div>

            {/* File picker */}
            {file ? (
              <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                <FileText className="h-4 w-4 text-green-600 flex-shrink-0" />
                <span className="text-xs text-green-800 truncate flex-1">
                  {file.name}
                </span>
                <button
                  type="button"
                  onClick={() => onFileRemove(docType.type)}
                  disabled={uploading}
                  className="p-1 rounded-full hover:bg-green-200 transition-colors"
                >
                  <X className="h-3 w-3 text-green-700" />
                </button>
              </div>
            ) : (
              <label
                htmlFor={`warish-doc-${docType.type}`}
                className={cn(
                  "flex items-center justify-center gap-2 p-3 border-2 border-dashed rounded-lg cursor-pointer transition-colors",
                  "border-gray-300 hover:border-primary/50 hover:bg-primary/5",
                  uploading && "opacity-50 cursor-not-allowed"
                )}
              >
                <UploadCloud className="h-4 w-4 text-gray-400" />
                <span className="text-xs text-gray-500">
                  Click to browse or drag & drop
                </span>
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

    <p className="text-xs text-gray-400 text-center">
      Accepted formats: PDF, JPEG, PNG &bull; Max file size: 5MB per document
    </p>
  </div>
);

const FormPreview = ({ values }: { values: WarishFormValuesType }) => (
  <div className="space-y-6 focus:outline-none">
    <div className="bg-white p-4 md:p-6 rounded-xl border border-gray-200 shadow-sm">
      <div className="bg-primary/10 px-4 py-3 rounded-lg mb-4">
        <h3 className="font-bold text-lg text-primary flex items-center gap-2">
          <ClipboardList className="h-5 w-5" />
          Applicant & Deceased Information
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
          <h4 className="font-medium mb-3 text-gray-700 flex items-center gap-2">
            <span className="bg-primary/10 text-primary p-1 rounded-full">
              <Users className="h-4 w-4" />
            </span>
            Applicant Details
          </h4>
          <dl className="space-y-3">
            {[
              { label: "Name", value: values.applicantName },
              { label: "Mobile Number", value: values.applicantMobileNumber },
              { label: "Fathers Name", value: values.fatherName },
              { label: "Village", value: values.villageName },
              { label: "Post Office", value: values.postOffice },
            ].map((item, idx) => (
              <div key={idx} className="flex">
                <dt className="text-sm text-gray-500 w-1/3">{item.label}</dt>
                <dd className="font-medium text-gray-800 flex-1">
                  {item.value || "N/A"}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
          <h4 className="font-medium mb-3 text-gray-700 flex items-center gap-2">
            <span className="bg-primary/10 text-primary p-1 rounded-full">
              <Users className="h-4 w-4" />
            </span>
            Deceased Details
          </h4>
          <dl className="space-y-3">
            {[
              { label: "Name", value: values.nameOfDeceased },
              {
                label: "Date of Death",
                value: values.dateOfDeath
                  ? formatDate(values.dateOfDeath)
                  : "N/A",
              },
              {
                label: "Relation with Applicant",
                value: values.relationwithdeceased,
              },
              { label: "Gender", value: values.gender },
              { label: "Marital Status", value: values.maritialStatus },
            ].map((item, idx) => (
              <div key={idx} className="flex">
                <dt className="text-sm text-gray-500 w-1/3">{item.label}</dt>
                <dd className="font-medium text-gray-800 flex-1">
                  {item.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>

    <div className="bg-white p-4 md:p-6 rounded-xl border border-gray-200 shadow-sm">
      <div className="bg-primary/10 px-4 py-3 rounded-lg mb-4">
        <h3 className="font-bold text-lg text-primary flex items-center gap-2">
          <Users className="h-5 w-5" />
          Warish Details
        </h3>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              {[
                "Name",
                "Relation",
                "Gender",
                "Living Status",
                "Spouse Name",
              ].map((header, idx) => (
                <th
                  key={idx}
                  className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
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
                      className={cn(index % 2 === 0 ? "bg-white" : "bg-gray-50", depth > 0 && "bg-muted/20")}
                    >
                      <td className="px-4 py-3 text-sm text-gray-900">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500 font-mono text-xs w-8 text-right inline-block">
                            {currentIndex}
                          </span>
                           <div style={{ paddingLeft: `${depth * 20}px` }}> {/* Visual indentation */}
                            {warish.name}
                           </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {warish.relation}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {warish.gender}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        <span
                          className={cn(
                            "px-2 py-1 rounded-full text-xs",
                            warish.livingStatus === "Alive" || warish.livingStatus === "alive"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          )}
                        >
                          {warish.livingStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {warish.husbandName || "N/A"}
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
      <div className="mt-4 flex justify-between items-center">
        <p className="text-sm text-gray-500">
          Total Warish: {values.warishDetails?.length || 0}
        </p>
        <p className="text-sm font-medium text-primary">
          Please review all information before submitting
        </p>
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

  const resetForm = useCallback(() => {
    form.reset(defaultValues);
    setStep(1);
  }, [form]);

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
    <div className="container mx-auto px-4 md:px-6 py-8">
      <Form {...form}>
        <form
          ref={formRef}
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6 md:space-y-8"
        >
          {acnumber && (
            <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 flex items-center gap-3 shadow-sm">
              <CheckCircle2 className="h-6 w-6 text-emerald-600 flex-shrink-0" />
              <div>
                <p className="font-medium text-emerald-800">
                  Application Submitted Successfully
                </p>
                <p className="text-sm text-emerald-700 mt-1">
                  Acknowledgment Number:{" "}
                  <span className="font-semibold">{acnumber}</span>
                </p>
              </div>
            </div>
          )}

          <div className="flex justify-center mb-8">
            <ol className="flex items-center w-full max-w-3xl">
              {[
                { number: 1, label: "Applicant & Deceased" },
                { number: 2, label: "Warish Details" },
                { number: 3, label: "Upload Documents" },
                { number: 4, label: "Review & Submit" },
              ].map((stepData, index) => (
                <li
                  key={stepData.number}
                  className={cn(
                    "flex items-center relative",
                    index > 0 ? "flex-1" : "",
                    step >= stepData.number ? "text-primary" : "text-gray-400"
                  )}
                >
                  {index > 0 && (
                    <div
                      className={cn(
                        "absolute h-1 w-full top-4 -z-10",
                        step >= stepData.number ? "bg-primary" : "bg-gray-200"
                      )}
                    ></div>
                  )}
                  <div className="flex flex-col items-center">
                    <div
                      className={cn(
                        "rounded-full h-8 w-8 flex items-center justify-center border-2",
                        step === stepData.number
                          ? "bg-primary border-primary text-white"
                          : step > stepData.number
                          ? "bg-primary border-primary text-white"
                          : "bg-white border-gray-300"
                      )}
                    >
                      {step > stepData.number ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        stepData.number
                      )}
                    </div>
                    <span className="mt-2 text-xs font-medium text-center max-w-[100px]">
                      {stepData.label}
                    </span>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          {step === 1 && (
            <section aria-labelledby="step1-heading">
              <div className="bg-white p-1 rounded-xl border border-gray-200 shadow-md">
                <div className="bg-primary/10 px-5 py-4 rounded-t-xl">
                  <h2
                    id="step1-heading"
                    className="text-xl font-bold text-primary flex items-center gap-3"
                  >
                    <ClipboardList className="h-6 w-6" />
                    Applicant & Deceased Information
                  </h2>
                </div>
                <div className="p-4 md:p-6">
                  <ApplicationInfo form={form} />
                </div>
              </div>
            </section>
          )}

          {step === 2 && (
            <section aria-labelledby="step2-heading">
              <div className="bg-white p-1 rounded-xl border border-gray-200 shadow-md">
                <div className="bg-primary/10 px-5 py-4 rounded-t-xl">
                  <h2
                    id="step2-heading"
                    className="text-xl font-bold text-primary flex items-center gap-3"
                  >
                    <Users className="h-6 w-6" />
                    Warish Details / ওয়ারিশ তথ্য
                  </h2>
                </div>
                <div className="p-4 md:p-6">
                  <WarishTable form={form} />
                </div>
              </div>
            </section>
          )}

          {step === 3 && (
            <section aria-labelledby="step3-heading">
              <div className="bg-white p-1 rounded-xl border border-gray-200 shadow-md">
                <div className="bg-primary/10 px-5 py-4 rounded-t-xl">
                  <h2
                    id="step3-heading"
                    className="text-xl font-bold text-primary flex items-center gap-3"
                  >
                    <UploadCloud className="h-6 w-6" />
                    Upload Documents / নথি আপলোড করুন
                  </h2>
                </div>
                <div className="p-4 md:p-6">
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
            <section aria-labelledby="step4-heading">
              <div className="bg-white p-1 rounded-xl border border-gray-200 shadow-md">
                <div className="bg-primary/10 px-5 py-4 rounded-t-xl">
                  <h2
                    id="step4-heading"
                    className="text-xl font-bold text-primary flex items-center gap-3"
                  >
                    <Eye className="h-6 w-6" />
                    Review Application / আবেদন পর্যালোচনা
                  </h2>
                </div>
                <div className="p-4 md:p-6">
                  <div
                    ref={previewRef}
                    tabIndex={-1}
                    className="focus:outline-none"
                  >
                    <FormPreview values={form.getValues()} />
                    {/* Show summary of selected documents */}
                    {Object.keys(selectedFiles).length > 0 && (
                      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
                        <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                          <UploadCloud className="h-4 w-4" />
                          Documents to be uploaded ({Object.keys(selectedFiles).length})
                        </h4>
                        <ul className="space-y-1">
                          {(Object.entries(selectedFiles) as [DocumentType, File][]).map(
                            ([docType, file]) => (
                              <li
                                key={docType}
                                className="flex items-center gap-2 text-sm text-blue-700"
                              >
                                <FileCheck className="h-3.5 w-3.5 text-green-600" />
                                <span className="font-medium capitalize">
                                  {docType.replace(/_/g, " ")}:
                                </span>
                                <span className="truncate">{file.name}</span>
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

          <div className="flex flex-col sm:flex-row justify-between gap-3 mt-8">
            {step > 1 && (
              <Button
                type="button"
                onClick={prevStep}
                variant="outline"
                className="flex items-center gap-2 py-6 w-full sm:w-auto"
              >
                <ChevronLeft className="h-5 w-5" />
                Previous Step
              </Button>
            )}

            <div className="flex-1" />

            {step < 4 ? (
              <Button
                type="button"
                onClick={handleNextClick}
                className="py-6 w-full sm:w-auto bg-primary hover:bg-primary/90"
              >
                {step === 1
                  ? "Next: Warish Details"
                  : step === 2
                  ? "Next: Upload Documents"
                  : "Review Application"}
                <ChevronRight className="h-5 w-5 ml-2" />
              </Button>
            ) : (
              <div className="flex flex-col sm:flex-row gap-3 w-full">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(3)}
                  className="py-6"
                >
                  Edit Documents
                </Button>
                <Button
                  type="submit"
                  className="py-6 bg-primary hover:bg-primary/90"
                  disabled={isPending || uploadingDocs}
                >
                  {isPending || uploadingDocs ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-pulse">
                        {uploadingDocs ? "Uploading documents..." : "Submitting..."}
                      </span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <SendHorizonal className="w-5 h-5" />
                      Submit Application
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
