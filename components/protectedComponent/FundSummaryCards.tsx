import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, ArrowRightLeft, TrendingDown, Calculator, Landmark, Coins } from "lucide-react";

export default async function FundSummaryCards() {
  const rawFunds = await db.fundAvailability.findMany({
    orderBy: { year: "desc" },
  });

  const funds = rawFunds.map(fund => {
    const unspentTied = (fund.openingBalanceTied + fund.directReceiptTied + fund.autoReceiptTied) - fund.expenditureTied;
    const unspentUntied = (fund.openingBalanceUntied + fund.directReceiptUntied + fund.autoReceiptUntied) - fund.expenditureUntied;
    const unspentTotal = unspentTied + unspentUntied;

    return {
      ...fund,
      unspentBalanceTied: unspentTied,
      unspentBalanceUntied: unspentUntied,
      unspentBalanceTotal: unspentTotal,
      receiptsTotal: fund.directReceiptTotal + fund.autoReceiptTotal,
      receiptsTied: fund.directReceiptTied + fund.autoReceiptTied,
      receiptsUntied: fund.directReceiptUntied + fund.autoReceiptUntied,
    };
  });

  const totalUnspent = funds.reduce((acc, fund) => acc + fund.unspentBalanceTotal, 0);
  const totalReceipts = funds.reduce((acc, fund) => acc + fund.receiptsTotal, 0);
  const totalExpenditure = funds.reduce((acc, fund) => acc + fund.expenditureTotal, 0);
  const totalOpening = funds.reduce((acc, fund) => acc + fund.openingBalanceTotal, 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
      <Card className="bg-gradient-to-br from-white to-orange-50/30 border-slate-100 shadow-sm hover:shadow-md transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Grand Unspent Balance
          </CardTitle>
          <div className="p-2 bg-orange-100 rounded-lg shadow-sm shadow-orange-100">
            <Calculator className="w-4 h-4 text-orange-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            ₹{totalUnspent.toLocaleString()}
          </div>
          <p className="text-[10px] text-orange-600 font-bold mt-1 uppercase tracking-tighter">
            (A + B + C) - D
          </p>
        </CardContent>
      </Card>

      <Card className="bg-white border-slate-100 shadow-sm hover:shadow-md transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Total Receipts (B+C)
          </CardTitle>
          <div className="p-2 bg-blue-50 rounded-lg">
            <ArrowRightLeft className="w-4 h-4 text-blue-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-700 tracking-tight">
            ₹{totalReceipts.toLocaleString()}
          </div>
          <p className="text-[10px] text-blue-400 font-medium mt-1">Direct & Auto Receipts</p>
        </CardContent>
      </Card>

      <Card className="bg-white border-slate-100 shadow-sm hover:shadow-md transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Total Expenditure (D)
          </CardTitle>
          <div className="p-2 bg-red-50 rounded-lg">
            <TrendingDown className="w-4 h-4 text-red-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600 tracking-tight">
            ₹{totalExpenditure.toLocaleString()}
          </div>
          <p className="text-[10px] text-red-400 font-medium mt-1">Utilized funds</p>
        </CardContent>
      </Card>

      <Card className="bg-white border-slate-100 shadow-sm hover:shadow-md transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Opening Balance (A)
          </CardTitle>
          <div className="p-2 bg-purple-50 rounded-lg">
            <Landmark className="w-4 h-4 text-purple-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-slate-900 tracking-tight">
            ₹{totalOpening.toLocaleString()}
          </div>
          <p className="text-[10px] text-slate-400 font-medium mt-1">Initial year balance</p>
        </CardContent>
      </Card>

      {/* Scheme-wise table summary */}
      <div className="col-span-1 md:col-span-2 lg:col-span-4 mt-4">
        <Card className="bg-white border-slate-200 shadow-sm overflow-hidden border-t-4 border-t-orange-600">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-3 px-6">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold text-slate-800 uppercase tracking-widest flex items-center gap-2">
                <Coins className="w-4 h-4 text-orange-600" />
                Scheme Financial Matrix
              </CardTitle>
              <div className="text-[10px] text-slate-400 font-bold bg-white px-2 py-1 rounded border border-slate-200">
                FY {funds[0]?.year || 'N/A'} SUMMARY
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
             <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50/30 text-slate-400 border-b border-slate-100">
                      <th className="text-left py-4 px-6 font-bold uppercase tracking-wider text-[9px]">Scheme / Year</th>
                      <th className="text-right py-4 px-4 font-bold uppercase tracking-wider text-[9px] bg-slate-100/10 text-slate-600">A: Opening</th>
                      <th className="text-right py-4 px-4 font-bold uppercase tracking-wider text-[9px] bg-blue-50/10 text-blue-600">B+C: Receipts</th>
                      <th className="text-right py-4 px-4 font-bold uppercase tracking-wider text-[9px] bg-red-50/10 text-red-600">D: Exp.</th>
                      <th className="text-right py-4 px-6 font-bold uppercase tracking-wider text-[9px] text-orange-600 bg-orange-50/30">Unspent Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {funds.map((fund) => (
                      <tr key={fund.id} className="hover:bg-orange-50/10 transition-colors">
                        <td className="py-4 px-6">
                           <div className="font-bold text-slate-800 leading-tight">{fund.schemeName}</div>
                           <div className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">{fund.year}</div>
                        </td>
                        <td className="py-4 px-4 text-right bg-slate-100/5">
                           <div className="font-semibold text-slate-700">₹{fund.openingBalanceTotal.toLocaleString()}</div>
                           <div className="text-[8px] text-slate-400">T:₹{fund.openingBalanceTied.toLocaleString()} | U:₹{fund.openingBalanceUntied.toLocaleString()}</div>
                        </td>
                        <td className="py-4 px-4 text-right bg-blue-50/5">
                           <div className="font-semibold text-blue-700">₹{fund.receiptsTotal.toLocaleString()}</div>
                           <div className="text-[8px] text-blue-400">T:₹{fund.receiptsTied.toLocaleString()} | U:₹{fund.receiptsUntied.toLocaleString()}</div>
                        </td>
                        <td className="py-4 px-4 text-right bg-red-50/5">
                           <div className="font-semibold text-red-600">₹{fund.expenditureTotal.toLocaleString()}</div>
                           <div className="text-[8px] text-red-400">T:₹{fund.expenditureTied.toLocaleString()} | U:₹{fund.expenditureUntied.toLocaleString()}</div>
                        </td>
                        <td className="py-4 px-6 text-right bg-orange-50/10">
                           <span className="font-black text-orange-600 text-xs px-2 py-1 bg-white rounded border border-orange-100 shadow-sm">
                             ₹{fund.unspentBalanceTotal.toLocaleString()}
                           </span>
                           <div className="text-[8px] text-orange-500 mt-1 font-bold">T:₹{fund.unspentBalanceTied.toLocaleString()} | U:₹{fund.unspentBalanceUntied.toLocaleString()}</div>
                        </td>
                      </tr>
                    ))}
                    {funds.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-16 text-center text-slate-400">
                          <div className="flex flex-col items-center gap-2">
                             <Calculator className="w-8 h-8 opacity-20" />
                             <p className="text-[10px] font-bold uppercase tracking-widest">No financial data available</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
