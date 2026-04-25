import React from "react";
import { SecurityDepositsPage } from "../../admindashboard/register/security/SecurityDepositsPage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDeposits } from "@/lib/agencydata";

export default async function SecurityDepositPage() {
  const deposits = await getDeposits();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Security Deposits</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Security Deposit Register</CardTitle>
        </CardHeader>
        <CardContent>
          <SecurityDepositsPage deposits={deposits} />
        </CardContent>
      </Card>
    </div>
  );
}
