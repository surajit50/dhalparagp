import UploadTender from "@/components/form/UploadTender";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { formatDate } from "@/utils/utils";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, FileText, Calendar, Hash } from "lucide-react";
import Link from "next/link";
import { gpcode } from "@/constants/gpinfor";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return {
    title: `Upload Tender - ${id}`,
  };
}

async function getTenderDetails(id: string) {
  const tender = await db.nitDetails.findUnique({
    where: { id },
  });

  if (!tender) notFound();

  return tender;
}

export default async function UploadTenderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const tender = await getTenderDetails(id);

  return (
    <div className="min-h-screen bg-muted/30">

      {/* Header */}
      <div className="bg-primary text-primary-foreground shadow">
        <div className="container mx-auto px-4 py-4">

          <h1 className="text-xl md:text-2xl font-bold">
            Notice Inviting Tender (NIT) Document Upload
          </h1>

        

        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-6 max-w-4xl">

        {/* Back button */}
        <Link
          href="/admindashboard/manage-tender/upload"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to NIT List
        </Link>

        {/* NIT Information Card */}
        <Card className="border shadow-sm">

          <CardHeader className="bg-muted/40 border-b">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <FileText className="h-5 w-5" />
              NIT Details
            </CardTitle>
          </CardHeader>

          <CardContent className="pt-6">

            <div className="grid md:grid-cols-3 gap-6">

              {/* Memo Number */}
              <div>
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Hash className="h-4 w-4" />
                  Memo Number
                </div>

                <div className="font-semibold text-lg text-primary">
                  {tender.memoNumber}/{gpcode}/{tender.memoDate.getFullYear()}
                </div>
              </div>

              {/* Memo Date */}
              <div>
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Calendar className="h-4 w-4" />
                  Memo Date
                </div>

                <div className="font-medium">
                  {formatDate(tender.memoDate)}
                </div>
              </div>

              {/* NIT ID */}
              <div>
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Hash className="h-4 w-4" />
                  NIT ID
                </div>

                <div className="font-mono text-sm bg-muted px-2 py-1 rounded">
                  {tender.id}
                </div>
              </div>

            </div>

          </CardContent>
        </Card>


        {/* Upload Section */}
        <Card className="mt-6 shadow-sm border">

          <CardHeader className="bg-muted/40 border-b">
            <CardTitle className="text-lg font-semibold">
              Upload Tender Document
            </CardTitle>
          </CardHeader>

          <CardContent className="pt-6">

            <UploadTender nitId={tender.id} />

          </CardContent>

        </Card>

      </div>

    </div>
  );
}
