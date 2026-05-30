import React from "react";
import { STATUTORY_FUNDS, FUND_FULL_NAMES } from "@/constants/funds";
import { formatCurrency } from "@/lib/utils";

export interface Form35Group {
  label: string;
  columnKey: string;
}

interface Form35TableProps {
  title: string;
  groups: Form35Group[];
  currentBudgets: any[];
  nextBudgets: any[];
  selectedYear: string;
  currentYearLabel: string;
  nextYearLabel: string;
}

export function Form35Table({
  title,
  groups,
  currentBudgets,
  nextBudgets,
  selectedYear,
  currentYearLabel,
  nextYearLabel,
}: Form35TableProps) {
  // Helper to find budget value for a specific fund and column
  const getBudget = (budgets: any[], fundName: string, columnKey: string) => {
    // Find exact match or mapped name
    let found = budgets.find((b) => b.fundName === fundName);
    if (!found) {
        // Try reverse lookup if full name is provided
        const shortName = Object.keys(FUND_FULL_NAMES).find(k => FUND_FULL_NAMES[k] === fundName);
        if (shortName) {
            found = budgets.find((b) => b.fundName === shortName);
        }
    }
    
    if (found && found[columnKey]) {
      return Number(found[columnKey]) || 0;
    }
    return 0;
  };

  const getFullName = (fundName: string) => {
    return FUND_FULL_NAMES[fundName] || fundName;
  };

  return (
    <div className="w-full bg-white p-4 overflow-x-auto text-xs">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 border-b pb-2">
        <div className="bg-black text-white px-3 py-1 font-bold text-sm">FORM-35<br/><span className="text-[10px] font-normal">[See Rule 36(2)]</span></div>
        <div className="text-center font-bold text-base flex-1">
          Budget Estimate on {title} Upa-Samity in {selectedYear} of No 3 Dhalpara GP Gram Panchayat
        </div>
      </div>

      <div className="flex justify-between font-medium mb-2 text-sm">
        <div>Panchayat Samity : Hili</div>
        <div>District : Dakshin Dinajpur</div>
      </div>

      {/* Table */}
      <table className="w-full border-collapse border border-gray-400">
        <thead>
          <tr>
            <th rowSpan={2} className="border border-gray-400 p-2 text-center bg-gray-50 w-32">Subject/Sector</th>
            <th rowSpan={2} className="border border-gray-400 p-2 text-center bg-gray-50 min-w-[300px]">Sources of Fund</th>
            <th colSpan={2} className="border border-gray-400 p-2 text-center bg-gray-50">Expected Expenditure of Current Year</th>
            <th colSpan={2} className="border border-gray-400 p-2 text-center bg-gray-50">Expected Expenditure of Next Year</th>
            <th rowSpan={3} className="border border-gray-400 p-2 text-center bg-gray-50 w-24">Remarks</th>
          </tr>
          <tr>
            <th colSpan={2} className="border border-gray-400 p-1 text-center bg-gray-50">{currentYearLabel}</th>
            <th colSpan={2} className="border border-gray-400 p-1 text-center bg-gray-50">{nextYearLabel}</th>
          </tr>
          <tr>
            <th className="border border-gray-400 p-1 text-center bg-gray-50"></th>
            <th className="border border-gray-400 p-1 text-center bg-gray-50"></th>
            <th className="border border-gray-400 p-1 text-center bg-gray-50 w-24">Expected Receipt (Rs)</th>
            <th className="border border-gray-400 p-1 text-center bg-gray-50 w-24">Expected Expenditure (Rs)</th>
            <th className="border border-gray-400 p-1 text-center bg-gray-50 w-24">Expected Receipt (Rs)</th>
            <th className="border border-gray-400 p-1 text-center bg-gray-50 w-24">Expected Expenditure (Rs)</th>
          </tr>
          <tr className="bg-orange-50 text-orange-600 font-bold text-center">
            <td className="border border-gray-400 p-0.5">1</td>
            <td className="border border-gray-400 p-0.5">2</td>
            <td className="border border-gray-400 p-0.5">3</td>
            <td className="border border-gray-400 p-0.5">4</td>
            <td className="border border-gray-400 p-0.5">5</td>
            <td className="border border-gray-400 p-0.5">6</td>
            <td className="border border-gray-400 p-0.5">7</td>
          </tr>
        </thead>
        <tbody>
          {groups.map((group, groupIdx) => {
            let groupCurrentTotal = 0;
            let groupNextTotal = 0;

            return (
              <React.Fragment key={group.columnKey}>
                {STATUTORY_FUNDS.map((category, catIdx) => (
                  <React.Fragment key={`${group.columnKey}-cat-${catIdx}`}>
                    {/* Category Header */}
                    <tr className="bg-gray-100 font-bold">
                      <td className="border border-gray-400 p-1 text-center">{group.label}</td>
                      <td colSpan={6} className="border border-gray-400 p-1 text-xs">
                        {category.category}
                      </td>
                    </tr>
                    
                    {/* Funds Loop */}
                    {category.funds.map((fundName) => {
                      // Own Fund is special, the category has "Own Fund" and other items.
                      // For OSR (Category B), only "Own Fund" row gets expenditure. Other rows are receipts only.
                      // Wait! In Form 35, the expected receipt/expenditure is shown for ALL rows if they have budget.
                      // So we just safely pull it from the DB.
                      
                      const valCurrent = getBudget(currentBudgets, fundName, group.columnKey);
                      const valNext = getBudget(nextBudgets, fundName, group.columnKey);
                      
                      groupCurrentTotal += valCurrent;
                      groupNextTotal += valNext;

                      return (
                        <tr key={`${group.columnKey}-${fundName}`} className="hover:bg-blue-50">
                          <td className="border border-gray-400 p-1 text-center">{group.label}</td>
                          <td className="border border-gray-400 p-1">{getFullName(fundName)}</td>
                          <td className="border border-gray-400 p-1 text-right tabular-nums">₹ {formatCurrency(valCurrent)}</td>
                          <td className="border border-gray-400 p-1 text-right tabular-nums">₹ {formatCurrency(valCurrent)}</td>
                          <td className="border border-gray-400 p-1 text-right tabular-nums">₹ {formatCurrency(valNext)}</td>
                          <td className="border border-gray-400 p-1 text-right tabular-nums">₹ {formatCurrency(valNext)}</td>
                          <td className="border border-gray-400 p-1"></td>
                        </tr>
                      );
                    })}

                    {/* F Category has Total/Balance/Grand Total right after it */}
                    {category.category.startsWith("(F)") && (
                      <>
                        <tr className="bg-gray-50 font-bold">
                          <td className="border border-gray-400 p-1"></td>
                          <td className="border border-gray-400 p-1 text-center">Total -</td>
                          <td className="border border-gray-400 p-1 text-right tabular-nums">₹ {formatCurrency(groupCurrentTotal)}</td>
                          <td className="border border-gray-400 p-1 text-right tabular-nums">₹ {formatCurrency(groupCurrentTotal)}</td>
                          <td className="border border-gray-400 p-1 text-right tabular-nums">₹ {formatCurrency(groupNextTotal)}</td>
                          <td className="border border-gray-400 p-1 text-right tabular-nums">₹ {formatCurrency(groupNextTotal)}</td>
                          <td className="border border-gray-400 p-1"></td>
                        </tr>
                        <tr className="bg-gray-50 font-bold">
                          <td className="border border-gray-400 p-1"></td>
                          <td className="border border-gray-400 p-1 text-center">Balance</td>
                          <td className="border border-gray-400 p-1 text-right tabular-nums">₹ 0.00</td>
                          <td className="border border-gray-400 p-1 text-right tabular-nums">₹ 0.00</td>
                          <td className="border border-gray-400 p-1 text-right tabular-nums">₹ 0.00</td>
                          <td className="border border-gray-400 p-1 text-right tabular-nums">₹ 0.00</td>
                          <td className="border border-gray-400 p-1"></td>
                        </tr>
                        <tr className="bg-red-50 text-red-600 font-bold">
                          <td colSpan={2} className="border border-gray-400 p-1 text-center">
                            Grand Total (in Rs) {group.label !== "" && `- ${group.label} Upa-Samity`}
                          </td>
                          <td className="border border-gray-400 p-1 text-right tabular-nums">₹ {formatCurrency(groupCurrentTotal)}</td>
                          <td className="border border-gray-400 p-1 text-right tabular-nums">₹ {formatCurrency(groupCurrentTotal)}</td>
                          <td className="border border-gray-400 p-1 text-right tabular-nums">₹ {formatCurrency(groupNextTotal)}</td>
                          <td className="border border-gray-400 p-1 text-right tabular-nums">₹ {formatCurrency(groupNextTotal)}</td>
                          <td className="border border-gray-400 p-1"></td>
                        </tr>
                      </>
                    )}
                  </React.Fragment>
                ))}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
