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
import { ApprovedActionPlanDetails } from "@prisma/client";

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

      const jsonData = XLSX.utils.sheet_to_json(
        worksheet
      ) as ApprovedActionPlanDetails[];

      if (!jsonData.length) {
        throw new Error("Excel file is empty");
      }

      await createbulkschme(jsonData);

      setUploadStatus({
        type: "success",
        message: `${jsonData.length} records uploaded successfully.`,
      });

      form.reset();
    } catch (error) {
      setUploadStatus({
        type: "error",
        message: "Failed to upload Excel file. Please check the format.",
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
                          onChange={(e) =>
                            field.onChange(e.target.files?.[0])
                          }
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
                className={cn(
                  "w-full",
                  isLoading && "opacity-50 cursor-not-allowed"
                )}
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
