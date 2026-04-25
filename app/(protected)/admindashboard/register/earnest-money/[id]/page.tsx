import { db } from "@/lib/db";
import React from "react";
import { notFound } from "next/navigation";
import { formatDate } from "@/utils/utils";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CreditCard, FileText, Printer } from "lucide-react";
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
            <Link href="/admindashboard/register/earnest-money">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Earnest Money Details</h1>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" asChild>
            <Link href={`/admindashboard/register/earnest-money/payment/${id}`}>
              <CreditCard className="mr-2 h-4 w-4" />
              Payment Details
            </Link>
          </Button>
          <Button variant="outline">
            <Printer className="mr-2 h-4 w-4" />
            Print Receipt
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
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
                <p className="text-sm text-muted-foreground">EMD Amount</p>
                <p className="font-medium">₹{emd.earnestMoneyAmount}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge
                  variant={
                    emd.paymentstatus === "paid" ? "success" : "destructive"
                  }
                >
                  {emd.paymentstatus}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Agency Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Contact Person</p>
                <p className="font-medium">{agencyDetails?.contactDetails}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Mobile Number</p>
                <p className="font-medium">{agencyDetails?.mobileNumber}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{agencyDetails?.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">PAN</p>
                <p className="font-medium">{agencyDetails?.pan}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">GST</p>
                <p className="font-medium">{agencyDetails?.gst}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">TIN</p>
                <p className="font-medium">{agencyDetails?.tin}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default page;
