"use client";

import { useEffect, useRef, useState, useTransition, useMemo } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
  FormControl,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import CustomFormField, { FormFieldType } from "@/components/CustomFormField";
import { bookNitNumber } from "@/action/bookNitNuber";
import {
  AlertCircle,
  CheckCircle2,
  FileText,
  Calendar,
  MapPin,
  Clock,
  PlusCircle,
  Loader2,
  FileCheck,
  ChevronLeft,
  ChevronRight,
  Route,
} from "lucide-react";
import { NitBookValidationSchema } from "@/schema";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { FaPercentage } from "react-icons/fa";
import { useRouter } from "next/navigation";

type FormValues = z.infer<typeof NitBookValidationSchema>;
const generateTimeOptions = () => {
  const times: Date[] = [];

  const start = new Date();
  start.setHours(9, 0, 0);

  const end = new Date();
  end.setHours(18, 55, 0);

  const current = new Date(start);

  while (current <= end) {
    times.push(new Date(current));
    current.setMinutes(current.getMinutes() + 5);
  }

  return times;
};
interface TenderTermTemplate {
  id: string;
  name: string;
  description: string | null;
  content?: {
    eligible?: string[];
    qualificationCriteria?: string[];
    termsConditions?: string[];
  };
}

// Define steps for the form
const FORM_STEPS = [
  { id: 1, title: "Tender Details", icon: <FileText /> },
  { id: 2, title: "Schedule & Timeline", icon: <Calendar /> },
  { id: 3, title: "Bid Information", icon: <MapPin /> },
  { id: 4, title: "Work Value", icon: <FaPercentage /> },
  { id: 5, title: "Term Templates", icon: <FileCheck /> },
];

export default function BookNitForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<{ error?: string; success?: string }>(
    {},
  );
  const [templates, setTemplates] = useState<TenderTermTemplate[]>([]);
  const router = useRouter();
  const [templateState, setTemplateState] = useState({
    loading: true,
    error: null as string | null,
  });
  const [optimisticSubmission, setOptimisticSubmission] =
    useState<FormValues | null>(null);

  // Multi-step form state
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const form = useForm<FormValues>({
    resolver: zodResolver(NitBookValidationSchema),
    defaultValues: {
      tendermemonumber: "",
      tendermemodate: undefined,
      tender_pulishing_Date: undefined,
      tender_document_Download_from: undefined,
      tender_start_time_from: undefined,
      tender_end_date_time_from: undefined,
      tender_techinical_bid_opening_date: undefined,
      tender_financial_bid_opening_date: undefined,
      tender_place_opening_bids: "",
      tender_vilidity_bids: "",
      supplynit: false,
      supplyitemname: "",
      nitCount: "1st call",
      percentageofworkvaluerequired: 60,
      termsTemplateIds: [],
    },
  });

  // Optimistic preview of selected templates
  const selectedTemplateIds = form.watch("termsTemplateIds");
  const selectedTemplates = useMemo(() => {
    return templates.filter((t) => selectedTemplateIds?.includes(t.id));
  }, [templates, selectedTemplateIds]);

  /* ------------------------ Fetch Templates ------------------------ */
  useEffect(() => {
    const loadTemplates = async () => {
      setTemplateState((s) => ({ ...s, loading: true }));
      try {
        const res = await fetch("/api/tender-term-templates?isActive=true");
        if (!res.ok) throw new Error("Failed to load templates");
        const data = await res.json();
        setTemplates(data);
        setTemplateState({ loading: false, error: null });
      } catch (err) {
        setTemplateState({
          loading: false,
          error:
            err instanceof Error ? err.message : "Failed to load templates",
        });
        toast.error("Failed to load templates");
      }
    };
    loadTemplates();
  }, []);

  /* ------------------------ Step Navigation ------------------------ */
  const nextStep = async () => {
    // Validate current step before proceeding
    const fieldsToValidate = getStepFields(currentStep);
    const isValid = await form.trigger(fieldsToValidate as any);

    if (isValid) {
      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps([...completedSteps, currentStep]);
      }

      if (currentStep < FORM_STEPS.length) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (step: number) => {
    if (step <= currentStep || completedSteps.includes(step - 1)) {
      setCurrentStep(step);
    }
  };

  const getStepFields = (step: number): (keyof FormValues)[] => {
    switch (step) {
      case 1:
        return ["tendermemonumber", "tendermemodate", "nitCount"];
      case 2:
        return [
          "tender_pulishing_Date",
          "tender_document_Download_from",
          "tender_start_time_from",
          "tender_end_date_time_from",
          "tender_techinical_bid_opening_date",
          "tender_financial_bid_opening_date",
        ];
      case 3:
        return [
          "tender_place_opening_bids",
          "tender_vilidity_bids",
          "supplynit",
          "supplyitemname",
        ];
      case 4:
        return ["percentageofworkvaluerequired"];
      case 5:
        return ["termsTemplateIds"];
      default:
        return [];
    }
  };

  /* ------------------------ Optimistic Submit Handler ------------------------ */
  const onSubmit = (values: FormValues) => {
    setStatus({});
    setOptimisticSubmission(values);
    startTransition(async () => {
      try {
        const result = await bookNitNumber(values);

        if (result?.success) {
          toast.success("Tender created successfully!", {
            description: "The tender has been booked and is now active.",
          });

          setTimeout(() => {
            formRef.current?.reset();
            form.reset();
            setOptimisticSubmission(null);
            setCurrentStep(1);
            setCompletedSteps([]);
          }, 1500);

          setStatus({ success: result.success });
          router.push("/admindashboard/manage-tender/view");
        }

        if (result?.error) {
          toast.error("Submission failed", {
            description: result.error,
          });
          setStatus({ error: result.error });
          setOptimisticSubmission(null);
        }
      } catch {
        toast.error("Unexpected error", {
          description: "An unexpected error occurred. Please try again.",
        });
        setStatus({ error: "Unexpected error occurred. Try again." });
        setOptimisticSubmission(null);
      }
    });
  };

  /* ---------------- Template Selection Card ---------------- */
  const TemplateCard = ({
    t,
    selected,
    toggle,
  }: {
    t: TenderTermTemplate;
    selected: boolean;
    toggle: (id: string) => void;
  }) => {
    const counts = {
      eligible: t.content?.eligible?.length ?? 0,
      qualification: t.content?.qualificationCriteria?.length ?? 0,
      terms: t.content?.termsConditions?.length ?? 0,
    };

    return (
      <motion.div
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        <div className="relative">
          <Checkbox
            checked={selected}
            onCheckedChange={() => toggle(t.id)}
            className="mt-1 h-5 w-5 border-2 data-[state=checked]:bg-teal-600"
            onClick={() => toggle(t.id)}
          />
          {selected && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
              <CheckCircle2 className="h-3 w-3 text-white" />
            </motion.div>
          )}
        </div>

        <div className="flex-1 space-y-3">
          <div className="flex justify-between items-center flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <FileCheck
                className={cn(
                  "h-4 w-4",
                  selected ? "text-teal-600" : "text-gray-400",
                )}
              />
              <span
                className={cn(
                  "font-bold",
                  selected ? "text-teal-900" : "text-gray-900",
                )}
              >
                {t.name}
              </span>
            </div>

            <div className="flex gap-2 flex-wrap">
              {counts.eligible > 0 && (
                <Badge
                  variant={selected ? "default" : "outline"}
                  className="text-xs"
                >
                  🎯 {counts.eligible}
                </Badge>
              )}
              {counts.qualification > 0 && (
                <Badge
                  variant={selected ? "default" : "outline"}
                  className="text-xs"
                >
                  📋 {counts.qualification}
                </Badge>
              )}
              {counts.terms > 0 && (
                <Badge
                  variant={selected ? "default" : "outline"}
                  className="text-xs"
                >
                  📝 {counts.terms}
                </Badge>
              )}
            </div>
          </div>

          <p className="text-sm text-gray-600 line-clamp-2">
            {t.description ?? "Standard tender terms and conditions template"}
          </p>
        </div>
      </motion.div>
    );
  };

  /* ------------------------ Optimistic Preview Section ------------------------ */
  const OptimisticPreview = () => {
    if (!optimisticSubmission) return null;
    return (
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        exit={{ opacity: 0, height: 0 }}
      >
        <div className="flex items-center gap-3 mb-3">
          <Clock className="h-5 w-5 text-blue-600 animate-spin" />
          <h3 className="font-semibold text-blue-900">Creating tender...</h3>
          <Badge variant="outline" className="ml-auto text-xs">
            Processing
          </Badge>
        </div>
        <div className="text-sm text-blue-700 space-y-1">
          <p>
            <span className="font-medium">Reference:</span>{" "}
            {optimisticSubmission.tendermemonumber}
          </p>
          <p>
            <span className="font-medium">NIT Count:</span>{" "}
            {optimisticSubmission.nitCount}
          </p>
          {optimisticSubmission.supplyitemname && (
            <p>
              <span className="font-medium">Item:</span>{" "}
              {optimisticSubmission.supplyitemname}
            </p>
          )}
        </div>
      </motion.div>
    );
  };

  /* ------------------------ Step 1: Tender Details ------------------------ */
  const Step1 = () => (
    <Section title="Tender Details" icon={<FileText />} count={1}>
      <div className="space-y-4">
        <div className="text-sm text-gray-600 mb-2">
          Basic information about the tender
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <FormItemWrapper
            label="Tender Reference Number"
            description="Unique identifier for this tender"
          >
            <CustomFormField
              fieldType={FormFieldType.INPUT}
              control={form.control}
              name="tendermemonumber"
            />
          </FormItemWrapper>

          <FormItemWrapper
            label="Booking Date"
            description="Date when the tender is booked"
          >
            <CustomFormField
              fieldType={FormFieldType.DATE_PICKER}
              control={form.control}
              name="tendermemodate"
              dateFormat="dd/MM/yyyy"
            />
          </FormItemWrapper>

          <div className="md:col-span-2">
            <FormItemWrapper
              label="NIT Call Number"
              description="Number of times NIT has been called"
            >
              <CustomFormField
                fieldType={FormFieldType.SELECT}
                control={form.control}
                name="nitCount"
                options={[
                  { value: "1st call", label: "1st Call" },
                  { value: "2nd call", label: "2nd Call" },
                  { value: "3rd call", label: "3rd Call" },
                ]}
              />
            </FormItemWrapper>
          </div>
        </div>
      </div>
    </Section>
  );

  /* ------------------------ Step 2: Tender Schedule ------------------------ */
  const Step2 = () => {
    const allowedTimes = useMemo(() => generateTimeOptions(), []);

    const tenderScheduleFields = useMemo(
      () => [
        { name: "tender_pulishing_Date", label: "Publishing Date" },
        { name: "tender_document_Download_from", label: "Download From" },
        { name: "tender_start_time_from", label: "Start Time" },
        { name: "tender_end_date_time_from", label: "End Date/Time" },
        {
          name: "tender_techinical_bid_opening_date",
          label: "Tech Bid Opening",
        },
        {
          name: "tender_financial_bid_opening_date",
          label: "Financial Bid Opening",
        },
      ],
      [],
    );

    return (
      <Section title="Tender Schedule & Timeline" icon={<Calendar />} count={2}>
        <div className="space-y-4">
          <div className="text-sm text-gray-600 mb-2">
            Important dates and times for the tender process
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tenderScheduleFields.map((field) => (
              <FormItemWrapper key={field.name} label={field.label}>
                <CustomFormField
                  fieldType={FormFieldType.DATE_PICKER}
                  control={form.control}
                  name={field.name as keyof FormValues}
                  // ✅ 24-hour
                  dateFormat="dd/MM/yyyy HH:mm"
                  showTimeSelect
                  // ✅ ONLY SHOW VALID TIMES
                  includeTimes={allowedTimes}
                />
              </FormItemWrapper>
            ))}
          </div>
        </div>
      </Section>
    );
  };
  /* ------------------------ Step 3: Bid Details ------------------------ */
  const Step3 = () => (
    <Section title="Bid Information" icon={<MapPin />} count={3}>
      <div className="space-y-4">
        <div className="text-sm text-gray-600 mb-2">
          Bid submission and opening details
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <FormItemWrapper
            label="Bid Opening Venue"
            description="Physical location for bid opening"
          >
            <CustomFormField
              fieldType={FormFieldType.INPUT}
              control={form.control}
              name="tender_place_opening_bids"
            />
          </FormItemWrapper>

          <FormItemWrapper
            label="Bid Validity Period"
            description="Duration for which bids remain valid (e.g., 90 days)"
          >
            <CustomFormField
              fieldType={FormFieldType.INPUT}
              control={form.control}
              name="tender_vilidity_bids"
            />
          </FormItemWrapper>

          <div className="md:col-span-2">
            <div className="flex items-center space-x-3 p-4 border rounded-lg bg-gray-50">
              <CustomFormField
                fieldType={FormFieldType.CHECKBOX}
                control={form.control}
                name="supplynit"
                label="This is a Supply NIT"
              />
            </div>
          </div>

          <AnimatePresence>
            {form.watch("supplynit") && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                <FormItemWrapper
                  label="Supply Item Name"
                  description="Required for supply tenders"
                >
                  <CustomFormField
                    fieldType={FormFieldType.INPUT}
                    control={form.control}
                    name="supplyitemname"
                  />
                </FormItemWrapper>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Section>
  );

  /* ------------------------ Step 4: Work Value ------------------------ */
  const Step4 = () => (
    <Section
      title="Percentage of Work Value Required"
      icon={<FaPercentage />}
      count={4}
    >
      <div className="space-y-4">
        <div className="text-sm text-gray-600 mb-2">
          Percentage of work value required (1-100)
        </div>
        <FormField
          control={form.control}
          name="percentageofworkvaluerequired"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Percentage (%)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={1}
                  max={100}
                  placeholder="Enter percentage (1-100)"
                  {...field}
                  value={field.value ?? 60}
                  onChange={(e) => {
                    const value =
                      e.target.value === "" ? 60 : Number(e.target.value);
                    field.onChange(value);
                  }}
                  className="h-11 rounded-lg border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                />
              </FormControl>
              <FormDescription>Enter a value between 1 and 100</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </Section>
  );

  /* ------------------------ Step 5: Term Templates ------------------------ */
  const Step5 = () => (
    <Section title="Term Templates" icon={<FileText />} count={5}>
      <div className="space-y-4">
        <div className="text-sm text-gray-600 mb-2">
          Select pre-defined templates for tender terms and conditions
        </div>
        <FormField
          control={form.control}
          name="termsTemplateIds"
          render={({ field }) => {
            const selected = field.value ?? [];
            const toggle = (id: string) => {
              field.onChange(
                selected.includes(id)
                  ? selected.filter((x) => x !== id)
                  : [...selected, id],
              );
            };

            const hasSelected = selected.length > 0;

            return (
              <div className="space-y-6">
                {/* Selected Templates Preview */}
                {hasSelected && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-blue-900">
                        Selected Templates ({selected.length})
                      </h4>
                      <Badge variant="outline" className="bg-white">
                        {selected.length} selected
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {selectedTemplates.map((template) => (
                        <Badge
                          key={template.id}
                          variant="secondary"
                          className="gap-1"
                        >
                          <FileCheck className="h-3 w-3" />
                          {template.name}
                        </Badge>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Template List */}
                <div className="space-y-3">
                  {templateState.loading ? (
                    <LoadingSkeleton count={3} />
                  ) : templateState.error ? (
                    <ErrorMessage text={templateState.error} />
                  ) : !templates.length ? (
                    <EmptyMessage link="/admindashboard/manage-tender/templates" />
                  ) : (
                    <AnimatePresence>
                      {templates.map((t) => (
                        <TemplateCard
                          key={t.id}
                          t={t}
                          selected={selected.includes(t.id)}
                          toggle={toggle}
                        />
                      ))}
                    </AnimatePresence>
                  )}
                </div>

                {/* Quick Actions */}
                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => field.onChange([])}
                    disabled={selected.length === 0}
                  >
                    Clear All
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="gap-2"
                    asChild
                  >
                    <Link href="/admindashboard/manage-tender/templates">
                      <PlusCircle className="h-4 w-4" />
                      New Template
                    </Link>
                  </Button>
                </div>
              </div>
            );
          }}
        />
      </div>
    </Section>
  );

  /* ------------------------ Step Renderer ------------------------ */
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1 />;
      case 2:
        return <Step2 />;
      case 3:
        return <Step3 />;
      case 4:
        return <Step4 />;
      case 5:
        return <Step5 />;
      default:
        return <Step1 />;
    }
  };

  /* ----------------------------- Main JSX ----------------------------- */
  return (
    <div className=" mx-auto bg-gradient-to-br from-white via-blue-50/20 to-indigo-50/30 shadow-xl rounded-2xl border border-gray-200 my-4 sm:my-8 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-teal-600 px-4 sm:px-8 py-4 sm:py-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="p-2 sm:p-3 bg-white/20 rounded-xl backdrop-blur-sm shrink-0">
              <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white">
                Create New Tender
              </h1>
              <p className="text-sm sm:text-base text-blue-100">
                Book NIT number and configure details
              </p>
            </div>
          </div>
          <Badge
            variant="secondary"
            className="text-xs sm:text-sm whitespace-nowrap"
          >
            Step {currentStep} of {FORM_STEPS.length}
          </Badge>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="px-4 sm:px-8 pt-4 sm:pt-6 overflow-x-auto pb-4 scrollbar-hide">
        <div className="flex items-center justify-between min-w-max md:min-w-0 px-2">
          {FORM_STEPS.map((step, index) => {
            const isActive = step.id === currentStep;
            const isCompleted = completedSteps.includes(step.id);
            const isClickable =
              step.id <= currentStep || completedSteps.includes(step.id - 1);

            return (
              <div key={step.id} className="flex items-center">
                <button
                  type="button"
                  onClick={() => isClickable && goToStep(step.id)}
                  disabled={!isClickable}
                  className={cn(
                    "flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full transition-all duration-300 shrink-0",
                    isActive
                      ? "bg-blue-600 text-white ring-4 ring-blue-100"
                      : isCompleted
                        ? "bg-teal-500 text-white"
                        : "bg-gray-200 text-gray-600",
                    isClickable && "hover:scale-105 hover:shadow-md",
                  )}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5" />
                  ) : (
                    step.icon
                  )}
                </button>

                {/* Hide text on mobile, show on md and up */}
                <div className="ml-3 hidden md:block">
                  <p
                    className={cn(
                      "text-xs font-medium",
                      isActive
                        ? "text-blue-700"
                        : isCompleted
                          ? "text-teal-700"
                          : "text-gray-500",
                    )}
                  >
                    Step {step.id}
                  </p>
                  <p
                    className={cn(
                      "text-sm font-semibold whitespace-nowrap",
                      isActive
                        ? "text-blue-900"
                        : isCompleted
                          ? "text-teal-900"
                          : "text-gray-600",
                    )}
                  >
                    {step.title}
                  </p>
                </div>

                {index < FORM_STEPS.length - 1 && (
                  <div
                    className={cn(
                      "w-8 sm:w-12 md:w-16 h-1 mx-2 sm:mx-4 rounded-full",
                      step.id < currentStep ? "bg-teal-500" : "bg-gray-300",
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <Form {...form}>
        <form
          ref={formRef}
          onSubmit={form.handleSubmit(onSubmit)}
          className="p-4 sm:p-8 space-y-6 sm:space-y-10"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {optimisticSubmission && <OptimisticPreview />}

              {/* Status Messages */}
              <AnimatePresence>
                {status.error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                  >
                    <AlertCircle className="text-red-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-red-900">
                        Submission Error
                      </p>
                      <p className="text-red-700 text-sm mt-1">
                        {status.error}
                      </p>
                    </div>
                  </motion.div>
                )}

                {status.success && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                  >
                    <CheckCircle2 className="text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-green-900">
                        Tender Created Successfully!
                      </p>
                      <p className="text-green-700 text-sm mt-1">
                        {status.success}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {renderStep()}
            </motion.div>
          </AnimatePresence>

          {/* ------------------ Navigation Actions ------------------ */}
          <div className="sticky bottom-0 sm:bottom-6 bg-white/90 backdrop-blur-md border-t sm:border border-gray-200 sm:rounded-xl p-4 sm:p-6 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] sm:shadow-lg z-10">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="text-sm text-gray-600 text-center md:text-left hidden sm:block">
                <p className="font-medium">
                  {FORM_STEPS[currentStep - 1]?.title}
                </p>
                <p className="text-xs">
                  {currentStep === FORM_STEPS.length
                    ? "Review and submit the tender"
                    : `Complete all fields in step ${currentStep} to continue`}
                </p>
              </div>

              <div className="flex w-full md:w-auto gap-3">
                {currentStep > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    disabled={isPending || optimisticSubmission !== null}
                    className="flex-1 md:flex-none min-w-[100px] md:min-w-[120px] gap-2"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span className="hidden sm:inline">Previous</span>
                  </Button>
                )}

                {currentStep < FORM_STEPS.length ? (
                  <Button
                    type="button"
                    onClick={nextStep}
                    disabled={isPending || optimisticSubmission !== null}
                    className="flex-1 md:flex-none min-w-[100px] md:min-w-[120px] bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white shadow-lg transition-all duration-300 gap-2"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => form.reset()}
                      disabled={isPending || optimisticSubmission !== null}
                      className="hidden sm:flex min-w-[120px]"
                    >
                      Reset
                    </Button>

                    <Button
                      disabled={isPending || optimisticSubmission !== null}
                      type="submit"
                      className="flex-1 md:flex-none min-w-[140px] md:min-w-[160px] bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg transition-all duration-300"
                    >
                      {isPending || optimisticSubmission ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="hidden sm:inline">
                            {optimisticSubmission
                              ? "Creating..."
                              : "Processing..."}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2">
                          <PlusCircle className="h-4 w-4" />
                          Submit
                        </div>
                      )}
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}

/* --------------------- Enhanced UI Components --------------------- */

function Section({
  title,
  icon,
  children,
  count,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  count?: number;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex flex-wrap items-center gap-3 sm:gap-4 pb-4 border-b">
        <div className="flex items-center gap-3">
          <div className="p-2 sm:p-3 bg-gradient-to-br from-blue-500 to-teal-500 text-white rounded-xl">
            {icon}
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">
              {title}
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">
              Complete all required fields
            </p>
          </div>
        </div>
        {count && (
          <Badge className="ml-auto bg-blue-100 text-blue-800 hover:bg-blue-100">
            Step {count}
          </Badge>
        )}
      </div>
      <div className="space-y-6">{children}</div>
    </motion.div>
  );
}

function FormItemWrapper({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <FormLabel>{label}</FormLabel>
      {description && (
        <FormDescription className="text-xs text-gray-500">
          {description}
        </FormDescription>
      )}
      {children}
      <FormMessage />
    </div>
  );
}

function LoadingSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="h-20 bg-gradient-to-r from-gray-100 to-gray-200 rounded-xl animate-pulse"
        />
      ))}
    </div>
  );
}

function ErrorMessage({ text }: { text: string }) {
  return (
    <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
      <div className="flex items-center gap-3">
        <AlertCircle className="h-5 w-5" />
        <div>
          <p className="font-medium">Failed to load templates</p>
          <p className="text-sm mt-1">{text}</p>
        </div>
      </div>
      <Button
        variant="outline"
        size="sm"
        className="mt-3"
        onClick={() => window.location.reload()}
      >
        Retry
      </Button>
    </div>
  );
}

function EmptyMessage({ link }: { link: string }) {
  return (
    <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-2xl bg-gradient-to-b from-gray-50 to-white">
      <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-gray-700 mb-2">
        No templates available
      </h3>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">
        Create reusable templates to speed up tender creation and ensure
        consistency.
      </p>
      <Button asChild className="gap-2">
        <Link href={link}>
          <PlusCircle className="h-4 w-4" />
          Create Template
        </Link>
      </Button>
    </div>
  );
}
