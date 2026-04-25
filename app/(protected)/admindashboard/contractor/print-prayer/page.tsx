import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import PrintPrayerClient from "./PrintPrayerClient";

const page = async () => {
  const worklist = await db.worksDetail.findMany({
    where: {
      tenderStatus: "AOC",
      awardofContractId: { not: null },
    },
    include: {
      nitDetails: true,
      ApprovedActionPlanDetails: true,
      paymentDetails: {
        include: {
          securityDeposit: true,
        }
      },
      AwardofContract: {
        include: {
          workorderdetails: {
            include: {
              Bidagency: {
                include: {
                  agencydetails: true,
                },
              },
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Group worklist by agency
  const groupedByAgency = worklist.reduce((acc, work) => {
    const workOrderDetail = work.AwardofContract?.workorderdetails?.[0];
    const agencyName = workOrderDetail?.Bidagency?.agencydetails?.name || "Unknown Agency";
    
    if (!acc[agencyName]) {
      acc[agencyName] = [];
    }
    
    acc[agencyName].push(work);
    return acc;
  }, {} as Record<string, typeof worklist>);

  // Get agency list sorted by name
  const agencyNames = Object.keys(groupedByAgency).sort();

  return (
    <div className="space-y-4 -mx-6 px-6 py-4">
      <div className="flex justify-start mb-2">
        <Button 
          asChild 
          variant="outline" 
          className="group border-2 border-slate-300 hover:border-indigo-500 bg-white/80 backdrop-blur-sm hover:bg-gradient-to-r hover:from-indigo-50 hover:to-blue-50 transition-all duration-300 rounded-xl shadow-sm hover:shadow-md"
        >
          <Link href="/admindashboard/contractor" className="flex items-center gap-2 font-medium">
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Back to Contractor
          </Link>
        </Button>
      </div>
      <PrintPrayerClient
        worklist={worklist as any}
        groupedByAgency={groupedByAgency as any}
        agencyNames={agencyNames}
      />
    </div>
  );
};

export default page;
