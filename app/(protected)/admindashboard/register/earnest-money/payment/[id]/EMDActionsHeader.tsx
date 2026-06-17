"use client";

import React, { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, Printer, RotateCcw, AlertOctagon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface EMDActionsHeaderProps {
  id: string;
  status: string;
}

export function EMDActionsHeader({ id, status }: EMDActionsHeaderProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleUpdateStatus = async (newStatus: "refunded" | "forfeited") => {
    if (!confirm(`Are you sure you want to ${newStatus === "refunded" ? "refund" : "forfeit"} this EMD?`)) {
      return;
    }

    startTransition(async () => {
      try {
        const res = await fetch(`/api/earnest-money/${id}/payment`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paymentstatus: newStatus })
        });
        if (res.ok) {
          router.refresh();
        } else {
          alert(`Failed to ${newStatus} EMD`);
        }
      } catch (err) {
        console.error(err);
      }
    });
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/admindashboard/register/earnest-money`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Payment Details</h1>
      </div>
      <div className="flex flex-wrap gap-2 w-full sm:w-auto">
        {status === "pending" && (
          <Button asChild className="bg-orange-600 hover:bg-orange-700 text-white rounded-xl">
            <Link href={`/admindashboard/register/earnest-money/payment/${id}/add`}>
              <Plus className="mr-2 h-4 w-4" />
              Add Payment
            </Link>
          </Button>
        )}
        {status === "paid" && (
          <>
            <Button
              variant="outline"
              className="border-emerald-600 text-emerald-600 hover:bg-emerald-50 rounded-xl"
              onClick={() => handleUpdateStatus("refunded")}
              disabled={isPending}
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Refund EMD
            </Button>
            <Button
              variant="outline"
              className="border-rose-600 text-rose-600 hover:bg-rose-50 rounded-xl"
              onClick={() => handleUpdateStatus("forfeited")}
              disabled={isPending}
            >
              <AlertOctagon className="mr-2 h-4 w-4" />
              Forfeit EMD
            </Button>
            <Button variant="outline" asChild className="rounded-xl">
              <Link href={`/admindashboard/register/earnest-money/payment/${id}/print`}>
                <Printer className="mr-2 h-4 w-4" />
                Print Receipt
              </Link>
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
