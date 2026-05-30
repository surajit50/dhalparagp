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

import { FileSpreadsheet, AlertCircle, CheckCircle } from "lucide-react";
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
        ].includes(file.type),
      "Only Excel files are allowed"
    ),
});

type FormValues = z.infer<typeof formSchema>;

// Transform Excel row to match actionplanschema
function transformExcelRow(row: any): z.infer<typeof actionplanschema> {
  const { id, ...cleanRow } = row;
  
  // Normalize fundType
  let fundType: "Tied" | "Untied" = "Tied";
  const rawFundType = cleanRow.fundType;
  if (rawFundType) {
    const ft = String(rawFundType).toLowerCase();
    if (ft === "untied") fundType = "Untied";
    else if (ft === "tied") fundType = "Tied";
  }
  
  // Convert numeric fields
  const estimatedCost = Number(cleanRow.estimatedCost) || 0;
  const generalFund = Number(cleanRow.generalFund) || 0;
  const scFund = Number(cleanRow.scFund) || 0;
  const stFund = Number(cleanRow.stFund) || 0;
  const beneficiariesSC = Number(cleanRow.beneficiariesSC) || 0;
  const beneficiariesST = Number(cleanRow.beneficiariesST) || 0;
  const beneficiariesGen = Number(cleanRow.beneficiariesGen) || 0;
  const totalUnit = Number(cleanRow.totalUnit) || 0;

  return {
    financialYear: String(cleanRow.financialYear || ""),
    themeName: String(cleanRow.themeName || ""),
    activityCode: String(cleanRow.activityCode || ""),
    activityName: String(cleanRow.activityName || ""),
    activityDescription: String(cleanRow.activityDescription || ""),
    activityFor: String(cleanRow.activityFor || ""),
    sector: String(cleanRow.sector || ""),
    locationofAsset: String(cleanRow.locationofAsset || ""),
    estimatedCost,
    totalduration: String(cleanRow.totalduration || ""),
    schemeName: String(cleanRow.schemeName || ""),
    generalFund,
    scFund,
    stFund,
    fundType,
    beneficiariesSC,
    beneficiariesST,
    beneficiariesGen,
    totalUnit,
  };
}

export default function ExcelUpload() {
  const [uploadStatus, setUploadStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const [isLoading, setIsLoading] = useState(false);

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

      // Transform rows to match schema
      const transformedData = jsonData.map(transformExcelRow);

      // Optional: validate each transformed row
      for (let i = 0; i < transformedData.length; i++) {
        try {
          actionplanschema.parse(transformedData[i]);
        } catch (err: any) {
          throw new Error(`Row ${i + 1} has invalid data: ${err.message}`);
        }
      }

      // Call bulk create which returns summary
      const result = await createbulkschme(transformedData);

      // Display summary
      if (result.created === result.total && result.errors.length === 0) {
        setUploadStatus({
          type: "success",
          message: `✅ ${result.created} records uploaded successfully.`,
        });
      } else {
        let message = `📊 Upload complete: ${result.created} created, ${result.skipped} skipped (duplicate activity codes).`;
        if (result.duplicates.length > 0) {
          message += ` Duplicates: ${result.duplicates.slice(0, 5).join(", ")}${result.duplicates.length > 5 ? "..." : ""}`;
        }
        if (result.errors.length > 0) {
          message += ` ❌ Errors: ${result.errors.length} failed.`;
        }
        setUploadStatus({
          type: "success",
          message,
        });
      }

      form.reset();
    } catch (error: any) {
      setUploadStatus({
        type: "error",
        message: error.message || "Failed to upload Excel file. Please check the format.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh] p-6 bg-muted/40">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-center font-bold">
            Upload Excel File
          </CardTitle>
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
                      <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 text-center">
                        <FileSpreadsheet className="h-12 w-12 text-muted-foreground mb-2" />
                        <label
                          htmlFor="file-upload"
                          className="cursor-pointer text-primary font-medium"
                        >
                          Upload Excel
                        </label>
                        <input
                          id="file-upload"
                          type="file"
                          className="hidden"
                          accept=".xlsx,.xls"
                          onChange={(e) => field.onChange(e.target.files?.[0])}
                        />
                        <p className="text-xs text-muted-foreground mt-2">
                          XLSX / XLS files up to 5MB
                        </p>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={isLoading}
                className={cn("w-full", isLoading && "opacity-50 cursor-not-allowed")}
              >
                {isLoading ? "Uploading..." : "Upload Excel"}
              </Button>
            </form>
          </Form>

          {uploadStatus && (
            <div
              className={cn(
                "mt-6 flex items-center rounded-md p-3 text-sm",
                uploadStatus.type === "success"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              )}
            >
              {uploadStatus.type === "success" ? (
                <CheckCircle className="h-5 w-5 mr-2" />
              ) : (
                <AlertCircle className="h-5 w-5 mr-2" />
              )}
              {uploadStatus.message}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
