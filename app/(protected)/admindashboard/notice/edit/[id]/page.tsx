import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import NoticeForm from "@/components/form/notice-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { getAllAgencies } from "@/lib/agencydata";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

const page = async ({ params }: Props) => {
  const { id } = await params;
  const [notice, agencies] = await Promise.all([
    db.notice.findUnique({
      where: { id },
      include: { files: true },
    }),
    getAllAgencies(),
  ]);

  if (!notice) {
    notFound();
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Link href="/admindashboard/notice/view">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Notices
            </Button>
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold mb-6">Edit Notice</h1>
          <NoticeForm
            agencies={agencies}
            initialData={{
              title: notice.title,
              description: notice.description,
              department: notice.department,
              type: notice.type,
              reference: notice.reference,
              agencyId: notice.agencyId || undefined,
              files: notice.files.map((file) => ({
                name: file.name,
                url: file.url,
                type: file.type,
                public_id: file.cloudinaryId || "",
              })),
            }}
            noticeId={notice.id}
          />
        </div>
      </div>
    </div>
  );
};

export default page;
