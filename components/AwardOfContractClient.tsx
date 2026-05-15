/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useState, useMemo } from "react";

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

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { WorkOrderActions } from "@/components/work-order-actions";
import { WorkOrderStatus } from "@/components/work-order-status";
import { StatusAlert } from "@/components/status-alert";
import { Badge } from "@/components/ui/badge";
import { ShowNitDetails } from "@/components/ShowNitDetails";
import { formatDate } from "@/utils/utils";
import { gpcode } from "@/constants/gpinfor";

interface Props {
  workOrders: any[];
  successMessage?: string;
  errorMessage?: string;
}

export default function AwardOfContractClient({
  workOrders,
  successMessage,
  errorMessage,
}: Props) {
  const [search, setSearch] = useState("");

  const notDelivered = useMemo(() => {
    return workOrders.filter(
      (order) =>
        !order.awardofcontractdetails?.isdelivery && matchesSearch(order),
    );
  }, [workOrders, matchesSearch]);

  const delivered = useMemo(() => {
    return workOrders.filter(
      (order) =>
        order.awardofcontractdetails?.isdelivery && matchesSearch(order),
    );
  }, [workOrders, matchesSearch]);

  function matchesSearch(order: any) {
    const searchLower = search.toLowerCase();

    const agency = order.Bidagency?.agencydetails?.name?.toLowerCase() || "";

    const workOrderNo =
      order.awardofcontractdetails?.workodermenonumber
        ?.toString()
        .toLowerCase() || "";

    const nitNo =
      order.Bidagency?.WorksDetail?.nitDetails?.memoNumber
        ?.toString()
        .toLowerCase() || "";

    return (
      agency.includes(searchLower) ||
      workOrderNo.includes(searchLower) ||
      nitNo.includes(searchLower)
    );
  }

  const renderRow = (order: any, index: number, isDelivered: boolean) => (
    <TableRow key={order.id} className="hover:bg-orange-50">
      <TableCell>{index + 1}</TableCell>

      <TableCell className="text-orange-700 font-medium">
        <ShowNitDetails
          nitdetails={order.Bidagency?.WorksDetail?.nitDetails?.memoNumber}
          memoDate={order.Bidagency?.WorksDetail?.nitDetails?.memoDate}
          workslno={order.Bidagency?.WorksDetail?.workslno}
        />
      </TableCell>

      <TableCell className="text-orange-700 font-medium">
        {order.awardofcontractdetails?.workodermenonumber}/{gpcode}/
        {new Date(
          order.awardofcontractdetails?.workordeermemodate,
        ).getFullYear()}
      </TableCell>

      <TableCell>
        {formatDate(order.awardofcontractdetails?.workordeermemodate)}
      </TableCell>

      <TableCell>
        {order.awardofcontractdetails?.deliveryDate
          ? formatDate(order.awardofcontractdetails.deliveryDate)
          : "-"}
      </TableCell>

      <TableCell>{order.Bidagency?.agencydetails?.name}</TableCell>

      <TableCell>
        <WorkOrderStatus isDelivered={isDelivered} />
      </TableCell>

      <TableCell>
        <WorkOrderActions workOrderId={order.id} isDelivered={isDelivered} />
      </TableCell>
    </TableRow>
  );

  return (
    <div className="min-h-screen bg-orange-50">
      <div className="bg-orange-700 text-white px-6 py-4">
        <div className="flex items-center gap-2">
          <FileText />
          <h1 className="text-lg font-semibold">
            Award of Contract Management
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {successMessage && (
          <StatusAlert type="success" message={successMessage} />
        )}

        {errorMessage && <StatusAlert type="error" message={errorMessage} />}

        <Card>
          <CardHeader className="bg-orange-50 border-b">
            <div className="flex justify-between items-center">
              <CardTitle>Work Orders</CardTitle>

              <div className="relative w-80">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />

                <Input
                  placeholder="Search by Agency, NIT No, Work Order No"
                  className="pl-10"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <Tabs defaultValue="pending">
              <TabsList className="w-full">
                <TabsTrigger value="pending" className="flex-1">
                  Pending
                  <Badge className="ml-2">{notDelivered.length}</Badge>
                </TabsTrigger>

                <TabsTrigger value="delivered" className="flex-1">
                  Delivered
                  <Badge className="ml-2 bg-green-600">
                    {delivered.length}
                  </Badge>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="pending">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Sl</TableHead>
                      <TableHead>NIT No</TableHead>
                      <TableHead>Work Order</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Delivery</TableHead>
                      <TableHead>Agency</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {notDelivered.map((order, i) => renderRow(order, i, false))}
                  </TableBody>
                </Table>
              </TabsContent>

              <TabsContent value="delivered">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Sl</TableHead>
                      <TableHead>NIT No</TableHead>
                      <TableHead>Work Order</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Delivery</TableHead>
                      <TableHead>Agency</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {delivered.map((order, i) => renderRow(order, i, true))}
                  </TableBody>
                </Table>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
