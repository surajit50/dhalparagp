import { db } from "@/lib/db";
import OrderCreationDialog from "./order-creation-dialog";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import type { Quotation, Bid, AgencyDetails } from "@prisma/client";

// Define extended type with relations
type QuotationWithBids = Quotation & {
  bids: (Bid & {
    agencyDetails: AgencyDetails | null;
  })[];
  order: any;
};

export default async function CreateOrderPage() {
  // First, let's get some debug information
  const totalQuotations = await db.quotation.count();
  const publishedQuotations = await db.quotation.count({
    where: { status: "PUBLISHED" },
  });
  const quotationsWithBids = await db.quotation.count({
    where: {
      status: "PUBLISHED",
      bids: { some: {} },
    },
  });
  const quotationsWithOrders = await db.quotation.count({
    where: {
      status: "PUBLISHED",
      bids: { some: {} },
      order: { isNot: null },
    },
  });

  console.log("📊 Debug Info:");
  console.log(`Total quotations: ${totalQuotations}`);
  console.log(`Published quotations: ${publishedQuotations}`);
  console.log(`Published with bids: ${quotationsWithBids}`);
  console.log(`Published with bids and orders: ${quotationsWithOrders}`);

  const quotations = (await db.quotation.findMany({
    where: {
      AND: [
        { status: "PUBLISHED" }, // Only published quotations
        { bids: { some: {} } }, // Only quotations with at least one bid
        { order: null }, // Only quotations without an existing order
      ],
    },
    include: {
      bids: {
        include: { agencyDetails: true },
        orderBy: [
          { isSelected: "desc" }, // Selected bids first
          { amount: "asc" }, // Then by amount
        ],
      },
      order: true, // Include order to verify it's null
    },
    orderBy: { createdAt: "desc" },
  })) as QuotationWithBids[];

  console.log(`Available quotations for order creation: ${quotations.length}`);

  // Process quotations with proper ranking based on quotation type
  const processedQuotations = quotations.map((quotation) => {
    // First check if there's a selected bid
    const selectedBid = quotation.bids.find((bid) => bid.isSelected);

    if (selectedBid) {
      // If there's a selected bid, use it as the winning bid
      return {
        ...quotation,
        bids: quotation.bids,
        winningBid: selectedBid,
      };
    }

    // If no selected bid, sort by quotation type and use the best one
    const sortedBids = [...quotation.bids].sort((a, b) => {
      if (quotation.quotationType === "SALE") {
        // For SALE: highest amount first (descending order)
        return b.amount - a.amount;
      } else {
        // For WORK and SUPPLY: lowest amount first (ascending order)
        return a.amount - b.amount;
      }
    });

    return {
      ...quotation,
      bids: sortedBids,
      winningBid: sortedBids[0] || null,
    };
  });

  // Fetch all orders for the list
  const orders = await db.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      quotation: true,
    },
  });

  return (
    <div className="min-h-screen bg-muted/40 py-8">
      <div className="container mx-auto px-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              Create New Order
            </CardTitle>
            <CardDescription>
              Select a quotation to create a purchase order. Only published
              quotations with bids and no existing orders are shown.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Debug Information */}
            <div className="bg-gray-50 border rounded-lg p-4 mb-6 text-sm">
              <h4 className="font-medium mb-2">System Status</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-gray-600">Total Quotations</p>
                  <p className="font-semibold">{totalQuotations}</p>
                </div>
                <div>
                  <p className="text-gray-600">Published</p>
                  <p className="font-semibold">{publishedQuotations}</p>
                </div>
                <div>
                  <p className="text-gray-600">With Bids</p>
                  <p className="font-semibold">{quotationsWithBids}</p>
                </div>
                <div>
                  <p className="text-gray-600">Already Ordered</p>
                  <p className="font-semibold">{quotationsWithOrders}</p>
                </div>
              </div>
            </div>

            {processedQuotations.length === 0 ? (
              <div className="text-center py-12">
                <div className="space-y-4">
                  <div className="text-6xl">📋</div>
                  <div>
                    <p className="text-lg font-medium text-muted-foreground mb-2">
                      No quotations available for order creation
                    </p>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>
                        Available: {quotationsWithBids - quotationsWithOrders}{" "}
                        quotations
                      </p>
                      <p>Possible reasons:</p>
                      <ul className="list-disc list-inside space-y-1 mt-2">
                        <li>
                          All quotations with bids already have orders created
                        </li>
                        <li>No published quotations have received bids yet</li>
                        <li>Quotations are still in draft status</li>
                      </ul>
                    </div>
                  </div>
                  <div className="flex gap-2 justify-center">
                    <Button asChild>
                      <Link href="/admindashboard/manage-qatation">
                        Manage Quotations
                      </Link>
                    </Button>
                    <Button asChild variant="outline">
                      <Link href="/admindashboard/manage-qatation/orders">
                        View Existing Orders
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center gap-2 text-blue-800">
                    <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                      ✓
                    </div>
                    <p className="text-sm font-medium">
                      {processedQuotations.length} quotation
                      {processedQuotations.length !== 1 ? "s" : ""} ready for
                      order creation
                    </p>
                  </div>
                </div>

                {processedQuotations.map((quotation) => {
                  const winningBid = quotation.winningBid;

                  // Calculate savings/excess
                  const difference = winningBid
                    ? winningBid.amount - quotation.estimatedAmount
                    : 0;
                  const isBelow = difference < 0;

                  return (
                    <div
                      key={quotation.id}
                      className="border rounded-lg p-6 bg-white hover:shadow-md transition-shadow"
                    >
                      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] items-start gap-6">
                        <div className="space-y-4">
                          {/* Quotation Header */}
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-lg text-gray-900">
                                {quotation.workName}
                              </h3>
                              <div className="flex items-center gap-2">
                                <span
                                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                                    quotation.quotationType === "SALE"
                                      ? "bg-green-100 text-green-800"
                                      : quotation.quotationType === "WORK"
                                      ? "bg-blue-100 text-blue-800"
                                      : "bg-purple-100 text-purple-800"
                                  }`}
                                >
                                  {quotation.quotationType}
                                </span>
                                {winningBid?.isSelected && (
                                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                                    Pre-selected
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <strong>NIT:</strong> {quotation.nitNo}
                              </span>
                              <span className="flex items-center gap-1">
                                <strong>Estimated:</strong>{" "}
                                {formatCurrency(quotation.estimatedAmount)}
                              </span>
                              <span className="flex items-center gap-1">
                                <strong>Total Bids:</strong>{" "}
                                {quotation.bids.length}
                              </span>
                              <span className="flex items-center gap-1">
                                <strong>Opening:</strong>{" "}
                                {new Date(
                                  quotation.openingDate
                                ).toLocaleDateString()}
                              </span>
                            </div>
                          </div>

                          {/* Winning Bid Details */}
                          {winningBid && (
                            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                              <h4 className="font-medium text-gray-900 flex items-center gap-2">
                                {winningBid.isSelected ? (
                                  <>⭐ Selected Bidder</>
                                ) : (
                                  <>
                                    🏆{" "}
                                    {quotation.quotationType === "SALE"
                                      ? "Highest Bidder"
                                      : "Lowest Bidder"}
                                  </>
                                )}
                              </h4>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <p className="text-sm text-gray-600">
                                    Bidder
                                  </p>
                                  <p className="font-medium">
                                    {winningBid.agencyDetails?.name ||
                                      "Unknown bidder"}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {winningBid.agencyDetails?.agencyType}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-600">
                                    {quotation.quotationType === "SALE"
                                      ? "Offer Amount"
                                      : "Bid Amount"}
                                  </p>
                                  <p className="font-medium text-lg">
                                    {formatCurrency(winningBid.amount)}
                                  </p>
                                  {winningBid.rank && (
                                    <p className="text-xs text-gray-500">
                                      Rank: #{winningBid.rank}
                                    </p>
                                  )}
                                </div>
                              </div>

                              {/* Difference from Estimate */}
                              {difference !== 0 && (
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                                      isBelow
                                        ? "bg-green-100 text-green-800"
                                        : "bg-red-100 text-red-800"
                                    }`}
                                  >
                                    {isBelow ? "💰 Savings" : "📈 Excess"}:{" "}
                                    {formatCurrency(Math.abs(difference))}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    (
                                    {(
                                      (Math.abs(difference) /
                                        quotation.estimatedAmount) *
                                      100
                                    ).toFixed(1)}
                                    %)
                                  </span>
                                </div>
                              )}

                              {winningBid.remarks && (
                                <div>
                                  <p className="text-sm text-gray-600">
                                    Remarks
                                  </p>
                                  <p className="text-sm bg-white p-2 rounded border">
                                    {winningBid.remarks}
                                  </p>
                                </div>
                              )}

                              {/* Bidder Contact Info */}
                              {winningBid.agencyDetails && (
                                <div className="text-xs text-gray-600 space-y-1">
                                  <p>
                                    <strong>Contact:</strong>{" "}
                                    {winningBid.agencyDetails.name}
                                  </p>
                                  <p>
                                    <strong>Phone:</strong>{" "}
                                    {winningBid.agencyDetails.mobileNumber}
                                  </p>
                                  <p>
                                    <strong>Email:</strong>{" "}
                                    {winningBid.agencyDetails.email}
                                  </p>
                                </div>
                              )}
                            </div>
                          )}

                          {/* All Bids Summary */}
                          {quotation.bids.length > 1 && (
                            <div className="text-xs text-gray-600">
                              <p className="font-medium mb-1">All Bids:</p>
                              <div className="space-y-1">
                                {quotation.bids
                                  .slice(0, 3)
                                  .map((bid, index) => (
                                    <p key={bid.id}>
                                      #{index + 1}: {bid.agencyDetails?.name} -{" "}
                                      {formatCurrency(bid.amount)}
                                      {bid.isSelected && " (Selected)"}
                                    </p>
                                  ))}
                                {quotation.bids.length > 3 && (
                                  <p>
                                    ... and {quotation.bids.length - 3} more
                                  </p>
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Action Button */}
                        <div className="flex flex-col gap-2">
                          {winningBid ? (
                            <OrderCreationDialog
                              quotation={quotation}
                              winningBid={winningBid}
                            />
                          ) : (
                            <Button variant="outline" disabled>
                              No Valid Bids
                            </Button>
                          )}

                          <Button asChild variant="ghost" size="sm">
                            <Link
                              href={`/admindashboard/manage-qatation/${quotation.id}`}
                            >
                              View Details
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="flex justify-between items-center mt-8 pt-6 border-t">
              <Button asChild variant="outline">
                <Link href="/admindashboard/manage-qatation/view">
                  ← Back to Quotations
                </Link>
              </Button>

              <Button asChild variant="outline">
                <Link href="/admindashboard/manage-qatation/orders">
                  View All Orders →
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Orders List Section */}
        <div className="mt-10">
          <h2 className="text-xl font-bold mb-4">All Orders</h2>
          {orders.length === 0 ? (
            <div className="text-muted-foreground">No orders found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border rounded">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-4 py-2 border">Order No</th>
                    <th className="px-4 py-2 border">Quotation</th>
                    <th className="px-4 py-2 border">Amount</th>
                    <th className="px-4 py-2 border">Status</th>
                    <th className="px-4 py-2 border">Created At</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td className="px-4 py-2 border">
                        {order.orderNo || order.id}
                      </td>
                      <td className="px-4 py-2 border">
                        {order.quotation?.workName || "-"}
                      </td>
                      <td className="px-4 py-2 border">
                        {formatCurrency(order.orderAmount)}
                      </td>
                      <td className="px-4 py-2 border">{order.status}</td>
                      <td className="px-4 py-2 border">
                        {/* Prinnt */}
                        <Link
                          href={`/admindashboard/manage-qatation/orders/print/${order.id}`}
                          className="text-blue-600 hover:underline"
                        >
                          Print
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
