import React from "react";
import { db } from "@/lib/db";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PlusCircle, FileText } from "lucide-react";
import NITListWithYearFilter from "./NITListWithYearFilter";
import { deleteNitAction } from "@/action/bookNitNuber";

async function getNITs() {
  try {
    return await db.nitDetails.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        WorksDetail: {
          include: {
            ApprovedActionPlanDetails: true,
          },
        },
      },
    });
  } catch (error) {
    console.error("Failed to fetch NITs:", error);
    return [];
  }
}

export default async function DemoPage() {
  const existnit = await getNITs();

  const handleDeleteNit = async (id: string) => {
    "use server";
    await deleteNitAction(id);
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9]">

      {/* NIC Header */}
      <div className="bg-[#1e40af] text-white shadow">

        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">

          <div className="flex items-center gap-3">

            <FileText className="h-7 w-7" />

            <div>
              <h1 className="text-lg font-semibold">
                Tender Management System
              </h1>

              <p className="text-xs text-blue-100">
                Government of West Bengal
              </p>
            </div>

          </div>

          <Link href="/admindashboard/manage-tender/create">
            <Button className="bg-white text-blue-700 hover:bg-blue-50">
              <PlusCircle className="mr-2 h-4 w-4" />
              Create New NIT
            </Button>
          </Link>

        </div>

      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">

        <div className="bg-white border border-gray-300 shadow-sm">

          {/* Section Title */}
          <div className="bg-[#e2e8f0] px-4 py-3 border-b">

            <h2 className="text-gray-700 font-semibold">
              NIT List
            </h2>

          </div>

          {/* Table */}
          <div className="p-4">

            <NITListWithYearFilter
              nits={existnit}
              onDeleteNit={handleDeleteNit}
            />

          </div>

        </div>

      </div>

    </div>
  );
}
