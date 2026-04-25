"use client";

import { useRouter } from "next/navigation";
import CorrectionRequestReview from "./correction-request-review";
import { Card, CardContent } from "@/components/ui/card";
import { History } from "lucide-react";

interface RecentRequestsListProps {
  requests: any[];
}

export default function RecentRequestsList({ requests }: RecentRequestsListProps) {
  const router = useRouter();

  const handleRequestReviewed = () => {
    router.refresh();
  };

  if (requests.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-3 mb-6 pb-2 border-b border-border/40">
        <div className="p-2 bg-primary/10 rounded-full text-primary">
          <History className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">Recent Activity</h2>
          <p className="text-sm text-muted-foreground">Latest correction requests requiring attention</p>
        </div>
      </div>
      
      <Card className="border-0 shadow-none bg-transparent p-0">
        <CardContent className="p-0">
          <CorrectionRequestReview
            requests={requests}
            onRequestReviewed={handleRequestReviewed}
            viewMode="list"
          />
        </CardContent>
      </Card>
    </div>
  );
}
