import { sentforTechnicalevelution } from "@/action/bookNitNuber";
import { BidderDetails } from "@/components/bidder-details";
import AddBidder from "@/components/form/AddBidder";
import { SubmitButton } from "@/components/submit-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShowWorkDetails } from "@/components/Work-details";
import { db } from "@/lib/db";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

type PageProps = {
  params: Promise<{ workid: string }>;
};

export default async function Page({ params }: PageProps) {
  const { workid } = await params;

  const workdetails = await db.worksDetail.findUnique({
    where: {
      id: workid,
      tenderStatus: { in: ["published", "TechnicalBidOpening"] },
    },
    include: {
      nitDetails: true,
      ApprovedActionPlanDetails: true,
      biddingAgencies: { include: { agencydetails: true } },
    },
  });

  if (!workdetails) notFound();

  const canSendForEvaluation =
    workdetails.tenderStatus === "TechnicalBidOpening" &&
    workdetails.biddingAgencies.length >= 3;

  return (
    <div className="min-h-screen bg-gray-100">
      
      {/* Orange Header Strip */}
      <div className="bg-orange-600 text-white py-4 shadow">
        <div className="max-w-7xl mx-auto px-4 flex items-center gap-4">
          <Link href="/admindashboard/manage-tender/addbidderdetails">
            <Button
              variant="secondary"
              size="sm"
              className="bg-white text-orange-700 hover:bg-orange-100"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
          </Link>

          <h1 className="text-xl md:text-2xl font-semibold">
            Manage Bidders
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">

            <Card className="border border-gray-300 shadow-sm">
              <CardHeader className="bg-orange-100 border-b border-gray-300 py-3">
                <CardTitle className="text-orange-900 text-base font-semibold">
                  Work Details
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <ShowWorkDetails worksDetailId={workdetails.id} />
              </CardContent>
            </Card>

            <BidderDetails
              workdetails={workdetails}
              workid={workdetails.id}
            />
          </div>

          {/* Right Column */}
          <div className="space-y-6">

            <Card className="border border-gray-300 shadow-sm">
              <CardHeader className="bg-orange-100 border-b border-gray-300 py-3">
                <CardTitle className="text-orange-900 text-base font-semibold">
                  Add Bidder
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <AddBidder workid={workdetails.id} />
              </CardContent>
            </Card>

            {canSendForEvaluation && (
              <Card className="border border-orange-400 shadow-sm">
                <CardHeader className="bg-orange-200 border-b border-orange-400 py-3">
                  <CardTitle className="text-orange-900 text-sm font-semibold">
                    Final Action
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <form action={sentforTechnicalevelution}>
                    <input
                      type="hidden"
                      name="workid"
                      value={workdetails.id}
                    />
                    <SubmitButton className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium">
                      Send for Technical Evaluation
                    </SubmitButton>
                  </form>

                  <p className="text-xs text-center text-gray-600 mt-3">
                    Minimum 3 bidders required for evaluation.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
