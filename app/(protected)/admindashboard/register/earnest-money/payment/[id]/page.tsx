import { db } from "@/lib/db";
import React from "react";
import { notFound } from "next/navigation";
import { formatDate } from "@/utils/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EMDActionsHeader } from "./EMDActionsHeader";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

const page = async ({ params }: PageProps) => {
  const { id } = await params;
  const emd = await db.earnestMoneyRegister.findUnique({
    where: {
      id,
    },
    include: {
      bidderName: {
        include: {
          WorksDetail: {
            include: {
              nitDetails: true,
              biddingAgencies: {
                include: {
                  agencydetails: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!emd) {
    notFound();
  }

  const agencyDetails =
    emd.bidderName?.WorksDetail?.biddingAgencies[0]?.agencydetails;
  const nitDetails = emd.bidderName?.WorksDetail?.nitDetails;

  return (
    <div className="container mx-auto p-4">
      <EMDActionsHeader id={id} status={emd.paymentstatus} />

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Payment Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">NIT Number</p>
                <p className="font-medium">{nitDetails?.memoNumber}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Agency Name</p>
                <p className="font-medium">{agencyDetails?.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Total EMD Amount
                </p>
                <p className="font-medium">₹{emd.earnestMoneyAmount}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Payment Status</p>
                <Badge
                  variant={
                    emd.paymentstatus === "paid" ? "success" : "destructive"
                  }
                >
                  {emd.paymentstatus}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Payment Date</p>
                <p className="font-medium">
                  {emd.paymentDate ? formatDate(emd.paymentDate) : "Not Paid"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Payment Method</p>
                <p className="font-medium">
                  {emd.paymentMethod || "Not Specified"}
                </p>
              </div>
              {emd.paymentMethod === "CHEQUE" && (
                <>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Cheque Number
                    </p>
                    <p className="font-medium">
                      {emd.chequeNumber || "Not Provided"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Cheque Date</p>
                    <p className="font-medium">
                      {emd.chequeDate
                        ? formatDate(emd.chequeDate)
                        : "Not Provided"}
                    </p>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default page;
