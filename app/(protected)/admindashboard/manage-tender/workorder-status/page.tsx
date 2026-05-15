import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Input } from "@/components/ui/input";
import { Search, FileText } from "lucide-react";

import { formatDate } from "@/utils/utils";
import { db } from "@/lib/db";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { WorkOrderActions } from "@/components/work-order-actions";
import { WorkOrderStatus } from "@/components/work-order-status";
import { StatusAlert } from "@/components/status-alert";
import { Badge } from "@/components/ui/badge";
import { ShowNitDetails } from "@/components/ShowNitDetails";
import { gpcode, gpnameinshort } from "@/constants/gpinfor";

export default async function AwardOfContractPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolved = await searchParams;

  const allWorkOrders = await db.workorderdetails.findMany({
    where: {
      Bidagency: {
        WorksDetail: {
          workStatus: {
            in: ["workorder", "yettostart"],
          },
        },
      },
    },
    include: {
      awardofcontractdetails: true,
      Bidagency: {
        include: {
          WorksDetail: {
            include: {
              nitDetails: true,
            },
          },
          agencydetails: true,
        },
      },
    },
  });

  const notDelivered = allWorkOrders.filter(
    (order) => !order.awardofcontractdetails?.isdelivery,
  );

  const delivered = allWorkOrders.filter(
    (order) => order.awardofcontractdetails?.isdelivery,
  );

  const successMessage = resolved.success;
  const errorMessage = resolved.error;

  const renderTableRow = (
    order: (typeof allWorkOrders)[0],
    index: number,
    isDelivered: boolean,
  ) => (
    <TableRow
      key={order.id}
      className="hover:bg-gray-50 transition-all duration-150"
    >
      <TableCell className="font-semibold text-gray-700">{index + 1}</TableCell>

      <TableCell className="font-semibold text-orange-800">
        <ShowNitDetails
          nitdetails={order.Bidagency?.WorksDetail?.nitDetails.memoNumber || 0}
          memoDate={
            order.Bidagency?.WorksDetail?.nitDetails.memoDate || new Date()
          }
          workslno={order.Bidagency?.WorksDetail?.workslno || 0}
        />
      </TableCell>

      <TableCell className="font-semibold text-orange-700 tracking-wide">
        {order.awardofcontractdetails?.workodermenonumber}/{gpcode}/
        {order.awardofcontractdetails?.workordeermemodate.getFullYear()}
      </TableCell>

      <TableCell>
        {formatDate(order.awardofcontractdetails?.workordeermemodate)}
      </TableCell>

      <TableCell>
        {order.awardofcontractdetails?.deliveryDate
          ? formatDate(order.awardofcontractdetails.deliveryDate)
          : "-"}
      </TableCell>

      <TableCell className="font-medium">
        {order.Bidagency?.agencydetails?.name}
      </TableCell>

      <TableCell>
        <WorkOrderStatus isDelivered={isDelivered} />
      </TableCell>

      <TableCell>
        <WorkOrderActions workOrderId={order.id} isDelivered={isDelivered} />
      </TableCell>
    </TableRow>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* WB GOVT HEADER */}
      <div className="bg-gradient-to-r from-orange-900 to-orange-700 text-white shadow-md border-b-4 border-yellow-400">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <FileText className="h-7 w-7" />
            <div>
              <h1 className="text-xl md:text-2xl font-bold tracking-wide">
                Award of Contract Management System
              </h1>
              <p className="text-orange-100 text-sm">
                Government of West Bengal – e-Tender Work Order Monitoring
              </p>
            </div>
          </div>

          <div className="text-sm mt-3 md:mt-0 text-orange-100 text-right">
            <div>
              <strong>Gram Panchayat:</strong> {gpnameinshort} GP
            </div>
            <div>
              <strong>GP Code:</strong> {gpcode}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {successMessage && (
          <StatusAlert
            type="success"
            message={decodeURIComponent(successMessage as string)}
          />
        )}

        {errorMessage && (
          <StatusAlert
            type="error"
            message={decodeURIComponent(errorMessage as string)}
          />
        )}

        <Card className="shadow-xl border border-orange-200 rounded-xl overflow-hidden">
          <CardHeader className="bg-orange-50 border-b">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
              <CardTitle className="text-orange-900 text-lg font-semibold">
                Work Order List
              </CardTitle>

              <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search Work Order..."
                  className="pl-10 bg-white border-orange-200 focus-visible:ring-orange-600"
                />
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <Tabs defaultValue="notdelivered">
              <TabsList className="w-full bg-gray-100 rounded-none border-b border-gray-300">
                <TabsTrigger
                  value="notdelivered"
                  className="flex-1 rounded-none data-[state=active]:bg-white data-[state=active]:text-orange-800 data-[state=active]:shadow-sm py-3"
                >
                  Pending Delivery
                  <Badge className="ml-2 bg-orange-700 hover:bg-orange-800 text-white shadow-sm">
                    {notDelivered.length}
                  </Badge>
                </TabsTrigger>

                <TabsTrigger
                  value="delivered"
                  className="flex-1 rounded-none data-[state=active]:bg-white data-[state=active]:text-green-800 data-[state=active]:shadow-sm py-3"
                >
                  Delivered
                  <Badge className="ml-2 bg-green-700 hover:bg-green-800 text-white shadow-sm">
                    {delivered.length}
                  </Badge>
                </TabsTrigger>
              </TabsList>

              {/* NOT DELIVERED */}

              <TabsContent value="notdelivered" className="m-0">
                <div className="overflow-x-auto max-h-[65vh] overflow-y-auto">
                  <Table>
                    <TableHeader className="bg-orange-100 sticky top-0 z-10">
                      <TableRow>
                        {[
                          "Sl No",
                          "NIT No",
                          "Work Order No",
                          "Order Date",
                          "Delivery Date",
                          "Agency",
                          "Status",
                          "Actions",
                        ].map((header) => (
                          <TableHead
                            key={header}
                            className="text-orange-900 font-semibold"
                          >
                            {header}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      {notDelivered.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={8}
                            className="text-center py-8 text-gray-500"
                          >
                            No pending work orders found
                          </TableCell>
                        </TableRow>
                      ) : (
                        notDelivered.map((order, i) =>
                          renderTableRow(order, i, false),
                        )
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>

              {/* DELIVERED */}

              <TabsContent value="delivered" className="m-0">
                <div className="overflow-x-auto max-h-[65vh] overflow-y-auto">
                  <Table>
                    <TableHeader className="bg-green-100 sticky top-0 z-10">
                      <TableRow>
                        {[
                          "Sl No",
                          "NIT No",
                          "Work Order No",
                          "Order Date",
                          "Delivery Date",
                          "Agency",
                          "Status",
                          "Actions",
                        ].map((header) => (
                          <TableHead
                            key={header}
                            className="text-green-900 font-semibold"
                          >
                            {header}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      {delivered.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={8}
                            className="text-center py-8 text-gray-500"
                          >
                            No delivered work orders found
                          </TableCell>
                        </TableRow>
                      ) : (
                        delivered.map((order, i) =>
                          renderTableRow(order, i, true),
                        )
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
