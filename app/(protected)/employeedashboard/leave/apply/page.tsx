
import { LeaveForm } from "@/components/form/LeaveForm";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export default function LeaveApplyPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/employeedashboard/leave">
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Apply for Leave</h1>
          <p className="text-sm text-gray-600">
            Submit a new leave application for approval.
          </p>
        </div>
      </div>
      
      <LeaveForm />
    </div>
  );
}
