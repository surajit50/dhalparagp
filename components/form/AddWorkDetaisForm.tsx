"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useForm, useFormContext, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  useQuery,
  useMutation,
  useQueryClient,
  type QueryKey,
} from "@tanstack/react-query";
import type { ApprovedActionPlanDetails } from "@prisma/client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Loader2,
  Search,
  X,
  CheckCircle2,
  IndianRupee,
  CalendarDays,
  MapPin,
  ClipboardList,
  Landmark,
  Hammer,
  Filter,
  RefreshCw,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  StepForward,
} from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

import { fetchApprovedActionPlans } from "@/action/fetchApprovedActionPlans";
import { fetchFinancialYears } from "@/action/fetchFinancialYears";
import { addTenderDetails } from "@/action/addTenderDetails";

const predefinedParticipationFees = [
  "400",
  "500",
  "600",
  "800",
  "1000",
  "1500",
  "2000",
  "2500",
];
const participationFeeOptions = [...predefinedParticipationFees, "Other"];

const predefinedFinalEstimates = [
  "50000",
  "100000",
  "120000",
  "150000",
  "200000",
  "250000",
  "300000",
  "350000",
  "400000",
  "450000",
  "500000",
  "600000",
  "750000",
];
const finalEstimateOptions = [...predefinedFinalEstimates, "Other"];

const formSchema = z
  .object({
    approvedActionPlanId: z.string().nonempty("Please select a work detail"),
    participation_fee_type: z
      .string()
      .nonempty("Please select participation fee type"),
    participation_fee: z.string().nonempty("Participation fee is required"),
    final_Estimate_Amount_type: z
      .string()
      .nonempty("Please select estimate amount type"),
    final_Estimate_Amount: z
      .string()
      .nonempty("Final estimate amount is required"),
    useSameAsEstimatedCost: z.boolean().default(false),
  })
  .superRefine((data, ctx) => {
    if (data.participation_fee_type === "Other" && !data.participation_fee) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["participation_fee"],
        message: "Please enter participation fee amount",
      });
    }

    if (!data.useSameAsEstimatedCost) {
      if (
        data.final_Estimate_Amount_type === "Other" &&
        !data.final_Estimate_Amount
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["final_Estimate_Amount"],
          message: "Please enter final estimate amount",
        });
      }

      if (
        data.final_Estimate_Amount &&
        isNaN(Number(data.final_Estimate_Amount))
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["final_Estimate_Amount"],
          message: "Final estimate amount must be a valid number",
        });
      }
    }

    if (data.participation_fee && isNaN(Number(data.participation_fee))) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["participation_fee"],
        message: "Participation fee must be a valid number",
      });
    }
  });

type FormValues = z.infer<typeof formSchema>;

interface AddWorkDetailsFormProps {
  tenderId: string;
}

interface SelectWithOtherProps {
  name: keyof Pick<FormValues, "participation_fee" | "final_Estimate_Amount">;
  options: string[];
  predefinedValues: string[];
  label: string;
  selectedType: string;
  selectedValue: string;
  onTypeChange: (value: string) => void;
  onValueChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  placeholder?: string;
  disabled?: boolean;
}

const SelectWithOther = ({
  name,
  options,
  predefinedValues,
  label,
  selectedType,
  selectedValue,
  onTypeChange,
  onValueChange,
  error,
  placeholder = "Enter custom amount",
  disabled = false,
}: SelectWithOtherProps) => {
  const form = useFormContext<FormValues>();

  const handleTypeChange = (value: string) => {
    onTypeChange(value);

    if (value === "Other") {
      const currentValue = form.getValues(name);
      if (predefinedValues.includes(currentValue)) {
        form.setValue(name, "");
      }
    } else {
      form.setValue(name, value);
    }
  };

  return (
    <div className="space-y-3">
      <Label className="text-gray-700 flex items-center gap-2 font-medium">
        <IndianRupee className="h-5 w-5 text-orange-500" />
        {label}
      </Label>

      <div className="space-y-3">
        <Select
          value={selectedType}
          onValueChange={handleTypeChange}
          disabled={disabled}
        >
          <SelectTrigger className="h-12 rounded-lg border-2 border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 disabled:opacity-50 disabled:cursor-not-allowed">
            <SelectValue placeholder={`Select ${label}`} />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option} value={option}>
                {option === "Other"
                  ? "Other (Specify Amount)"
                  : `₹${Number(option).toLocaleString()}`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <AnimatePresence>
          {selectedType === "Other" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Input
                value={selectedValue}
                onChange={onValueChange}
                placeholder={placeholder}
                className="h-12 rounded-lg border-2 border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 pl-12 disabled:opacity-50 disabled:cursor-not-allowed"
                type="number"
                min="0"
                disabled={disabled}
              />
              <IndianRupee className="absolute left-4 top-3 h-6 w-6 text-gray-400" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <AlertCircle className="h-4 w-4" />
          {error}
        </motion.div>
      )}
    </div>
  );
};

export default function AddWorkDetailsForm({
  tenderId,
}: AddWorkDetailsFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedWork, setSelectedWork] =
    useState<ApprovedActionPlanDetails | null>(null);
  const [selectedFinancialYear, setSelectedFinancialYear] =
    useState<string>("");
  const [page, setPage] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const pageSize = 10;
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      approvedActionPlanId: "",
      participation_fee_type: "",
      participation_fee: "",
      final_Estimate_Amount_type: "",
      final_Estimate_Amount: "",
      useSameAsEstimatedCost: false,
    },
  });

  // Watch for checkbox changes
  const useSameAsEstimatedCost = form.watch("useSameAsEstimatedCost");

  // Effect to handle checkbox changes (copy estimated cost to final estimate)
  useEffect(() => {
    if (useSameAsEstimatedCost && selectedWork) {
      const workEstimatedCost = selectedWork.estimatedCost.toString();
      const isPredefinedValue =
        predefinedFinalEstimates.includes(workEstimatedCost);

      if (isPredefinedValue) {
        form.setValue("final_Estimate_Amount_type", workEstimatedCost);
      } else {
        form.setValue("final_Estimate_Amount_type", "Other");
      }

      form.setValue("final_Estimate_Amount", workEstimatedCost);
      form.clearErrors("final_Estimate_Amount");
      form.clearErrors("final_Estimate_Amount_type");
    } else if (!useSameAsEstimatedCost) {
      form.setValue("final_Estimate_Amount_type", "");
      form.setValue("final_Estimate_Amount", "");
    }
  }, [useSameAsEstimatedCost, selectedWork, form]);

  // ------------------------------------------------------------------------
  // NEW: Auto-calculate participation fee based on final estimate amount
  // ------------------------------------------------------------------------
  const getParticipationFeeFromFinalEstimate = (
    amount: number,
  ): { type: string; value: string } | null => {
    if (isNaN(amount) || amount <= 0) return null;
    if (amount <= 50000) return { type: "Other", value: "250" };
    if (amount <= 150000) return { type: "500", value: "500" };
    if (amount <= 200000) return { type: "600", value: "600" };
    if (amount <= 300000) return { type: "800", value: "800" };
    return { type: "1000", value: "1000" };
  };

  const finalEstimateAmount = form.watch("final_Estimate_Amount");

  useEffect(() => {
    const parsed = parseFloat(finalEstimateAmount);
    const computed = getParticipationFeeFromFinalEstimate(parsed);

    // Only auto-fill if participation fee field hasn't been manually touched
    if (computed && !form.formState.touchedFields.participation_fee) {
      const currentType = form.getValues("participation_fee_type");
      const currentValue = form.getValues("participation_fee");
      if (currentType !== computed.type || currentValue !== computed.value) {
        form.setValue("participation_fee_type", computed.type, {
          shouldValidate: true,
        });
        form.setValue("participation_fee", computed.value, {
          shouldValidate: true,
        });
      }
    }
  }, [
    finalEstimateAmount,
    form.formState.touchedFields.participation_fee,
    form,
  ]);

  // Fetch financial years
  const { data: financialYears } = useQuery({
    queryKey: ["financialYears"],
    queryFn: fetchFinancialYears,
    staleTime: 10 * 60 * 1000,
  });

  // Fetch approved action plans
  const { data, error, isLoading, isFetching } = useQuery({
    queryKey: [
      "approvedActionPlans",
      page,
      pageSize,
      searchTerm,
      selectedFinancialYear,
    ],
    queryFn: () =>
      fetchApprovedActionPlans(
        page,
        pageSize,
        searchTerm,
        selectedFinancialYear,
      ),
    staleTime: 5 * 60 * 1000,
    enabled: searchTerm.length > 0 || selectedFinancialYear.length > 0,
  });

  const mutation = useMutation({
    mutationFn: (values: FormValues) => addTenderDetails(values, tenderId),
    onMutate: async (newTenderDetails) => {
      const queryKey: QueryKey = ["tenderDetails", tenderId];
      await queryClient.cancelQueries({ queryKey });
      const previousTenderDetails = queryClient.getQueryData(queryKey);
      queryClient.setQueryData(queryKey, (old: any[] = []) => [
        ...old,
        newTenderDetails,
      ]);
      return { previousTenderDetails };
    },
    onError: (err, newTenderDetails, context) => {
      const queryKey: QueryKey = ["tenderDetails", tenderId];
      queryClient.setQueryData(queryKey, context?.previousTenderDetails);
      toast({
        title: "Error",
        description: "Failed to add tender details. Please try again.",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      const queryKey: QueryKey = ["tenderDetails", tenderId];
      queryClient.invalidateQueries({ queryKey });
      toast({
        title: "Success",
        description: "Tender details added successfully!",
      });
      setIsDialogOpen(true);
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      await mutation.mutateAsync(values);
    } catch (error) {
      console.error("Failed to submit form:", error);
    }
  };

  const handleWorkSelect = (work: ApprovedActionPlanDetails) => {
    setSelectedWork(work);
    form.setValue("approvedActionPlanId", work.id);
    form.clearErrors("approvedActionPlanId");

    if (useSameAsEstimatedCost) {
      const workEstimatedCost = work.estimatedCost.toString();
      const isPredefinedValue =
        predefinedFinalEstimates.includes(workEstimatedCost);

      if (isPredefinedValue) {
        form.setValue("final_Estimate_Amount_type", workEstimatedCost);
      } else {
        form.setValue("final_Estimate_Amount_type", "Other");
      }

      form.setValue("final_Estimate_Amount", workEstimatedCost);
    }
  };

  const clearAllFilters = () => {
    setSearchTerm("");
    setSelectedFinancialYear("");
    setSelectedWork(null);
    form.setValue("approvedActionPlanId", "");
    form.setValue("useSameAsEstimatedCost", false);
    setPage(1);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    form.reset();
    setSelectedWork(null);
    setSearchTerm("");
    setSelectedFinancialYear("");
    setPage(1);
    setCurrentStep(1);
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["approvedActionPlans"] });
    queryClient.invalidateQueries({ queryKey: ["financialYears"] });
  };

  const totalPages = data ? Math.ceil(data.totalCount / pageSize) : 0;

  const handleNext = async () => {
    const isStep1Valid = await form.trigger("approvedActionPlanId");
    if (isStep1Valid) {
      setCurrentStep(2);
    }
  };

  const handleBack = () => {
    setCurrentStep(1);
  };

  const isSubmitting = mutation.isPending;

  return (
    <Card className="w-full max-w-6xl mx-auto shadow-2xl rounded-2xl border-0 bg-gradient-to-br from-white to-orange-50/30">
      <CardContent className="p-8">
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {currentStep === 1 && (
              <>
                {/* Search and Filter Section */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                      <Search className="h-6 w-6 text-orange-500" />
                      Search Work From Plans
                    </h3>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center gap-2"
                      >
                        <Filter className="h-4 w-4" />
                        Filters
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleRefresh}
                        className="flex items-center gap-2"
                      >
                        <RefreshCw className="h-4 w-4" />
                        Refresh
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className="lg:col-span-2 relative">
                      <Search className="absolute left-3 top-3.5 h-5 w-5 text-gray-400 z-10" />
                      <Input
                        placeholder="Search by activity, scheme, location, or activity code..."
                        value={searchTerm}
                        onChange={(e) => {
                          setSearchTerm(e.target.value);
                          setPage(1);
                        }}
                        className="pl-10 pr-10 h-12 rounded-lg border-2 border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                      />
                      {searchTerm && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-2 top-2 h-8 w-8 p-0"
                          onClick={() => {
                            setSearchTerm("");
                            setPage(1);
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <Select
                      value={selectedFinancialYear}
                      onValueChange={(value) => {
                        setSelectedFinancialYear(value === "all" ? "" : value);
                        setPage(1);
                      }}
                    >
                      <SelectTrigger className="h-12 rounded-lg border-2 border-gray-200 focus:border-orange-500">
                        <SelectValue placeholder="Filter by Financial Year" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Years</SelectItem>
                        {financialYears?.map((year) => (
                          <SelectItem
                            key={year.financialYear}
                            value={year.financialYear}
                          >
                            {year.financialYear}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {(searchTerm || selectedFinancialYear) && (
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm text-gray-600">
                        Active filters:
                      </span>
                      {searchTerm && (
                        <Badge
                          variant="secondary"
                          className="flex items-center gap-1"
                        >
                          Search: {searchTerm}
                          <X
                            className="h-3 w-3 cursor-pointer"
                            onClick={() => {
                              setSearchTerm("");
                              setPage(1);
                            }}
                          />
                        </Badge>
                      )}
                      {selectedFinancialYear && (
                        <Badge
                          variant="secondary"
                          className="flex items-center gap-1"
                        >
                          Year: {selectedFinancialYear}
                          <X
                            className="h-3 w-3 cursor-pointer"
                            onClick={() => {
                              setSelectedFinancialYear("");
                              setPage(1);
                            }}
                          />
                        </Badge>
                      )}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={clearAllFilters}
                        className="text-xs"
                      >
                        Clear all
                      </Button>
                    </div>
                  )}
                </div>

                {/* Search Results */}
                <AnimatePresence>
                  {(searchTerm || selectedFinancialYear) && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Card className="border-2 border-gray-100 shadow-sm rounded-xl overflow-hidden bg-white/90 backdrop-blur-sm">
                        <div className="p-4 bg-gray-50/50 border-b flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <ClipboardList className="h-5 w-5 text-orange-500" />
                            <span className="font-medium text-gray-700">
                              {isLoading
                                ? "Searching..."
                                : `${data?.totalCount || 0} plans found`}
                            </span>
                          </div>
                          {data && data.totalCount > pageSize && (
                            <div className="flex items-center gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setPage(Math.max(1, page - 1))}
                                disabled={page === 1 || isLoading}
                              >
                                <ChevronLeft className="h-4 w-4" />
                              </Button>
                              <span className="text-sm text-gray-600">
                                Page {page} of {totalPages}
                              </span>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  setPage(Math.min(totalPages, page + 1))
                                }
                                disabled={page === totalPages || isLoading}
                              >
                                <ChevronRight className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </div>

                        <ScrollArea className="h-[400px]">
                          <CardContent className="p-4">
                            {isLoading ? (
                              <div className="flex items-center justify-center h-32">
                                <div className="flex flex-col items-center gap-2">
                                  <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
                                  <p className="text-sm text-gray-600">
                                    Loading plans...
                                  </p>
                                </div>
                              </div>
                            ) : error ? (
                              <div className="flex items-center justify-center h-32">
                                <div className="flex flex-col items-center gap-2 text-red-600">
                                  <AlertCircle className="h-8 w-8" />
                                  <p className="text-sm">
                                    Failed to load plans. Please try again.
                                  </p>
                                </div>
                              </div>
                            ) : data && data.plans.length > 0 ? (
                              <RadioGroup
                                value={selectedWork?.id}
                                onValueChange={(value) => {
                                  const work = data.plans.find(
                                    (p: any) => p.id === value,
                                  );
                                  if (work) handleWorkSelect(work);
                                }}
                              >
                                <div className="space-y-4">
                                  {data.plans.map((work: any, index: any) => (
                                    <motion.div
                                      key={work.id}
                                      initial={{ opacity: 0, y: 20 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      transition={{
                                        duration: 0.2,
                                        delay: index * 0.05,
                                      }}
                                    >
                                      <RadioGroupItem
                                        value={work.id}
                                        id={work.id}
                                        className="peer sr-only"
                                      />
                                      <Label
                                        htmlFor={work.id}
                                        className="flex flex-col p-6 border-2 rounded-xl cursor-pointer transition-all 
                                          bg-white hover:border-orange-300 hover:shadow-md peer-checked:border-orange-500 
                                          peer-checked:bg-orange-50/50 peer-checked:shadow-lg group"
                                      >
                                        <div className="flex items-start justify-between mb-4">
                                          <div className="flex items-center gap-3">
                                            <div className="bg-orange-100 p-2 rounded-lg group-hover:bg-orange-200 transition-colors">
                                              <ClipboardList className="h-6 w-6 text-orange-600" />
                                            </div>
                                            <div>
                                              <h3 className="font-semibold text-gray-800 text-lg leading-tight">
                                                {work.activityDescription}
                                              </h3>
                                              <p className="text-sm text-gray-600 mt-1">
                                                {work.schemeName}
                                              </p>
                                            </div>
                                          </div>
                                          <Badge
                                            variant="outline"
                                            className="text-xs"
                                          >
                                            Code: {work.activityCode}
                                          </Badge>
                                        </div>

                                        <Separator className="my-3" />

                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                          <div className="flex items-center gap-2 text-gray-600">
                                            <CalendarDays className="h-4 w-4 text-orange-500 flex-shrink-0" />
                                            <span className="truncate">
                                              {work.financialYear}
                                            </span>
                                          </div>
                                          <div className="flex items-center gap-2 text-gray-600">
                                            <IndianRupee className="h-4 w-4 text-green-500 flex-shrink-0" />
                                            <span className="truncate">
                                              ₹
                                              {Number(
                                                work.estimatedCost,
                                              ).toLocaleString()}
                                            </span>
                                          </div>
                                          <div className="flex items-center gap-2 text-gray-600">
                                            <MapPin className="h-4 w-4 text-red-500 flex-shrink-0" />
                                            <span className="truncate">
                                              {work.locationofAsset}
                                            </span>
                                          </div>
                                          <div className="flex items-center gap-2 text-gray-600">
                                            <Landmark className="h-4 w-4 text-purple-500 flex-shrink-0" />
                                            <span className="truncate">
                                              {work.schemeName}
                                            </span>
                                          </div>
                                        </div>

                                        {work.activityDescription && (
                                          <div className="mt-3 pt-3 border-t border-gray-100">
                                            <p className="text-sm text-gray-600 line-clamp-2">
                                              {work.activityDescription}
                                            </p>
                                          </div>
                                        )}
                                      </Label>
                                    </motion.div>
                                  ))}
                                </div>
                              </RadioGroup>
                            ) : (
                              <div className="flex items-center justify-center h-32">
                                <div className="flex flex-col items-center gap-2 text-gray-500">
                                  <Search className="h-8 w-8" />
                                  <p className="text-sm">
                                    No matching plans found
                                  </p>
                                  <p className="text-xs">
                                    Try adjusting your search criteria
                                  </p>
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </ScrollArea>
                      </Card>
                    </motion.div>
                  )}
                </AnimatePresence>

                {form.formState.errors.approvedActionPlanId && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <AlertCircle className="h-4 w-4" />
                    {form.formState.errors.approvedActionPlanId.message}
                  </motion.div>
                )}
              </>
            )}

            {currentStep === 2 && (
              <>
                {/* Selected Work Preview */}
                <AnimatePresence>
                  {selectedWork && (
                    <motion.div
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Card className="border-2 border-green-200 bg-green-50/30 rounded-xl backdrop-blur-sm">
                        <CardHeader className="pb-4">
                          <CardTitle className="text-lg font-semibold text-green-800 flex items-center gap-2">
                            <CheckCircle2 className="h-6 w-6 text-green-600" />
                            Selected Work Details
                          </CardTitle>
                          <CardDescription className="text-green-700">
                            {selectedWork.activityDescription}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div className="space-y-1">
                            <Label className="text-sm text-gray-600 flex items-center gap-2">
                              <CalendarDays className="h-4 w-4" />
                              Financial Year
                            </Label>
                            <p className="font-medium">
                              {selectedWork.financialYear}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-sm text-gray-600 flex items-center gap-2">
                              <ClipboardList className="h-4 w-4" />
                              Activity Code
                            </Label>
                            <p className="font-medium">
                              {selectedWork.activityCode}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-sm text-gray-600 flex items-center gap-2">
                              <MapPin className="h-4 w-4" />
                              Location
                            </Label>
                            <p className="font-medium">
                              {selectedWork.locationofAsset}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-sm text-gray-600 flex items-center gap-2">
                              <IndianRupee className="h-4 w-4" />
                              Estimated Cost
                            </Label>
                            <p className="font-medium">
                              ₹
                              {Number(
                                selectedWork.estimatedCost,
                              ).toLocaleString()}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Financial Details Section */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2">
                    <IndianRupee className="h-6 w-6 text-orange-500" />
                    <h3 className="text-xl font-semibold text-gray-800">
                      Financial Details
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <SelectWithOther
                      name="participation_fee"
                      options={participationFeeOptions}
                      predefinedValues={predefinedParticipationFees}
                      label="Participation Fee"
                      selectedType={form.watch("participation_fee_type")}
                      selectedValue={form.watch("participation_fee")}
                      onTypeChange={(value) =>
                        form.setValue("participation_fee_type", value)
                      }
                      onValueChange={(e) =>
                        form.setValue("participation_fee", e.target.value)
                      }
                      error={form.formState.errors.participation_fee?.message}
                      placeholder="Enter participation fee amount"
                    />

                    <div className="space-y-4">
                      {selectedWork && (
                        <div className="flex items-center space-x-2 mb-4 p-3 bg-orange-50 rounded-lg">
                          <Checkbox
                            id="useSameAsEstimatedCost"
                            checked={useSameAsEstimatedCost}
                            onCheckedChange={(checked) => {
                              form.setValue(
                                "useSameAsEstimatedCost",
                                checked as boolean,
                              );
                            }}
                          />
                          <Label
                            htmlFor="useSameAsEstimatedCost"
                            className="text-sm font-medium leading-none cursor-pointer flex items-center gap-2"
                          >
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            Use same as Estimated Cost (₹
                            {Number(
                              selectedWork.estimatedCost,
                            ).toLocaleString()}
                            )
                          </Label>
                        </div>
                      )}

                      <SelectWithOther
                        name="final_Estimate_Amount"
                        options={finalEstimateOptions}
                        predefinedValues={predefinedFinalEstimates}
                        label="Final Estimate Amount"
                        selectedType={form.watch("final_Estimate_Amount_type")}
                        selectedValue={form.watch("final_Estimate_Amount")}
                        onTypeChange={(value) =>
                          form.setValue("final_Estimate_Amount_type", value)
                        }
                        onValueChange={(e) =>
                          form.setValue("final_Estimate_Amount", e.target.value)
                        }
                        error={
                          form.formState.errors.final_Estimate_Amount?.message
                        }
                        placeholder="Enter final estimate amount"
                        disabled={useSameAsEstimatedCost}
                      />
                    </div>
                  </div>
                </div>

                {selectedWork &&
                  !useSameAsEstimatedCost &&
                  form.watch("final_Estimate_Amount") &&
                  Number(form.watch("final_Estimate_Amount")) !==
                    Number(selectedWork.estimatedCost) && (
                    <div className="flex items-center gap-2 text-sm text-orange-600 bg-orange-50 p-3 rounded-lg mb-4">
                      <AlertCircle className="h-4 w-4" />
                      <span>
                        Note: Final Estimate Amount does not match the Estimated
                        Cost from the selected work (₹
                        {Number(selectedWork.estimatedCost).toLocaleString()}).
                      </span>
                    </div>
                  )}
              </>
            )}

            {/* Navigation Buttons */}
            <div className="pt-6 flex justify-between">
              {currentStep === 2 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  disabled={isSubmitting}
                >
                  <ChevronLeft className="mr-2 h-4 w-4" /> Back
                </Button>
              )}

              {currentStep === 1 && (
                <Button
                  type="button"
                  onClick={handleNext}
                  disabled={!selectedWork || isSubmitting}
                  className="ml-auto"
                >
                  Next <StepForward className="ml-2 h-4 w-4" />
                </Button>
              )}

              {currentStep === 2 && (
                <Button
                  type="submit"
                  className="w-full h-14 bg-gradient-to-r from-orange-700 to-orange-700 hover:from-orange-800 hover:to-orange-800 
                  text-white rounded-xl shadow-xl transition-all hover:shadow-2xl hover:scale-[1.02] text-lg font-semibold
                  disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  disabled={isSubmitting || !selectedWork}
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-6 w-6 animate-spin" />
                      Adding to Tender...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5" />
                      Add to Tender
                    </div>
                  )}
                </Button>
              )}
            </div>
          </form>
        </FormProvider>
      </CardContent>

      {/* Success Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="rounded-2xl max-w-md border-0 shadow-2xl">
          <div className="flex flex-col items-center py-8 px-4 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", duration: 0.5 }}
            >
              <CheckCircle2 className="h-16 w-16 text-green-600" />
            </motion.div>
            <DialogTitle className="text-2xl font-bold text-gray-800 mb-2">
              Details Added Successfully!
            </DialogTitle>
            <DialogDescription className="text-gray-600 mb-6 text-center">
              The work details have been successfully linked to the tender with
              the specified financial parameters.
            </DialogDescription>
            <div className="flex gap-4 w-full">
              <Button
                variant="outline"
                onClick={handleDialogClose}
                className="h-12 flex-1 rounded-xl border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Close
              </Button>
              <Button
                onClick={handleDialogClose}
                className="h-12 flex-1 bg-orange-700 hover:bg-orange-800 text-white rounded-xl shadow-md"
              >
                Add Another
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
