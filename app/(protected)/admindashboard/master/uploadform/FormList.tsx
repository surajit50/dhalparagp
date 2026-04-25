"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { FormDownload } from "@/types/form";
import { deleteForm } from "@/action/public-action";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, Trash2, FileText } from "lucide-react";

interface FormListProps {
  initialForms: FormDownload[];
  total: number;
  page: number;
  pageSize: number;
}

export default function FormList({
  initialForms,
  total,
  page,
  pageSize,
}: FormListProps) {
  const [forms, setForms] = useState<FormDownload[]>(initialForms);
  const router = useRouter();

  const handleDelete = async (id: FormDownload["id"]) => {
    try {
      await deleteForm(id);
      setForms(forms.filter((form) => form.id !== id));
    } catch (error) {
      console.error("Failed to delete form:", error);
    }
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <Card className="shadow-sm border">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-lg">
          <FileText className="h-5 w-5 text-gray-600" />
          Form List
        </CardTitle>

        <Badge variant="secondary">
          {total} Forms
        </Badge>
      </CardHeader>

      <CardContent>

        {forms.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <FileText className="h-10 w-10 text-muted-foreground mb-3" />
            <p className="text-muted-foreground">
              No forms available
            </p>
          </div>
        ) : (

          <div className="rounded-md border">

            <Table>

              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-[80px]">Sl No</TableHead>
                  <TableHead>Form Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Download</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>

                {forms.map((form, i) => (

                  <TableRow
                    key={form.id}
                    className="hover:bg-muted/40 transition"
                  >

                    <TableCell className="font-medium">
                      {(page - 1) * pageSize + i + 1}
                    </TableCell>

                    <TableCell>
                      {form.name}
                    </TableCell>

                    <TableCell>
                      <Badge variant="outline">
                        {form.category}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <a
                        href={form.downloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-1"
                        >
                          <Download className="h-4 w-4" />
                          Download
                        </Button>
                      </a>
                    </TableCell>

                    <TableCell className="text-right">

                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(form.id)}
                        className="flex items-center gap-1"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </Button>

                    </TableCell>

                  </TableRow>

                ))}

              </TableBody>

            </Table>

          </div>
        )}

        {/* Pagination */}

        <div className="flex items-center justify-between mt-6">

          <Button
            variant="outline"
            onClick={() => router.push(`?page=${page - 1}`)}
            disabled={page === 1}
          >
            Previous
          </Button>

          <div className="text-sm text-muted-foreground">
            Page <span className="font-medium">{page}</span> of{" "}
            <span className="font-medium">{totalPages}</span>
          </div>

          <Button
            variant="outline"
            onClick={() => router.push(`?page=${page + 1}`)}
            disabled={page === totalPages}
          >
            Next
          </Button>

        </div>

      </CardContent>
    </Card>
  );
}
