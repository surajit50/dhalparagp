import { db } from "@/lib/db";
import AdminPhotoVerificationClient from "./AdminPhotoVerificationClient";
import {  Prisma } from "@prisma/client";

export default async function Page({
  searchParams,
}: {
  searchParams: { year?: string };
}) {
  // Get available years from NitDetails for the filter
  const yearRange = await db.nitDetails.aggregate({
    _min: { memoDate: true },
    _max: { memoDate: true },
  });

  const years = [];
  if (yearRange._min.memoDate && yearRange._max.memoDate) {
    const minYear = yearRange._min.memoDate.getFullYear();
    const maxYear = yearRange._max.memoDate.getFullYear();
    for (let y = maxYear; y >= minYear; y--) {
      years.push(y);
    }
  } else {
    years.push(new Date().getFullYear());
  }

  // Ensure unique years and sort descending
  const uniqueYears = Array.from(new Set(years)).sort((a, b) => b - a);

  const selectedYearStr = searchParams.year || "all";
  let selectedYear: number | "all" = selectedYearStr === "all" ? "all" : parseInt(selectedYearStr);

  if (selectedYear !== "all" && isNaN(selectedYear)) {
    selectedYear = uniqueYears[0] || "all";
  }

  type WorkPhotoWithDetails = Prisma.WorkPhotoGetPayload<{
    include: {
      WorksDetail: {
        include: {
          ApprovedActionPlanDetails: true;
          nitDetails: true;
        };
      };
      Bidagency: {
        include: {
          agencydetails: true;
        };
      };
    };
  }>;

  let photos: WorkPhotoWithDetails[] = [];
  try {
    const where: Prisma.WorkPhotoWhereInput = {};
    if (selectedYear !== "all") {
      const startDate = new Date(selectedYear, 0, 1);
      const endDate = new Date(selectedYear + 1, 0, 1);
      where.WorksDetail = {
        nitDetails: {
          memoDate: {
            gte: startDate,
            lt: endDate,
          },
        },
      };
    }

    photos = await db.workPhoto.findMany({
      where,
      orderBy: { uploadedAt: "desc" },
      include: {
        WorksDetail: {
          include: {
            ApprovedActionPlanDetails: true,
            nitDetails: true,
          },
        },
        Bidagency: {
          include: {
            agencydetails: true,
          },
        },
      },
    });
  } catch (error) {
    console.error("DB Error:", error);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">Work Photos Validation</h1>
      </div>
      <AdminPhotoVerificationClient
        initialPhotos={photos}
        availableYears={uniqueYears}
        selectedYear={selectedYear}
      />
    </div>
  );
}