import { db } from "@/lib/db";
import React from "react";
import { notFound } from "next/navigation";
import { formatDate } from "@/utils/utils";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CreditCard, FileText, Plus, Printer } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/admindashboard/register/earnest-money`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Payment Details</h1>
        </div>
        <Button asChild>
          <Link href={`/admindashboard/register/earnest-money/payment/${id}/add`}>
            <Plus className="mr-2 h-4 w-4" />
            Add Payment
          </Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link href={`/admindashboard/register/earnest-money/payment/${id}/print`}>
            <Printer className="mr-2 h-4 w-4" />
            Print Receipt
          </Link>
        </Button>
      </div>

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
