import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, BarChart3 } from "lucide-react";
import { Suspense } from "react";
import { getQuotationsWithBids } from "@/lib/actions/comparative-statements";
import { ComparativeStatementClient } from "./comparative-statement-client";

export default async function ComparativeStatementPage() {
  const result = await getQuotationsWithBids();

  if (!result.success) {
    return (
      <div className="min-h-screen bg-muted/40 py-8">
        <div className="container mx-auto px-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold flex items-center gap-2">
                <BarChart3 className="h-6 w-6" />
                Comparative Statement
              </CardTitle>
              <CardDescription>
                Create and manage comparative statements for quotations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  Error loading quotations: {result.error}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const quotations = result.data || [];

  return (
    <div className="min-h-screen bg-muted/40 py-8">
      <div className="container mx-auto px-4">
        <Suspense fallback={<div>Loading...</div>}>
          <ComparativeStatementClient quotations={quotations} />
        </Suspense>
      </div>
    </div>
  );
}
