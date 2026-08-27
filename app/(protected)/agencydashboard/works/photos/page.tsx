import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import WorkSelector from "./work-selector";

export default async function UploadWorkPhotosPage() {
  const user = await currentUser();
  const loginAgencyId = user?.agencyDetailsId;

  const works = loginAgencyId
    ? await db.worksDetail.findMany({
        where: {
          AwardofContract: {
            workorderdetails: {
              some: { Bidagency: { agencyDetailsId: loginAgencyId } },
            },
          },
        },
        include: {
          nitDetails: true,
          ApprovedActionPlanDetails: true,
          workPhotos: {
            select: { status: true, isVerified: true },
          },
        },
      })
    : [];

  return (
    <div className="space-y-6 md:space-y-8 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-600 to-purple-600">Work Photos</h1>
          <p className="text-xs md:text-sm font-medium text-slate-500 mt-1 md:mt-2">Manage and upload site progress photographs.</p>
        </div>
      </div>
      
      <WorkSelector works={works} />
    </div>
  );
}
