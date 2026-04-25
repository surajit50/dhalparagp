import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { MBEntry } from "./types";

interface MeasurementSummaryProps {
  mbEntries: MBEntry[];
  totalAmount: number;
  selectedWorkId: string;
  workDetails?: any;
}

export const MeasurementSummary: React.FC<MeasurementSummaryProps> = ({
  mbEntries,
  totalAmount,
  selectedWorkId,
  workDetails,
}) => {
  // Calculations based on user requirements
  const totalWorkValue = totalAmount;

  // Try to get actual contractor percentage from workDetails
  let contractorLessRate = 0.0003; // Default 0.03% as per user request
  let isLess = true;

  if (workDetails) {
    const estCost = Number(
      workDetails?.ApprovedActionPlanDetails?.estimatedCost ??
      workDetails?.finalEstimateAmount ??
      0
    );
    const tendAmount = Number(
      workDetails?.AwardofContract?.workorderdetails?.[0]?.Bidagency?.biddingAmount ?? 
      workDetails?.AwardofContract?.workorderdetails?.[0]?.Bidamount ??
      workDetails?.AOCDetails?.[0]?.bidAmount ??
      workDetails?.biddingAgencies?.[0]?.biddingAmount ??
      workDetails?.tenderedAmount ??
      0
    );
    
    if (estCost > 0 && tendAmount > 0) {
      if (tendAmount < estCost) {
        contractorLessRate = (estCost - tendAmount) / estCost;
        isLess = true;
      } else if (tendAmount > estCost) {
        contractorLessRate = (tendAmount - estCost) / estCost;
        isLess = false;
      } else {
        contractorLessRate = 0;
      }
    }
  }

  const contractorLessAmount = Number((totalWorkValue * contractorLessRate).toFixed(2));
  const totalValueWorkDone = isLess 
    ? Number((totalWorkValue - contractorLessAmount).toFixed(2))
    : Number((totalWorkValue + contractorLessAmount).toFixed(2));
    
  const sayValue = Math.round(totalValueWorkDone);
  
  const cgstRate = 0.09; // 9%
  const sgstRate = 0.09; // 9%
  const cgstAmount = Math.round(sayValue * cgstRate);
  const sgstAmount = Math.round(sayValue * sgstRate);
  
  const subTotal = sayValue + cgstAmount + sgstAmount;
  
  const labourCessRate = 0.01; // 1%
  const labourCessAmount = Math.round(subTotal * labourCessRate);
  
  const grossBillAmount = subTotal + labourCessAmount;

  // Work Order Value comparison
  const workOrderValue = Number(
    workDetails?.AwardofContract?.workorderdetails?.[0]?.Bidagency?.biddingAmount ?? 
    workDetails?.AwardofContract?.workorderdetails?.[0]?.Bidamount ??
    workDetails?.AOCDetails?.[0]?.bidAmount ??
    workDetails?.biddingAgencies?.[0]?.biddingAmount ??
    workDetails?.tenderedAmount ??
    workDetails?.Bidamount ??
    0
  );
  const isExceeding = workOrderValue > 0 && Math.floor(grossBillAmount) > Math.floor(workOrderValue);

  const formatCurrency = (val: number) => val.toFixed(2);
  const percentageDisplay = (contractorLessRate * 100).toFixed(2);

  return (
    <AnimatePresence>
      {selectedWorkId && mbEntries.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card className={`border-slate-200 border-l-4 ${isExceeding ? 'border-l-red-500 bg-red-50/30' : 'border-l-green-500 bg-white'} shadow-sm rounded-xl transition-colors duration-300`}>
            <CardContent className="pt-6">
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-2.5 ${isExceeding ? 'bg-red-100' : 'bg-green-50'} rounded-xl`}>
                      <CheckCircle className={`h-5 w-5 ${isExceeding ? 'text-red-600' : 'text-green-600'}`} />
                    </div>
                    <div>
                      <h3 className="font-bold text-[15px] text-slate-800">
                        Measurement Summary
                      </h3>
                      <p className="text-xs font-medium text-slate-500 mt-0.5">
                        Total recorded items: {mbEntries.length}
                      </p>
                    </div>
                  </div>
                  {workOrderValue > 0 && (
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Work Order Value</p>
                      <p className="text-sm font-bold text-slate-700">₹{formatCurrency(workOrderValue)}</p>
                    </div>
                  )}
                </div>

                <div className="space-y-2 border-t border-slate-100 pt-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-600 font-medium">Total of Work Value</span>
                    <span className="font-bold text-slate-800">₹{formatCurrency(totalWorkValue)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500">
                      {isLess ? 'Less Contractor Less' : 'Add Contractor Add'} ({percentageDisplay}%)
                    </span>
                    <span className={`${isLess ? 'text-red-500' : 'text-green-500'} font-medium`}>
                      {isLess ? '(-)' : '(+)'} ₹{formatCurrency(contractorLessAmount)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center text-sm border-t border-slate-50 pt-2">
                    <span className="text-slate-600 font-semibold">Total Value of Work Done</span>
                    <span className="font-bold text-slate-800">₹{formatCurrency(totalValueWorkDone)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500 italic">SAY</span>
                    <span className="font-bold text-slate-800">₹{formatCurrency(sayValue)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-600">Add CGST @ 9%</span>
                    <span className="font-medium text-slate-800">₹{formatCurrency(cgstAmount)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-600">Add SGST @ 9%</span>
                    <span className="font-medium text-slate-800">₹{formatCurrency(sgstAmount)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center text-sm border-t border-slate-50 pt-2">
                    <span className="text-slate-600 font-semibold">Sub Total</span>
                    <span className="font-bold text-slate-800">₹{formatCurrency(subTotal)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-600">Add Labour Cess @ 1%</span>
                    <span className="font-medium text-slate-800">₹{formatCurrency(labourCessAmount)}</span>
                  </div>
                  
                  <div className={`mt-4 p-4 ${isExceeding ? 'bg-red-50 border-red-100' : 'bg-green-50 border-green-100'} border rounded-xl flex justify-between items-center`}>
                    <div>
                      <p className={`text-[10px] font-bold ${isExceeding ? 'text-red-700' : 'text-green-700'} uppercase tracking-wider`}>Gross Bill Amount</p>
                      <p className={`text-2xl font-black ${isExceeding ? 'text-red-600' : 'text-green-600'}`}>₹{formatCurrency(grossBillAmount)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Avg Rate/Unit</p>
                      <p className="text-sm font-bold text-slate-700">
                        ₹{(mbEntries.length > 0
                          ? totalAmount / mbEntries.reduce((sum, entry) => sum + entry.quantityExecuted, 0)
                          : 0
                        ).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {isExceeding && (
                    <div className="px-1 py-2">
                      <p className="text-[11px] font-bold text-red-600 flex items-center gap-1.5 animate-pulse">
                        ⚠️ Gross Amount exceeds Work Order Value (₹{formatCurrency(workOrderValue)})
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
