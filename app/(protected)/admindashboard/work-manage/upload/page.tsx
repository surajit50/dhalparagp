"use client";

import { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import * as XLSX from "xlsx";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import {
  FileSpreadsheet,
  AlertCircle,
  CheckCircle,
  Download,
  Trash2,
  Eye,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createbulkschme } from "@/action/uploadwork";
import { actionplanschema } from "@/schema/actionplan";

const formSchema = z.object({
  file: z
    .instanceof(File)
    .refine((file) => file.size <= 5 * 1024 * 1024, "Max file size is 5MB")
    .refine(
      (file) =>
        [
          "application/vnd.ms-excel",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "text/csv",
        ].includes(file.type) ||
        file.name.endsWith(".xlsx") ||
        file.name.endsWith(".xls") ||
        file.name.endsWith(".csv"),
      "Only Excel files (.xlsx, .xls) are allowed"
    ),
});

type FormValues = z.infer<typeof formSchema>;

// Enhanced transform function with better error handling
function transformExcelRow(row: any, index: number): any {
  const errors: string[] = [];
  
  // Helper to get value with case-insensitive key matching
  const getValue = (key: string) => {
    const keys = Object.keys(row);
    const foundKey = keys.find(k => k.toLowerCase().trim() === key.toLowerCase().trim());
    return foundKey ? row[foundKey] : undefined;
  };

  // Required fields mapping with validation
  const requiredFields = {
    financialYear: { type: 'string', required: true },
    themeName: { type: 'string', required: true },
    activityCode: { type: 'string', required: true },
    activityName: { type: 'string', required: true },
    activityDescription: { type: 'string', required: true },
    activityFor: { type: 'string', required: true },
    sector: { type: 'string', required: true },
    locationofAsset: { type: 'string', required: true },
    estimatedCost: { type: 'number', required: true },
    totalduration: { type: 'string', required: true },
    schemeName: { type: 'string', required: true },
    generalFund: { type: 'number', required: true },
    scFund: { type: 'number', required: true },
    stFund: { type: 'number', required: true },
    fundType: { type: 'string', required: true },
  };

  // Validate required fields
  for (const [field, config] of Object.entries(requiredFields)) {
    const value = getValue(field);
    if (config.required && (value === undefined || value === null || value === '')) {
      errors.push(`Missing required field: ${field}`);
    }
  }

  if (errors.length > 0) {
    throw new Error(`Row ${index + 1} validation failed: ${errors.join(', ')}`);
  }

  // Extract values with case-insensitive matching
  const financialYear = String(getValue('financialYear') || '').trim();
  const themeName = String(getValue('themeName') || '').trim();
  const activityCode = String(getValue('activityCode') || '').trim();
  const activityName = String(getValue('activityName') || '').trim();
  const activityDescription = String(getValue('activityDescription') || '').trim();
  const activityFor = String(getValue('activityFor') || '').trim();
  const sector = String(getValue('sector') || '').trim();
  const locationofAsset = String(getValue('locationofAsset') || '').trim();
  const totalduration = String(getValue('totalduration') || '').trim();
  const schemeName = String(getValue('schemeName') || '').trim();

  // Number conversions
  const estimatedCost = Number(getValue('estimatedCost')) || 0;
  const generalFund = Number(getValue('generalFund')) || 0;
  const scFund = Number(getValue('scFund')) || 0;
  const stFund = Number(getValue('stFund')) || 0;
  const beneficiariesSC = Number(getValue('beneficiariesSC')) || 0;
  const beneficiariesST = Number(getValue('beneficiariesST')) || 0;
  const beneficiariesGen = Number(getValue('beneficiariesGen')) || 0;
  const totalUnit = Number(getValue('totalUnit')) || 0;

  // Normalize fundType
  let fundType: "Tied" | "Untied" = "Tied";
  const rawFundType = String(getValue('fundType') || '').toLowerCase().trim();
  if (rawFundType === "untied") fundType = "Untied";
  else if (rawFundType === "tied") fundType = "Tied";

  // Optional fields
  const upasamiti = getValue('upasamiti') ? String(getValue('upasamiti')).trim() : undefined;
  const focusArea = getValue('focusArea') ? String(getValue('focusArea')).trim() : undefined;
  const workType = getValue('workType') ? String(getValue('workType')).trim() : undefined;
  const componentType = getValue('componentType') ? String(getValue('componentType')).trim() : undefined;
  const gramSansad = getValue('gramSansad') ? String(getValue('gramSansad')).trim() : undefined;
  const sdgs = getValue('sdgs') ? String(getValue('sdgs')).trim() : undefined;
  const unitType = getValue('unitType') ? String(getValue('unitType')).trim() : undefined;
  const implementedBy = getValue('implementedBy') ? String(getValue('implementedBy')).trim() : undefined;
  const remarks = getValue('remarks') ? String(getValue('remarks')).trim() : undefined;

  return {
    financialYear,
    themeName,
    activityCode,
    activityName,
    activityDescription,
    activityFor,
    sector,
    locationofAsset,
    estimatedCost,
    totalduration,
    schemeName,
    generalFund,
    scFund,
    stFund,
    fundType,
    upasamiti,
    focusArea,
    workType,
    componentType,
    gramSansad,
    sdgs,
    beneficiariesSC,
    beneficiariesST,
    beneficiariesGen,
    unitType,
    totalUnit,
    implementedBy,
    remarks,
  };
}

// Download sample template
const downloadSampleTemplate = () => {
  const headers = [
    'financialYear', 'themeName', 'activityCode', 'activityName',
    'activityDescription', 'activityFor', 'sector', 'locationofAsset',
    'estimatedCost', 'totalduration', 'schemeName', 'generalFund',
    'scFund', 'stFund', 'fundType', 'upasamiti', 'focusArea',
    'workType', 'componentType', 'gramSansad', 'sdgs',
    'beneficiariesSC', 'beneficiariesST', 'beneficiariesGen',
    'unitType', 'totalUnit', 'implementedBy', 'remarks'
  ];

  const sampleData = [
    [
      '2026-27', 'Theme 3 - Child Friendly Village', 'ACT-001', 'Maintenance of Classroom & AWC',
      'Repair of Anganwadi Centre AWC under Dhalpara Gram Panchayat', 'All', 'Maintenance of community system',
      'Kismat Dapt', '700000', '30 days', '16th CFC', '700000',
      '0', '0', 'Untied', 'ZillaParishad', 'Infrastructure',
      'Renovation', 'Building', 'Kismat Dapt', 'SDG-4',
      '32', '36', '64', 'Rooms', '1', 'GP', 'Urgent repair needed'
    ]
  ];

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet([headers, ...sampleData]);
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
  XLSX.writeFile(wb, 'action_plan_template.xlsx');
};

export default function ExcelUpload() {
  const [uploadStatus, setUploadStatus] = useState<{
    type: "success" | "error" | "info";
    message: string;
    details?: string[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setUploadStatus(null);
    setIsLoading(true);

    try {
      const file = data.file;
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];

      if (!jsonData.length) {
        throw new Error("Excel file is empty");
      }

      // Transform rows with validation
      const transformedData = [];
      const validationErrors = [];

      for (let i = 0; i < jsonData.length; i++) {
        try {
          const transformed = transformExcelRow(jsonData[i], i);
          // Validate against schema
          actionplanschema.parse(transformed);
          transformedData.push(transformed);
        } catch (err: any) {
          validationErrors.push(`Row ${i + 1}: ${err.message}`);
        }
      }

      if (validationErrors.length > 0) {
        setUploadStatus({
          type: "error",
          message: `❌ ${validationErrors.length} rows have validation errors`,
          details: validationErrors.slice(0, 10) // Show first 10 errors
        });
        setIsLoading(false);
        return;
      }

      if (transformedData.length === 0) {
        throw new Error("No valid data to upload");
      }

      // Call bulk create
      const result = await createbulkschme(transformedData);

      // Build detailed response
      let message = "";
      let details: string[] = [];

      if (result.created === result.total && result.errors.length === 0) {
        message = `✅ ${result.created} records uploaded successfully.`;
      } else {
        message = `📊 Upload complete: ${result.created} created, ${result.skipped} skipped`;
        
        if (result.duplicates.length > 0) {
          details.push(`Duplicate activity codes: ${result.duplicates.join(', ')}`);
        }
        
        if (result.errors.length > 0) {
          details.push(`Errors: ${result.errors.length} records failed`);
          result.errors.forEach(err => {
            details.push(`  - ${err.activityCode}: ${err.error}`);
          });
        }
      }

      setUploadStatus({
        type: result.errors.length > 0 ? "error" : "success",
        message,
        details: details.length > 0 ? details : undefined
      });

      form.reset();
      setFileName(null);
    } catch (error: any) {
      setUploadStatus({
        type: "error",
        message: error.message || "Failed to upload Excel file. Please check the format.",
        details: error.details || undefined
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      form.setValue('file', file);
    }
  };

  const clearFile = () => {
    setFileName(null);
    form.reset();
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh] p-6 bg-muted/40">
      <Card className="w-full max-w-2xl shadow-lg">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl text-center font-bold">
            Upload Action Plan Excel
          </CardTitle>
          <p className="text-sm text-muted-foreground text-center">
            Bulk upload action plan data using Excel file
          </p>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="file"
                render={({ field }) => (
                  <FormItem>
                    <Label>Select Excel File</Label>
                    <FormControl>
                      <div className={cn(
                        "flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-8 text-center transition-colors",
                        fileName ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50"
                      )}>
                        {fileName ? (
                          <div className="flex items-center gap-4 w-full justify-between">
                            <div className="flex items-center gap-2">
                              <FileSpreadsheet className="h-8 w-8 text-primary" />
                              <div className="text-left">
                                <p className="font-medium text-sm">{fileName}</p>
                                <p className="text-xs text-muted-foreground">Ready to upload</p>
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={clearFile}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <>
                            <FileSpreadsheet className="h-12 w-12 text-muted-foreground mb-2" />
                            <label
                              htmlFor="file-upload"
                              className="cursor-pointer text-primary font-medium hover:underline"
                            >
                              Choose Excel file
                            </label>
                            <p className="text-xs text-muted-foreground mt-2">
                              XLSX / XLS files up to 5MB
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Required columns: financialYear, themeName, activityCode, etc.
                            </p>
                          </>
                        )}
                        <input
                          id="file-upload"
                          type="file"
                          className="hidden"
                          accept=".xlsx,.xls"
                          onChange={handleFileChange}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-3">
                <Button
                  type="submit"
                  disabled={isLoading || !fileName}
                  className={cn(
                    "flex-1",
                    (isLoading || !fileName) && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {isLoading ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <FileSpreadsheet className="h-4 w-4 mr-2" />
                      Upload Excel
                    </>
                  )}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={downloadSampleTemplate}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Template
                </Button>
              </div>
            </form>
          </Form>

          {uploadStatus && (
            <div className="mt-6 space-y-2">
              <div
                className={cn(
                  "flex items-start rounded-md p-4 text-sm",
                  uploadStatus.type === "success"
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : uploadStatus.type === "error"
                    ? "bg-red-50 text-red-700 border border-red-200"
                    : "bg-blue-50 text-blue-700 border border-blue-200"
                )}
              >
                <div className="flex-1">
                  <div className="flex items-center">
                    {uploadStatus.type === "success" ? (
                      <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                    ) : uploadStatus.type === "error" ? (
                      <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                    ) : (
                      <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                    )}
                    <span className="font-medium">{uploadStatus.message}</span>
                  </div>
                  
                  {uploadStatus.details && uploadStatus.details.length > 0 && (
                    <div className="mt-2 pl-7 space-y-1">
                      {uploadStatus.details.map((detail, idx) => (
                        <p key={idx} className="text-xs opacity-90">
                          {detail}
                        </p>
                      ))}
                      {uploadStatus.details.length > 10 && (
                        <p className="text-xs opacity-70">
                          ... and {uploadStatus.details.length - 10} more errors
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
