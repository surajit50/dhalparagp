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
} from "lucide-react";
import { formatDate } from "@/utils/utils";
import { cn } from "@/lib/utils";

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
      }
    },
    [step, form, step1Fields, step2Fields]
  );

  const prevStep = useCallback(() => {
    if (step > 1) setStep(step - 1);
  }, [step]);

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
      if (step !== 3) {
        console.log("Form submission prevented - not in step 3");
        return;
      }

      console.log("Submitting form in step 3");
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
            resetForm();
            toast({
              title: "Success / সফল",
              description: result.data?.acknowlegment?.toString(),
            });
            setAcnumber(result.data?.acknowlegment?.toString() || "");
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
          router.refresh();
        }
      });
    },
    [step, startTransition, toast, resetForm, router]
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        if (step !== 3) {
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
    if (step === 3) {
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
            <ol className="flex items-center w-full max-w-2xl">
              {[
                { number: 1, label: "Applicant & Deceased" },
                { number: 2, label: "Warish Details" },
                { number: 3, label: "Review & Submit" },
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

            {step < 3 ? (
              <Button
                type="button"
                onClick={handleNextClick}
                className="py-6 w-full sm:w-auto bg-primary hover:bg-primary/90"
              >
                {step === 1 ? "Next: Warish Details" : "Review Application"}
                <ChevronRight className="h-5 w-5 ml-2" />
              </Button>
            ) : (
              <div className="flex flex-col sm:flex-row gap-3 w-full">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(2)}
                  className="py-6"
                >
                  Edit Details
                </Button>
                <Button
                  type="submit"
                  className="py-6 bg-primary hover:bg-primary/90"
                  disabled={isPending}
                >
                  {isPending ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-pulse">Submitting...</span>
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
