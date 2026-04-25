"use client";

import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import * as XLSX from "xlsx";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Loader2, Upload, Check, ArrowLeft, Download } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Link from "next/link";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface EstimateType { id: string; name: string; code: string; }

export default function BulkUploadPage() {
  const router = useRouter();
  const [types, setTypes] = useState<EstimateType[]>([]);
  const [selectedType, setSelectedType] = useState<string>("");
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetch("/api/development-works/estimate-types")
      .then(res => res.json())
      .then(data => {
        setTypes(data);
        if(data.length > 0) setSelectedType(data[0].id);
      });
  }, []);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      setParsedData(jsonData);
    };
    reader.readAsArrayBuffer(file);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop, 
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'text/csv': ['.csv']
    },
    maxFiles: 1
  });

  const downloadTemplate = () => {
    const sampleData = [
      {
        "Page No": "P-12",
        "Chapter": "1st Corrigenda",
        "Code": "1.1.1",
        "Description": "Excavation in foundation trenches or drains (not exceeding 1.5 m in width), including dressing sides and ramming bottom",
        "Unit": "Cum",
        "Rate": 250.50,
        "Category": "Earthwork"
      },
      {
        "Page No": "P-12",
        "Chapter": "1st Corrigenda",
        "Code": "1.1.2",
        "Description": "Filling available excavated earth (excluding rock) in trenches, plinth, sides of foundation etc. in layers not exceeding 20cm",
        "Unit": "Cum",
        "Rate": 125.75,
        "Category": "Earthwork"
      },
      {
        "Page No": "P-45",
        "Chapter": "1st Corrigenda",
        "Code": "2.1.1",
        "Description": "Cement concrete 1:3:6 (1 cement: 3 coarse sand: 6 graded stone aggregate 40mm nominal size)",
        "Unit": "Cum",
        "Rate": 4500.00,
        "Category": "Concrete Work"
      }
    ];

    const ws = XLSX.utils.json_to_sheet(sampleData);
    ws['!cols'] = [
      { wch: 12 },
      { wch: 15 },
      { wch: 12 },
      { wch: 80 },
      { wch: 10 },
      { wch: 12 },
      { wch: 20 }
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Estimate Library");
    XLSX.writeFile(wb, "estimate-library-template.xlsx");
  };

  const handleUpload = async () => {
    if (!selectedType || parsedData.length === 0) return;
    setUploading(true);

    try {
        // Process data to match API expectations
        const formattedData = parsedData.map(row => ({
            estimateTypeId: selectedType,
            code: row.code || row.Code || row['Item No'] || row['Item No.'] || row['Item No / Code'] || '',
            pageReference: row.pageReference || row.PageReference || row['Page No'] || row['Page No.'] || row.Page || '',
            chapter: row.chapter || row.Chapter || row.corrigenda || row.Corrigenda || '',
            description: row.description || row.Description || row.Item,
            unit: row.unit || row.Unit,
            rate: Number(row.rate || row.Rate || 0),
            category: row.category || row.Category || 'General'
        })).filter(item => item.code && item.description && item.rate);

        if (formattedData.length === 0) {
            toast.error("No valid data found in file");
            setUploading(false);
            return;
        }

        let successCount = 0;
        let failCount = 0;

        // Execute in parallel chunks to speed up
        const chunkSize = 5;
        for (let i = 0; i < formattedData.length; i += chunkSize) {
            const chunk = formattedData.slice(i, i + chunkSize);
            await Promise.all(chunk.map(item => 
                fetch("/api/development-works/schedule-rates", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(item)
                }).then(res => res.ok ? successCount++ : failCount++)
            ));
        }

        toast.success(`Upload complete: ${successCount} success, ${failCount} failed`);
        if (successCount > 0) {
             router.push("/admindashboard/development-works/estimate-library");
        }
    } catch (error) {
        toast.error("Upload failed");
        console.error(error);
    } finally {
        setUploading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
       <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon">
            <Link href="/admindashboard/development-works/estimate-library">
                <ArrowLeft className="h-4 w-4" />
            </Link>
        </Button>
        <h1 className="text-2xl font-bold">Bulk Upload Library Items</h1>
      </div>

      <Card>
        <CardHeader><CardTitle>Upload Configuration</CardTitle></CardHeader>
        <CardContent className="space-y-4">
            <div className="flex justify-between items-center mb-4">
                <Button onClick={downloadTemplate} variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Download Template
                </Button>
            </div>
            <div className="space-y-2">
                <Label>Select Estimate Type</Label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent>
                        {types.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>

            <div {...getRootProps()} className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${isDragActive ? 'border-primary bg-primary/10' : 'border-gray-300'}`}>
                <input {...getInputProps()} />
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm text-gray-600">Drag & drop an Excel/CSV file here, or click to select</p>
                <p className="text-xs text-gray-500 mt-1">Required columns: Code, Description, Unit, Rate, Category</p>
                <p className="text-xs text-gray-500">Optional: Page No, Chapter</p>
                <p className="text-xs text-gray-500 mt-1">Use the sample template for proper format.</p>
            </div>

            {parsedData.length > 0 && (
                <div className="space-y-4">
                    <Alert>
                        <Check className="h-4 w-4" />
                        <AlertTitle>File Parsed</AlertTitle>
                        <AlertDescription>Found {parsedData.length} rows. Please review before uploading.</AlertDescription>
                    </Alert>
                    
                    <div className="max-h-64 overflow-auto border rounded-md">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Page No</TableHead>
                                    <TableHead>Chapter</TableHead>
                                    <TableHead>Code</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Unit</TableHead>
                                    <TableHead>Rate</TableHead>
                                    <TableHead>Category</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {parsedData.slice(0, 5).map((row, i) => (
                                    <TableRow key={i}>
                                        <TableCell>{row['Page No'] || row['Page No.'] || row.Page || row.pageReference || ''}</TableCell>
                                        <TableCell>{row.Chapter || row.chapter || row.Corrigenda || row.corrigenda || ''}</TableCell>
                                        <TableCell>{row.code || row.Code || row['Item No.'] || row['Item No']}</TableCell>
                                        <TableCell className="truncate max-w-[200px]">{row.description || row.Description || row.Item || ''}</TableCell>
                                        <TableCell>{row.unit || row.Unit}</TableCell>
                                        <TableCell>{row.rate || row.Rate}</TableCell>
                                        <TableCell>{row.category || row.Category}</TableCell>
                                    </TableRow>
                                ))}
                                {parsedData.length > 5 && (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center text-muted-foreground">
                                            ... and {parsedData.length - 5} more rows
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    <div className="flex justify-end">
                        <Button onClick={handleUpload} disabled={uploading}>
                            {uploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Upload {parsedData.length} Items
                        </Button>
                    </div>
                </div>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
