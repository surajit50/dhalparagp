import { VisibleDataTable } from "@/components/visible-data-table";
import { columns } from "./columns";
import { SearchWorkbyNitNoForm } from "@/components/SearchWorkbyNitno";
import FundTypeFilter from "@/components/FundTypeFilter";
import type { workdetailstype } from "@/types/worksdetails";
import { fetchworkdetailsbyfilters } from "@/action/bookNitNuber";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info, AlertCircle } from "lucide-react";

interface WorkDetailsProps {
  nitNo?: string;
  schemeName?: string;
}

export async function WorkDetails({ nitNo, schemeName }: WorkDetailsProps) {
  let work: workdetailstype[] = [];
  let estimatedTotal = 0;
  let awardedTotal = 0;

  try {
    if (nitNo || schemeName) {
      const numericNitNo = nitNo ? Number(nitNo) : undefined;
      if (nitNo && isNaN(numericNitNo!)) {
        throw new Error("Invalid NIT number");
      }

      let fetchedWork = await fetchworkdetailsbyfilters(numericNitNo, undefined, schemeName, undefined);

      // Filter: Do not show if final payment done, UNLESS security payment is due.
      work = fetchedWork.filter((w: any) => {
        const finalBill = w.paymentDetails?.find((p: any) => p.isfinalbill);
        if (!finalBill) return true; // Final payment not done -> show it
        // If final payment is done, show ONLY if security payment is due (unpaid)
        if (finalBill.securityDeposit?.paymentstatus === "unpaid") return true;
        // Otherwise, it's fully paid (final bill done + security deposit not due/paid) -> hide it
        return false;
      });

      // Calculate totals with proper type checking
      estimatedTotal = work.reduce((acc, curr) => {
        const amount = Number(curr.finalEstimateAmount) || 0;
        return acc + amount;
      }, 0);

      awardedTotal = work.reduce((acc, curr) => {
        const amount =
          Number(
            curr.AwardofContract?.workorderdetails?.[0]?.Bidagency
              ?.biddingAmount
          ) || 0;
        return acc + amount;
      }, 0);
    }
  } catch (error) {
    console.error(error);
  }

  const hasSearch = !!(nitNo || schemeName);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SearchWorkbyNitNoForm />
            <div className="p-6 bg-white rounded-lg shadow-md dark:bg-gray-800 flex flex-col justify-center">
              <h2 className="text-xl font-semibold mb-6 text-gray-700 dark:text-gray-200">
                Filter by Scheme Name
              </h2>
              <FundTypeFilter />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          {!hasSearch ? (
            <Alert className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-900/20">
              <Info className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              <AlertTitle className="text-orange-800 dark:text-orange-200">
                Search Required
              </AlertTitle>
              <AlertDescription className="text-orange-700 dark:text-orange-300">
                Please enter a search criteria or select a filter to view work details
              </AlertDescription>
            </Alert>
          ) : work.length > 0 ? (
            <div className="space-y-4">
              <div className="pb-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                    Work Details
                    {nitNo && ` for NIT: ${nitNo}`}
                    {schemeName && ` (Scheme: ${schemeName})`}
                  </h2>
                  <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-lg">
                      <div className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                        Total Estimate
                      </div>
                      <div className="text-lg font-semibold text-emerald-700 dark:text-emerald-300">
                        ₹{estimatedTotal.toLocaleString("en-IN")}
                      </div>
                    </div>
                    <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg">
                      <div className="text-sm font-medium text-orange-600 dark:text-orange-400">
                        Total Awarded
                      </div>
                      <div className="text-lg font-semibold text-orange-700 dark:text-orange-300">
                        ₹{awardedTotal.toLocaleString("en-IN")}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <VisibleDataTable
                data={work}
                columns={columns}
                title={`Work Details`}
                pdfFileName={`work-details.pdf`}
                excelFileName={`work-details.xlsx`}
              />
            </div>
          ) : (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>No Results Found</AlertTitle>
              <AlertDescription>
                No work details found for your search criteria.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </div>
  );
}
