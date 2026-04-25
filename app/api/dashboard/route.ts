import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const year = searchParams.get("year");

  let dateFilter = {};
  if (year && year !== "all") {
    const startOfYear = new Date(`${year}-01-01T00:00:00.000Z`);
    const endOfYear = new Date(`${year}-12-31T23:59:59.999Z`);
    dateFilter = {
      createdAt: {
        gte: startOfYear,
        lte: endOfYear,
      },
    };
  }

  // Some models might use different date fields, but most use createdAt
  const paymentDateFilter = year && year !== "all" 
    ? { billPaymentDate: { gte: new Date(`${year}-01-01`), lte: new Date(`${year}-12-31`) } }
    : {};

  const [
    totalWarish,
    approvedWarish,
    rejectedWarish,
    processWarish,
    pendingWarish,
    totalverify,
    verifypending,
    totalWorks,
    completedWorks,
    inProgressWorks,
    approvedWorks,
    workOrders,
    agreements,
    totalNITs,
    publishedNITs,
    aocNITs,
    retenderNITs,
    cancelledNITs,
    totalAgencies,
    totalBids,
    totalPayments,
    totalBookings,
    completedBookings,
    pendingBookings,
    staffAttendance,
  ] = await Promise.all([
    db.warishApplication.count({ where: dateFilter }),
    db.warishApplication.count({ where: { ...dateFilter, warishApplicationStatus: "approved" } }),
    db.warishApplication.count({ where: { ...dateFilter, warishApplicationStatus: "rejected" } }),
    db.warishApplication.count({ where: { ...dateFilter, warishApplicationStatus: "process" } }),
    db.warishApplication.count({ where: { ...dateFilter, warishApplicationStatus: "pending" } }),
    db.warishApplication.count({ where: { ...dateFilter, warishdocumentverified: true } }),
    db.warishApplication.count({ where: { ...dateFilter, warishdocumentverified: false } }),
    db.worksDetail.count({ where: dateFilter }),
    db.worksDetail.count({ where: { ...dateFilter, workStatus: "workcompleted" } }),
    db.worksDetail.count({ where: { ...dateFilter, workStatus: "workinprogress" } }),
    db.worksDetail.count({ where: { ...dateFilter, workStatus: "approved" } }),
    db.workorderdetails.count(), // No date field easily available without join
    db.aggrementModel.count(), // No date field easily available
    db.nitDetails.count({ where: dateFilter }),
    db.worksDetail.count({ where: { ...dateFilter, tenderStatus: "published" } }),
    db.worksDetail.count({ where: { ...dateFilter, tenderStatus: "AOC" } }),
    db.worksDetail.count({ where: { ...dateFilter, tenderStatus: "Retender" } }),
    db.worksDetail.count({ where: { ...dateFilter, tenderStatus: "Cancelled" } }),
    db.agencyDetails.count(), // Agencies are global usually
    db.bidagency.count(),
    db.paymentDetails.count({ where: paymentDateFilter }),
    db.booking.count({ where: dateFilter }),
    db.booking.count({ where: { ...dateFilter, status: "COMPLETED" } }),
    db.booking.count({ where: { ...dateFilter, status: "PENDING" } }),
    db.user.findMany({
      where: { role: "staff" },
      select: {
        id: true,
        name: true,
        designation: true,
        attendances: {
          where: {
            date: {
              gte: new Date(new Date().setHours(0, 0, 0, 0)),
              lt: new Date(new Date().setHours(24, 0, 0, 0)),
            },
          },
        },
      },
    }),
  ]);

  return NextResponse.json({
    totalWarish,
    approvedWarish,
    rejectedWarish,
    processWarish,
    pendingWarish,
    totalverify,
    verifypending,
    totalWorks,
    completedWorks,
    inProgressWorks,
    approvedWorks,
    workOrders,
    agreements,
    totalNITs,
    publishedNITs,
    aocNITs,
    retenderNITs,
    cancelledNITs,
    totalAgencies,
    totalBids,
    totalPayments,
    totalBookings,
    completedBookings,
    pendingBookings,
    staffAttendance: staffAttendance.map((staff: any) => ({
      id: staff.id,
      name: staff.name,
      designation: staff.designation,
      attendance: staff.attendances[0] || null,
    })),
    timestamp: Date.now(),
  });
}
