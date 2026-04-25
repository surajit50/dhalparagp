import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, Calendar, Download, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

const page = async ({ params }: Props) => {
  const { id } = await params;
  const notice = await db.notice.findUnique({
    where: { id },
    include: { files: true },
  });

  if (!notice) {
    notFound();
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link href="/admindashboard/notice/view">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Notices
            </Button>
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">{notice.title}</h1>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline">{notice.reference}</Badge>
                  <Badge className="bg-green-100 text-green-700">
                    {notice.type}
                  </Badge>
                </div>
              </div>
              <Link href={`/admindashboard/notice/edit/${notice.id}`}>
                <Button>Edit Notice</Button>
              </Link>
            </div>

            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-green-600" />
                {notice.department}
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-green-600" />
                {new Date(notice.createdAt).toLocaleDateString()}
              </div>
            </div>

            <div className="prose max-w-none">
              <p className="text-gray-700 whitespace-pre-wrap">
                {notice.description}
              </p>
            </div>

            {notice.files && notice.files.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-medium">Attached Files</h3>
                <div className="flex flex-wrap gap-2">
                  {notice.files.map((file, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="gap-2 hover:bg-green-50"
                      onClick={() => window.open(file.url, "_blank")}
                    >
                      <Download className="h-4 w-4 text-green-600" />
                      {file.name}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default page;
