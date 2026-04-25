"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CheckCircle2,
  Circle,
  Save,
  Send,
  Clock,
  Users,
  GraduationCap,
  Building,
  Heart,
  Droplets,
  Banknote,
  School,
  Trash2,
  Printer,
  Loader2,
} from "lucide-react";
import type { z } from "zod";
import {
  populationSchema,
  educationSchema,
  infraSchema,
  healthSchema,
  sanitationSchema,
  waterSchema,
  economicSchema,
  eduInstitutionSchema,
  formSchema,
} from "@/schema/villageschema";
import {
  createVillageInfoWithRelations,
  getVillageInfoByYear,
} from "@/action/village-actions";
import { generatePDF } from "@/lib/pdf-generator";

type Village = { id: string; name: string; lgdcode?: string; jlno?: string };

type FormValues = z.infer<typeof formSchema>;

const TAB_CONFIG = [
  {
    key: "population",
    schema: populationSchema,
    label: "Population",
    icon: Users,
  },
  {
    key: "education",
    schema: educationSchema,
    label: "Education",
    icon: GraduationCap,
  },
  {
    key: "infrastructure",
    schema: infraSchema,
    label: "Infrastructure",
    icon: Building,
  },
  {
    key: "health",
    schema: healthSchema,
    label: "Health",
    icon: Heart,
  },
  {
    key: "sanitation",
    schema: sanitationSchema,
    label: "Sanitation",
    icon: Trash2,
  },
  {
    key: "water",
    schema: waterSchema,
    label: "Water",
    icon: Droplets,
  },
  {
    key: "economic",
    schema: economicSchema,
    label: "Economic",
    icon: Banknote,
  },
  {
    key: "eduInstitution",
    schema: eduInstitutionSchema,
    label: "Edu Institutions",
    icon: School,
  },
];

const getDefaultFormValues = (village: Village, year: string): FormValues => ({
  lgdcode: Number(village.lgdcode) || 0,
  jlno: Number(village.jlno) || 0,
  name: village.name || "",
  year: year || "",
  population: populationSchema.parse({}),
  education: educationSchema.parse({}),
  infrastructure: infraSchema.parse({}),
  health: healthSchema.parse({}),
  sanitation: sanitationSchema.parse({}),
  water: waterSchema.parse({}),
  economic: economicSchema.parse({}),
  eduInstitution: eduInstitutionSchema.parse({}),
});

function PrintBlankVillageFormButton() {
  const [isGenerating, setIsGenerating] = useState(false);

  const handlePrintBlank = async () => {
    setIsGenerating(true);
    try {
      const blankInputs = [
        {
          lgdcode: "",
          jlno: "",
          name: "",
          year: "",
          population: {},
          education: {},
          infrastructure: {},
          health: {},
          sanitation: {},
          water: {},
          economic: {},
          eduInstitution: {},
        },
      ];
      const templatePath = "/templates/villageinfo-blank.json";
      const pdf = await generatePDF(templatePath, blankInputs);
      const blob = new Blob([pdf.buffer], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `village_info_blank_form.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error generating blank form PDF:", error);
      toast.error("Failed to generate blank form PDF");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      variant="outline"
      onClick={handlePrintBlank}
      disabled={isGenerating}
      aria-label="Print Blank Village Info Form"
      className="flex items-center gap-2"
    >
      {isGenerating ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Printer className="h-4 w-4" />
      )}
      <span className="hidden sm:inline">Print Blank Form</span>
    </Button>
  );
}

export function VillageInfoTabs({
  village,
  year,
}: {
  village: Village;
  year: string;
}) {
  const [loading, setLoading] = useState(false);
  const [draftLoading, setDraftLoading] = useState(false);
  const [tab, setTab] = useState(TAB_CONFIG[0].key);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [isDraft, setIsDraft] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: getDefaultFormValues(village, year),
  });

  useEffect(() => {
    const loadData = async () => {
      setIsDataLoaded(false);
      try {
        const data = await getVillageInfoByYear(Number(village.lgdcode), year);

        let formValues: FormValues;

        if (data) {
          setIsDraft(data.isDraft || false);
          setLastSaved(data.updatedAt ? new Date(data.updatedAt) : null);

          formValues = {
            lgdcode: data.lgdcode,
            jlno: data.jlno,
            name: data.name,
            year: year,
            population: data.villagePopulation || populationSchema.parse({}),
            education: data.VillageEducation || educationSchema.parse({}),
            infrastructure: data.VillageInfrastructure || infraSchema.parse({}),
            health: data.HealthData || healthSchema.parse({}),
            sanitation: data.SanitationData || sanitationSchema.parse({}),
            water: data.WaterSupplyData || waterSchema.parse({}),
            economic: data.EconomicData || economicSchema.parse({}),
            eduInstitution:
              data.EducationalInstitutionData || eduInstitutionSchema.parse({}),
          };
        } else {
          formValues = getDefaultFormValues(village, year);
          setIsDraft(false);
          setLastSaved(null);
        }

        form.reset(formValues);
        setIsDataLoaded(true);
      } catch (error) {
        console.error("Error fetching village data:", error);
        form.reset(getDefaultFormValues(village, year));
        setIsDataLoaded(true);
        toast.error("Failed to load existing data");
      }
    };

    loadData();
  }, [village, year, form]);

  const calculateProgress = () => {
    const totalFields = TAB_CONFIG.reduce(
      (acc, tab) => acc + Object.keys(tab.schema.shape).length,
      0
    );

    const completedFields = TAB_CONFIG.reduce((acc, tab) => {
      const tabKey = tab.key as keyof FormValues;
      const tabData = form.watch(tabKey);
      const tabFields = Object.keys(tab.schema.shape);

      return (
        acc +
        tabFields.filter((field) => {
          const value = (tabData as any)?.[field];
          return value !== undefined && value !== null && value !== "";
        }).length
      );
    }, 0);

    return Math.round((completedFields / totalFields) * 100);
  };

  const progress = calculateProgress();

  if (!isDataLoaded) {
    return (
      <Card className="m-6">
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading village information...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentTabIndex = TAB_CONFIG.findIndex((t) => t.key === tab);
  const isFirstTab = currentTabIndex === 0;
  const isLastTab = currentTabIndex === TAB_CONFIG.length - 1;

  async function handleSave(values: FormValues, saveAsDraft = false) {
    if (saveAsDraft) {
      setDraftLoading(true);
    } else {
      setLoading(true);
    }

    try {
      const currentTabConfig = TAB_CONFIG[currentTabIndex];
      const tabKey = currentTabConfig.key;
      const tabData = values[tabKey as keyof FormValues];

      const coreData = {
        lgdcode: values.lgdcode,
        jlno: values.jlno,
        name: values.name,
        year: values.year,
      };

      const safeTabData =
        typeof tabData === "object" && tabData !== null ? tabData : {};
      const result = await createVillageInfoWithRelations(
        coreData,
        tabKey,
        safeTabData,
        saveAsDraft
      );

      if (result.success) {
        setIsDraft(saveAsDraft);
        setLastSaved(new Date());

        toast.success(
          result.message ||
            (saveAsDraft
              ? "Draft saved successfully"
              : "Village information submitted successfully")
        );
      } else {
        toast.error(result.message || "Failed to save village information");
      }
    } catch (error) {
      console.error("Save error:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
      setDraftLoading(false);
    }
  }

  const goToNextTab = () => {
    if (!isLastTab) {
      setTab(TAB_CONFIG[currentTabIndex + 1].key);
    }
  };

  const goToPrevTab = () => {
    if (!isFirstTab) {
      setTab(TAB_CONFIG[currentTabIndex - 1].key);
    }
  };

  const hasTabErrors = () => {
    const currentTabFields = Object.keys(
      TAB_CONFIG[currentTabIndex].schema.shape
    );
    return currentTabFields.some((field) => {
      const tabErrors = form.formState.errors[tab as keyof FormValues] as any;
      return tabErrors && tabErrors[field];
    });
  };

  const formatFieldLabel = (field: string) => {
    return field
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase())
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  return (
    <div className="p-4 md:p-6">
      <Card className="shadow-lg rounded-xl">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-2xl font-bold text-gray-800">
                {village.name} Village Information
              </CardTitle>
              <div className="flex flex-wrap items-center gap-3 mt-2">
                <Badge variant="outline" className="border-blue-200 bg-blue-50">
                  <span className="font-medium">Year:</span> {year}
                </Badge>
                <Badge
                  variant="outline"
                  className="border-purple-200 bg-purple-50"
                >
                  <span className="font-medium">LGD Code:</span>{" "}
                  {village.lgdcode}
                </Badge>
                {isDraft && (
                  <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
                    <Clock className="h-4 w-4 mr-1" />
                    Draft
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center gap-3">
                {lastSaved && (
                  <p className="text-xs text-gray-500">
                    Last saved:{" "}
                    {lastSaved.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                )}
                <PrintBlankVillageFormButton />
              </div>

              <div className="w-full max-w-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-gray-600">
                    Form Progress
                  </span>
                  <span className="text-xs font-medium text-blue-600">
                    {progress}%
                  </span>
                </div>
                <Progress value={progress} className="h-2 bg-gray-100" />
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 md:p-6">
          <Form {...form}>
            <form>
              <Tabs value={tab} onValueChange={setTab}>
                <TabsList className="flex w-full overflow-x-auto mb-6 bg-gray-50 p-1 rounded-lg">
                  {TAB_CONFIG.map(({ key, label, icon: Icon }) => {
                    const tabData = form.watch(key as keyof FormValues);
                    const tabFields = Object.keys(
                      TAB_CONFIG.find((t) => t.key === key)!.schema.shape
                    );
                    const isComplete = tabFields.every((field) => {
                      const value = (tabData as any)?.[field];
                      return (
                        value !== undefined && value !== null && value !== ""
                      );
                    });

                    return (
                      <TabsTrigger
                        key={key}
                        value={key}
                        className={`flex flex-col items-center px-3 py-2 rounded-md transition-all ${
                          tab === key
                            ? "bg-white shadow-sm border border-blue-100"
                            : "hover:bg-gray-100"
                        }`}
                      >
                        <div className="flex items-center gap-1.5 mb-1">
                          <Icon className="h-4 w-4 text-blue-600" />
                          <span className="text-xs font-medium">{label}</span>
                        </div>
                        {isComplete ? (
                          <CheckCircle2 className="h-3 w-3 text-green-500" />
                        ) : hasTabErrors() ? (
                          <Circle className="h-3 w-3 text-red-500" />
                        ) : (
                          <Circle className="h-3 w-3 text-gray-300" />
                        )}
                      </TabsTrigger>
                    );
                  })}
                </TabsList>

                {TAB_CONFIG.map(({ key, schema, label, icon: Icon }) => (
                  <TabsContent
                    value={key}
                    key={key}
                    className="space-y-4 bg-white rounded-xl border border-gray-100 p-5 shadow-sm"
                  >
                    <div className="flex items-center gap-3 pb-3 border-b border-gray-200">
                      <div className="p-2 rounded-lg bg-blue-50">
                        <Icon className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">
                          {label} Information
                        </h3>
                        <p className="text-sm text-gray-500">
                          Provide {label.toLowerCase()} details for{" "}
                          {village.name}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                      {Object.keys(schema.shape).map((field) => (
                        <FormField
                          key={field}
                          control={form.control}
                          name={`${key}.${field}` as any}
                          render={({ field: f }) => (
                            <FormItem className="bg-gray-50 p-3 rounded-lg hover:bg-blue-50 transition-colors">
                              <FormLabel className="block text-sm font-medium text-gray-700 mb-1">
                                {formatFieldLabel(field)}
                              </FormLabel>
                              <FormControl>
                                {typeof f.value === "boolean" ? (
                                  <div className="flex items-center space-x-2">
                                    <Checkbox
                                      checked={f.value}
                                      onCheckedChange={(checked) => {
                                        f.onChange(checked === true);
                                      }}
                                      className="h-5 w-5 data-[state=checked]:bg-blue-600"
                                    />
                                    <span className="text-sm">
                                      {f.value ? "Yes" : "No"}
                                    </span>
                                  </div>
                                ) : (
                                  <Input
                                    type={
                                      typeof f.value === "number"
                                        ? "number"
                                        : "text"
                                    }
                                    {...f}
                                    value={f.value ?? ""}
                                    onChange={(e) => {
                                      const value = e.target.value;
                                      if (typeof f.value === "number") {
                                        f.onChange(
                                          value === "" ? 0 : Number(value)
                                        );
                                      } else {
                                        f.onChange(value);
                                      }
                                    }}
                                    className="bg-white border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-300 focus:border-blue-500"
                                  />
                                )}
                              </FormControl>
                              <FormMessage className="text-red-600 text-xs mt-1" />
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>

              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-8 pt-6 border-t border-gray-200">
                <div>
                  {!isFirstTab && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={goToPrevTab}
                      className="flex items-center gap-2 px-5 py-2 bg-gray-50 hover:bg-gray-100"
                    >
                      ← <span className="hidden sm:inline">Previous</span>
                    </Button>
                  )}
                </div>

                <div className="flex flex-wrap justify-center gap-3">
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={draftLoading || loading}
                    onClick={form.handleSubmit((values) =>
                      handleSave(values, true)
                    )}
                    className="flex items-center gap-2 px-5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200"
                  >
                    {draftLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Saving Draft...</span>
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        <span>Save as Draft</span>
                      </>
                    )}
                  </Button>

                  {!isLastTab ? (
                    <Button
                      type="button"
                      onClick={goToNextTab}
                      className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700"
                    >
                      <span>Next Section</span> →
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      disabled={loading || draftLoading}
                      onClick={form.handleSubmit((values) =>
                        handleSave(values, false)
                      )}
                      className="flex items-center gap-2 px-5 py-2 bg-green-600 hover:bg-green-700"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Submitting...</span>
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          <span>Final Submit</span>
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
