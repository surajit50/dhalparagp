import React from "react";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";
import YearFilter from "./year-filter";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

type SubjectDef = {
  sectorName: string | null;
  subjectName: string;
  key: string;
  rowspanSector?: number;
};

type SectorGroupDef = {
  upaSamityName: string;
  subjects: SubjectDef[];
};

const SECTOR_GROUPS: SectorGroupDef[] = [
  {
    upaSamityName: "Education & Public Health",
    subjects: [
      { sectorName: "Education", subjectName: "Siksha", key: "Siksha" },
      { sectorName: "Public Health", subjectName: "Janasastha", key: "Janasastha" }
    ]
  },
  {
    upaSamityName: "Women & Children Development & Social Welfare",
    subjects: [
      { sectorName: "Women & Children Development & Social Welfare", subjectName: "Nari O Sishu", key: "Nari_O_Sishu", rowspanSector: 2 },
      { sectorName: null, subjectName: "Samajkalyan", key: "Samajkalyan" }
    ]
  },
  {
    upaSamityName: "Agriculture & Allied",
    subjects: [
      { sectorName: "Agriculture & Allied", subjectName: "Krishi", key: "Krishi", rowspanSector: 2 },
      { sectorName: null, subjectName: "Pranisampad Bikash", key: "Pranisampad_Bikash" }
    ]
  },
  {
    upaSamityName: "Small & Cottage Industries & Infrastructure",
    subjects: [
      { sectorName: "Small & Cottage Industries", subjectName: "Silpa", key: "Silpa" },
      { sectorName: "Infrastructure", subjectName: "Parikathama", key: "Parikathama" }
    ]
  },
  {
    upaSamityName: "Other Miscellaneous",
    subjects: [
      { sectorName: "Other Miscellaneous", subjectName: "Annayna o Bividho", key: "Annayna_o_Bividho" }
    ]
  }
];

export default async function UpasamitiReportPage({ searchParams }: PageProps) {
  const resolved = await searchParams;
  const financialYearFilter = resolved?.financialYear as string;

  // Get distinct financial years to populate the dropdown
  const distinctYears = await db.approvedActionPlanDetails.findMany({
    select: { financialYear: true },
    distinct: ["financialYear"],
    orderBy: { financialYear: "desc" },
  });
  const yearsList = distinctYears.map((y) => y.financialYear).filter(Boolean);
  const selectedYear = financialYearFilter || yearsList[0] || "2025-2026";

  // Fetch plans
  const plans = await db.approvedActionPlanDetails.findMany({
    where: { financialYear: selectedYear },
  });

  // Aggregation Structure
  const stats: Record<string, { activities: number, allocation: number }> = {};
  
  // Initialize stats
  SECTOR_GROUPS.forEach(group => {
    group.subjects.forEach(subject => {
      stats[subject.key] = { activities: 0, allocation: 0 };
    });
  });

  plans.forEach((plan) => {
    const upasamiti = plan.upasamiti;
    if (upasamiti && stats[upasamiti]) {
      stats[upasamiti].activities += 1;
      stats[upasamiti].allocation += (plan.estimatedCost || 0);
    }
  });

  let grandTotalActivities = 0;
  let grandTotalAllocation = 0;

  return (
    <div className="flex flex-col gap-6 p-6 w-full mx-auto pb-20">
      <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Sector wise Budgetary Allocation</h1>
          <p className="text-sm text-gray-500 mt-1">View the budgetary allocation broken down by Upa Samity and Sector</p>
        </div>
        <YearFilter years={yearsList} />
      </div>

      <Card className="shadow-lg border-t-4 border-t-blue-600 rounded-xl overflow-hidden">
        <CardHeader className="bg-gray-50/50 border-b border-gray-100 pb-4">
          <CardTitle className="text-center text-xl font-bold">Sector wise & Upa Samity wise Budgetary Allocation</CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          
          <div className="w-full border-b border-gray-200">
            <div className="flex w-full divide-x divide-gray-200 text-sm">
              <div className="flex-1 p-3"><span className="font-semibold">Name of Gram Panchayat :</span> No 3 Dhalpara GP</div>
              <div className="flex-1 p-3"><span className="font-semibold">Panchayat Samity :</span> Hili</div>
              <div className="flex-1 p-3 text-right"><span className="font-semibold">Year :</span> {selectedYear}</div>
            </div>
          </div>

          <Table className="border-collapse w-full">
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="border border-gray-300 border-dashed text-center font-bold text-red-600">Upa Samity</TableHead>
                <TableHead className="border border-gray-300 border-dashed text-center font-bold text-red-600">Sector</TableHead>
                <TableHead className="border border-gray-300 border-dashed text-center font-bold text-red-600">Subject</TableHead>
                <TableHead className="border border-gray-300 border-dashed text-center font-bold text-red-600">No. of<br/>Activities</TableHead>
                <TableHead className="border border-gray-300 border-dashed text-center font-bold text-red-600">Subject wise<br/>Budgetary<br/>Allocation (Rs)</TableHead>
                <TableHead className="border border-gray-300 border-dashed text-center font-bold text-red-600">Upa Samity<br/>wise Budgetary<br/>Allocation (Rs)</TableHead>
                <TableHead className="border border-gray-300 border-dashed text-center font-bold text-red-600">Remarks</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {SECTOR_GROUPS.map((group, groupIdx) => {
                const groupAllocation = group.subjects.reduce((sum, subj) => sum + stats[subj.key].allocation, 0);
                grandTotalAllocation += groupAllocation;
                
                return group.subjects.map((subject, subjIdx) => {
                  const subjectStats = stats[subject.key];
                  grandTotalActivities += subjectStats.activities;

                  return (
                    <TableRow key={`${groupIdx}-${subjIdx}`} className="hover:bg-transparent">
                      {/* Upa Samity cell - only on first row of group */}
                      {subjIdx === 0 && (
                        <TableCell rowSpan={group.subjects.length} className="border border-gray-300 border-dashed text-center align-middle w-48">
                          {group.upaSamityName}
                        </TableCell>
                      )}

                      {/* Sector cell - handles optional rowspan if sectors are merged */}
                      {subject.sectorName !== null && (
                        <TableCell rowSpan={subject.rowspanSector || 1} className="border border-gray-300 border-dashed text-center align-middle w-48">
                          {subject.sectorName}
                        </TableCell>
                      )}

                      {/* Subject cell */}
                      <TableCell className="border border-gray-300 border-dashed text-center align-middle p-4">
                        {subject.subjectName}
                      </TableCell>

                      {/* No of Activities */}
                      <TableCell className="border border-gray-300 border-dashed text-center align-middle tabular-nums">
                        {subjectStats.activities}
                      </TableCell>

                      {/* Subject wise Allocation */}
                      <TableCell className="border border-gray-300 border-dashed text-right align-middle tabular-nums">
                        ₹ {formatCurrency(subjectStats.allocation)}
                      </TableCell>

                      {/* Upa Samity wise Allocation - only on first row of group */}
                      {subjIdx === 0 && (
                        <TableCell rowSpan={group.subjects.length} className="border border-gray-300 border-dashed text-right align-middle tabular-nums font-medium">
                          ₹ {formatCurrency(groupAllocation)}
                        </TableCell>
                      )}

                      {/* Remarks - only on first row of group */}
                      {subjIdx === 0 && (
                        <TableCell rowSpan={group.subjects.length} className="border border-gray-300 border-dashed text-center align-middle">
                          
                        </TableCell>
                      )}
                    </TableRow>
                  );
                });
              })}

              {/* Grand Total Row */}
              <TableRow className="bg-gray-50/80 font-bold">
                <TableCell colSpan={3} className="border border-gray-300 border-dashed text-right p-4">
                  Total-
                </TableCell>
                <TableCell className="border border-gray-300 border-dashed text-center tabular-nums">
                  {grandTotalActivities}
                </TableCell>
                <TableCell className="border border-gray-300 border-dashed text-right tabular-nums">
                  ₹ {formatCurrency(grandTotalAllocation)}
                </TableCell>
                <TableCell className="border border-gray-300 border-dashed text-right tabular-nums">
                  ₹ {formatCurrency(grandTotalAllocation)}
                </TableCell>
                <TableCell className="border border-gray-300 border-dashed">
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
