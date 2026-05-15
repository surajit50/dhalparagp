/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Loader2, Printer } from "lucide-react";
import { generatePDF } from "../pdfgeneratortwo";
import { fetchnitdetailsType } from "@/types/nitDetails";
import { formatDate, formatDateTimeCustom } from "@/utils/utils";
import { tenderForwardedTo, tendertermcon } from "@/constants/tenderterm";
import { gpcode } from "@/constants/gpinfor";
// Type definitions
type TermCategory = "ELIGIBLE" | "QUALIFICATION_CRITERIA" | "TERMS_CONDITIONS";

interface TenderTerm {
  id: string;
  category: TermCategory;
  title: string;
  content: string;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

interface TenderTermTemplate {
  id: string;
  name: string;
  content?: {
    eligible?: string[];
    qualificationCriteria?: string[];
    termsConditions?: string[];
  };
}

interface TermsByCategory {
  ELIGIBLE: string[];
  QUALIFICATION_CRITERIA: string[];
  TERMS_CONDITIONS: string[];
}

interface PDFInput {
  callcount: string;
  memono1: string;
  memono2: string;
  memoDate1: string;
  memoDate2: string;
  worklist: string[][];
  forwat: string[][];
  elegible: string[][];
  qualify: string[][];
  termcondition: string[][];
  timetable: string[][];
}

const TEMPLATE_PATH = "/templates/nitsamplecopy.json";
const EARNEST_MONEY_RATE = 0.02;

const DEFAULT_VALIDITY_DAYS = "120 days";
const DEFAULT_COMPLETION_DAYS = "30 days";

export const NITCopy = ({
  nitdetails,
}: {
  nitdetails: fetchnitdetailsType;
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [tenderTerms, setTenderTerms] = useState<TenderTerm[]>([]);
  const [isLoadingTerms, setIsLoadingTerms] = useState(true);
  const [selectedTemplates, setSelectedTemplates] = useState<
    TenderTermTemplate[]
  >([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const templateIds = nitdetails.termsTemplateIds ?? [];
  const templateIdsKey = templateIds.join(",");

  // Fetch tender terms from database
  useEffect(() => {
    const fetchTenderTerms = async () => {
      setIsLoadingTerms(true);
      setError(null);
      try {
        const response = await fetch("/api/tender-terms");
        if (!response.ok) {
          throw new Error(
            `Failed to fetch tender terms: ${response.statusText}`,
          );
        }
        const terms: TenderTerm[] = await response.json();
        setTenderTerms(terms || []);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to fetch tender terms";
        console.error("Error fetching tender terms:", err);
        setError(errorMessage);
        setTenderTerms([]);
      } finally {
        setIsLoadingTerms(false);
      }
    };

    fetchTenderTerms();
  }, []);

  // Fetch selected templates
  useEffect(() => {
    if (!templateIds.length) {
      setSelectedTemplates([]);
      setIsLoadingTemplates(false);
      return;
    }

    setIsLoadingTemplates(true);
    setError(null);
    const controller = new AbortController();

    const fetchTemplates = async () => {
      try {
        const response = await fetch(
          `/api/tender-term-templates?ids=${templateIds.join(",")}`,
          { signal: controller.signal },
        );
        if (!response.ok) {
          throw new Error(`Failed to load templates: ${response.statusText}`);
        }
        const data: TenderTermTemplate[] = await response.json();
        setSelectedTemplates(data || []);
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        const errorMessage =
          err instanceof Error ? err.message : "Failed to load templates";
        console.error("Error fetching templates:", err);
        setError(errorMessage);
        setSelectedTemplates([]);
      } finally {
        setIsLoadingTemplates(false);
      }
    };

    fetchTemplates();

    return () => controller.abort();
  }, [templateIds, templateIdsKey]);

  // Extract template content by category
  const templateContentByCategory = useMemo<TermsByCategory>(() => {
    return selectedTemplates.reduce<TermsByCategory>(
      (acc, template) => {
        const content = template.content ?? {};
        if (content.eligible?.length) {
          acc.ELIGIBLE.push(...content.eligible);
        }
        if (content.qualificationCriteria?.length) {
          acc.QUALIFICATION_CRITERIA.push(...content.qualificationCriteria);
        }
        if (content.termsConditions?.length) {
          acc.TERMS_CONDITIONS.push(...content.termsConditions);
        }
        return acc;
      },
      {
        ELIGIBLE: [],
        QUALIFICATION_CRITERIA: [],
        TERMS_CONDITIONS: [],
      },
    );
  }, [selectedTemplates]);

  // Get default terms from constants
  const defaultTerms = useMemo<TermsByCategory>(() => {
    const defaultData = tendertermcon[0] || {};
    return {
      ELIGIBLE: defaultData.eligible || [],
      QUALIFICATION_CRITERIA: defaultData.qualidyceteria || [],
      TERMS_CONDITIONS: defaultData.termcondition || [],
    };
  }, []);

  // Get individual terms from database by category
  const individualTermsByCategory = useMemo<TermsByCategory>(() => {
    const termsByCategory: TermsByCategory = {
      ELIGIBLE: [],
      QUALIFICATION_CRITERIA: [],
      TERMS_CONDITIONS: [],
    };

    tenderTerms
      .filter((term) => term.isActive)
      .sort((a, b) => a.order - b.order)
      .forEach((term) => {
        if (term.category in termsByCategory) {
          termsByCategory[term.category].push(term.content);
        }
      });

    return termsByCategory;
  }, [tenderTerms]);

  // Get final terms for each category
  // If no termsTemplateIds found, use constant terms
  // If termsTemplateIds found, use terms from templates
  const finalTermsByCategory = useMemo<TermsByCategory>(() => {
    const categories: TermCategory[] = [
      "ELIGIBLE",
      "QUALIFICATION_CRITERIA",
      "TERMS_CONDITIONS",
    ];

    // If no template IDs, use constant terms
    if (!templateIds.length) {
      return defaultTerms;
    }

    // If template IDs exist, use terms from templates
    return categories.reduce<TermsByCategory>(
      (acc, category) => {
        const templateTerms = templateContentByCategory[category];
        // Use template terms if available, otherwise use defaults as fallback
        acc[category] =
          templateTerms.length > 0 ? templateTerms : defaultTerms[category];
        return acc;
      },
      {
        ELIGIBLE: [],
        QUALIFICATION_CRITERIA: [],
        TERMS_CONDITIONS: [],
      },
    );
  }, [templateIds.length, templateContentByCategory, defaultTerms]);

  // Format terms as numbered list items for PDF
  const formatTermsForPDF = useCallback((terms: string[]): string[][] => {
    return terms.map((content, index) => [`${index + 1}. ${content}`]);
  }, []);

  // Generate work items for PDF
  const generateWorkItems = useCallback((): string[][] => {
    const PERFORMANCE_SECURITY_RATE =
      nitdetails.percentageofworkvaluerequired / 100;
    return nitdetails.WorksDetail.map((work, index) => {
      const activityDescription =
        work.ApprovedActionPlanDetails?.activityDescription || "N/A";
      const activityCode = work.ApprovedActionPlanDetails?.activityCode || "";
      const schemeName = work.ApprovedActionPlanDetails?.schemeName || "N/A";
      const estimateAmount = work.finalEstimateAmount.toFixed(2);
      const participationFee = work.participationFee.toFixed(2);
      const earnestMoney = Math.round(
        work.finalEstimateAmount * EARNEST_MONEY_RATE,
      ).toString();
      const performanceSecurity = Math.round(
        work.finalEstimateAmount * PERFORMANCE_SECURITY_RATE,
      ).toString();

      return [
        (index + 1).toString(),
        `${activityDescription}${activityCode ? `-${activityCode}` : ""}`,
        schemeName,
        estimateAmount,
        participationFee,
        earnestMoney,
        performanceSecurity,
        DEFAULT_COMPLETION_DAYS,
      ];
    });
  }, [nitdetails.WorksDetail]);

  // Generate PDF input data
  const generatePDFInput = useCallback((): PDFInput => {
    const memoNumber = nitdetails.memoNumber;
    const memoYear = nitdetails.memoDate.getFullYear();
    const memoDateFormatted = formatDate(nitdetails.memoDate);

    return {
      callcount: `(E-Procurement- ${nitdetails.nitCount})`,
      memono1: `Memo No: ${memoNumber}/${gpcode}/${memoYear}`,
      memono2: `Memo No: ${memoNumber}/${gpcode}/${memoYear}`,
      memoDate1: `Date: ${memoDateFormatted}`,
      memoDate2: `Date: ${memoDateFormatted}`,
      worklist: generateWorkItems(),
      forwat: tenderForwardedTo.map((term, index) => [`${index + 1}. ${term}`]),
      elegible: formatTermsForPDF(finalTermsByCategory.ELIGIBLE),
      qualify: formatTermsForPDF(finalTermsByCategory.QUALIFICATION_CRITERIA),
      termcondition: formatTermsForPDF(finalTermsByCategory.TERMS_CONDITIONS),
      timetable: [
        [
          "Tender Publishing Date",
          formatDateTimeCustom(nitdetails.publishingDate),
        ],
        [
          "Bid Submission Start Date",
          formatDateTimeCustom(nitdetails.startTime),
        ],
        ["Bid Submission End Date", formatDateTimeCustom(nitdetails.endTime)],
        [
          "Technical Bid Opening Date",
          formatDateTimeCustom(nitdetails.technicalBidOpeningDate),
        ],
        ["Financial Bid Opening Date", "To be Notified later on"],
        [
          "Place of Opening Bids",
          "Office of The Pradhan, DHALPARA Gram Panchayat.",
        ],
        ["Validity of Bids", DEFAULT_VALIDITY_DAYS],
      ],
    };
  }, [nitdetails, finalTermsByCategory, generateWorkItems, formatTermsForPDF]);

  // Handle PDF generation
  const handleGeneratePDF = useCallback(async () => {
    if (isLoadingTerms || isLoadingTemplates) {
      toast({
        title: "Please wait",
        description: "Loading tender terms...",
        variant: "default",
      });
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const input = generatePDFInput();
      const pdf = await generatePDF(TEMPLATE_PATH, [input]);

      // Create and download PDF
      // Convert Uint8Array to ArrayBuffer for Blob compatibility
      const pdfBuffer =
        pdf instanceof Uint8Array
          ? pdf.buffer.slice(pdf.byteOffset, pdf.byteOffset + pdf.byteLength)
          : (pdf as any).buffer || pdf;
      const blob = new Blob([pdfBuffer], {
        type: "application/pdf",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `NIT_${nitdetails.nitCount}_${formatDate(
        new Date(),
      )}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "NIT Copy PDF generated successfully",
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to generate PDF";
      console.error("Error generating PDF:", err);
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  }, [
    isLoadingTerms,
    isLoadingTemplates,
    generatePDFInput,
    nitdetails.nitCount,
  ]);

  const isLoading = isLoadingTerms || isLoadingTemplates;
  const isDisabled = isGenerating || isLoading;

  return (
    <div className="p-4">
      <Button
        onClick={handleGeneratePDF}
        disabled={isDisabled}
        className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-md flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        aria-busy={isDisabled}
        title={
          isLoading
            ? "Loading tender terms..."
            : isGenerating
              ? "Generating PDF..."
              : "Generate NIT PDF"
        }
      >
        {isDisabled ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>{isGenerating ? "Generating..." : "Loading..."}</span>
          </>
        ) : (
          <>
            <Printer className="h-4 w-4" />
            <span>NIT PDF</span>
          </>
        )}
      </Button>
      {error && !isLoading && (
        <p className="mt-2 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};
