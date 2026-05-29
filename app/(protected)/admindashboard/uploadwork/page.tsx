"use client";

import { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
    .refine((file) => file.size <= 5000000, `Max file size is 5MB.`)
    .refine(
      (file) =>
        [
          "application/vnd.ms-excel",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        ].includes(file.type),
      "Only Excel files are allowed."
    ),
});

type FormValues = z.infer<typeof formSchema>;

// Helper to transform Excel row to the format expected by createbulkschme
function transformToActionPlan(row: any): z.infer<typeof actionplanschema> {
  // Remove id if present
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

  // Normalize upasamiti
  let upasamiti: any = undefined;
  const rawUpasamiti = cleanRow.upasamiti || cleanRow.Upasamiti;
  if (rawUpasamiti) {
    const validUpasamitis = ["Janasastha", "Nari_O_Sishu", "Samajkalyan", "Krishi", "Pranisampad_Bikash", "Silpa", "Parikathama", "Annayna_o_Bividho"];
    // simple exact match or case-insensitive match
    const found = validUpasamitis.find(v => v.toLowerCase() === String(rawUpasamiti).toLowerCase());
    if (found) upasamiti = found;
  }

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
    upasamiti,
  };
}

export default function ExcelUpload() {
  const [uploadStatus, setUploadStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setUploadStatus(null);
    try {
      if (data.file) {
        const file = data.file;
        const reader = new FileReader();

        reader.onload = async (event) => {
          const binaryStr = event.target?.result;
          const workbook = XLSX.read(binaryStr, { type: "binary" });

          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];

          // Transform each row
          const cleanedData = jsonData.map(transformToActionPlan);

          // Optional: validate all rows against schema
          try {
            cleanedData.forEach(item => actionplanschema.parse(item));
          } catch (err) {
            setUploadStatus({
              type: "error",
              message: "Invalid data in Excel. Please check column headers and values (e.g., fundType must be 'Tied' or 'Untied').",
            });
            return;
          }

          // Now call createbulkschme with the cleaned data
          await createbulkschme(cleanedData);

          setUploadStatus({
            type: "success",
            message: "File uploaded successfully!",
          });
        };

        reader.readAsBinaryString(file);
      }
    } catch (error) {
      setUploadStatus({
        type: "error",
        message: "Failed to upload file. Please try again.",
      });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
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
                    <Label
                      htmlFor="file"
                      className="text-sm font-medium text-gray-700"
                    >
                      Select Excel File
                    </Label>
                    <FormControl>
                      <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                        <div className="space-y-1 text-center">
                          <FileSpreadsheet className="mx-auto h-12 w-12 text-gray-400" />
                          <div className="flex text-sm text-gray-600">
                            <label
                              htmlFor="file-upload"
                              className="relative cursor-pointer bg-white rounded-md font-medium text-orange-600 hover:text-orange-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-orange-500"
                            >
                              <span>Upload a file</span>
                              <input
                                id="file-upload"
                                type="file"
                                className="sr-only"
                                accept=".xlsx,.xls"
                                onChange={(e) =>
                                  field.onChange(e.target.files?.[0])
                                }
                              />
                            </label>
                            <p className="pl-1">or drag and drop</p>
                          </div>
                          <p className="text-xs text-gray-500">
                            Excel files up to 5MB
                          </p>
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className={cn(
                  "w-full",
                  form.formState.isSubmitting && "opacity-50 cursor-not-allowed"
                )}
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? "Uploading..." : "Upload"}
              </Button>
            </form>
          </Form>
          {uploadStatus && (
            <div
              className={cn(
                "mt-4 p-3 rounded-md flex items-center",
                uploadStatus.type === "success"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              )}
            >
              {uploadStatus.type === "success" ? (
                <CheckCircle className="w-5 h-5 mr-2" />
              ) : (
                <AlertCircle className="w-5 h-5 mr-2" />
              )}
              {uploadStatus.message}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
