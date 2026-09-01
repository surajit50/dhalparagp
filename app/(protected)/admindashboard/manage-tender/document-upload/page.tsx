import React from "react";
import { db } from "@/lib/db";
import { FileText } from "lucide-react";
import WorkDocumentUploader from "./WorkDocumentUploader";

export const metadata = {
  title: "Tender Document Upload",
  description: "Upload estimate, BOQ, Scrutinee Sheet, Agreement, drawing etc.",
};

async function getActiveNITs() {
  try {
    return await db.nitDetails.findMany({
      orderBy: { memoDate: "desc" },
      include: {
        WorksDetail: {
          include: {
            ApprovedActionPlanDetails: {
              select: {
                activityDescription: true,
                activityCode: true,
              },
            },
          },
        },
      },
    });
  } catch (error) {
    console.error("Failed to fetch NITs:", error);
    return [];
  }
}

export default async function TenderDocumentUploadPage() {
  const nits = await getActiveNITs();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="relative overflow-hidden bg-white/70 backdrop-blur-xl p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50">
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-400/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-400/10 rounded-full blur-3xl -ml-10 -mb-10 pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl shadow-lg shadow-orange-500/30">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-800 to-slate-600 tracking-tight">
                  Tender Document Upload
                </h1>
              </div>
              <p className="text-slate-500 font-medium ml-1">
                Upload & manage critical documents like Estimates, BOQs, Agreements, and Drawings for tendered works.
              </p>
            </div>
          </div>
        </div>
        
        {/* Main Content Component */}
        <div className="relative z-10">
          <WorkDocumentUploader nits={nits} />
        </div>
      </div>
    </div>
  );
}
