import { Suspense } from "react";
import UploadForm from "@/components/form/uploadForm";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { db } from "@/lib/db";
import { FormDownload } from "@/types/form";
import FormList from "./FormList";
import { FileText, UploadCloud, FolderOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";

async function getFormList(
  page: number = 1,
  pageSize: number = 10
): Promise<{ formlist: FormDownload[]; total: number }> {
  try {
    const formlist = await db.formDownload.findMany({
      take: pageSize,
      skip: (page - 1) * pageSize,
      orderBy: { id: "desc" },
    });

    const total = await db.formDownload.count();

    return { formlist, total };
  } catch (error) {
    console.error("Failed to fetch form list:", error);
    return { formlist: [], total: 0 };
  }
}

export default async function FormsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const resolved = await searchParams;
  const page = Number(resolved.page) || 1;
  const pageSize = 10;

  const { formlist, total } = await getFormList(page, pageSize);

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-8">

      {/* PAGE HEADER */}

      <div className="flex items-center justify-between">

        <div className="flex items-center gap-3">

          <div className="p-3 rounded-lg bg-blue-100">
            <FileText className="h-6 w-6 text-blue-700" />
          </div>

          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Form Management
            </h1>

            <p className="text-muted-foreground">
              Upload and manage downloadable forms
            </p>
          </div>
        </div>

        <Badge variant="secondary">
          {total} Total Forms
        </Badge>

      </div>

      {/* STATS */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        <Card className="shadow-sm border">
          <CardContent className="p-5 flex items-center gap-4">

            <div className="p-3 rounded-lg bg-green-100">
              <UploadCloud className="h-5 w-5 text-green-700" />
            </div>

            <div>
              <p className="text-sm text-muted-foreground">
                Upload New Form
              </p>

              <p className="text-lg font-semibold">
                Add documents for public download
              </p>
            </div>

          </CardContent>
        </Card>

        <Card className="shadow-sm border">
          <CardContent className="p-5 flex items-center gap-4">

            <div className="p-3 rounded-lg bg-purple-100">
              <FolderOpen className="h-5 w-5 text-purple-700" />
            </div>

            <div>
              <p className="text-sm text-muted-foreground">
                Current Page
              </p>

              <p className="text-lg font-semibold">
                Page {page}
              </p>
            </div>

          </CardContent>
        </Card>

      </div>

      {/* UPLOAD FORM */}

      <Card className="shadow-md border">

        <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-t-lg">

          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <UploadCloud className="h-5 w-5" />
            Upload New Form
          </CardTitle>

          <CardDescription className="text-blue-100">
            Upload a new document that users can download from the portal
          </CardDescription>

        </CardHeader>

        <CardContent className="p-6">
          <UploadForm />
        </CardContent>

      </Card>

      {/* FORM LIST */}

      <div>

        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <FolderOpen className="h-5 w-5 text-gray-600" />
          Available Forms
        </h2>

        <Suspense fallback={<div>Loading forms...</div>}>
          <FormList
            initialForms={formlist}
            total={total}
            page={page}
            pageSize={pageSize}
          />
        </Suspense>

      </div>

    </div>
  );
}
