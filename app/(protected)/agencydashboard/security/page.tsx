import React from "react";
import { SecurityDepositsPage } from "../../admindashboard/register/security/SecurityDepositsPage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDeposits } from "@/lib/agencydata";

export default async function SecurityDepositPage() {
  const deposits = await getDeposits();

  return (
    <div className="space-y-8 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-fuchsia-600">Security Deposits</h1>
          <p className="text-sm font-medium text-slate-500 mt-2">Manage and track your security deposit registry.</p>
        </div>
      </div>
      
      <Card className="shadow-lg border-slate-200/60 overflow-hidden bg-white/80 backdrop-blur-sm transition-all duration-300 hover:shadow-xl rounded-xl">
        <div className="h-1.5 w-full bg-gradient-to-r from-violet-400 via-fuchsia-400 to-violet-500" />
        <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
          <CardTitle className="text-xl font-bold text-slate-800">Security Deposit Register</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <SecurityDepositsPage deposits={deposits} />
        </CardContent>
      </Card>
    </div>
  );
}
