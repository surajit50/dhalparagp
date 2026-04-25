"use client";

import { useState } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { format } from "date-fns";
import { Check, X, Loader2, User, Calendar, MapPin } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface Application {
  id: string;
  applicationNumber: string | null;
  applicantName: string;
  villageName: string;
  deceasedName: string;
  dateOfDeath: string;
  status: string;
  createdAt: string;
}

export default function VerifyApplicationsClient({ initialData }: { initialData: Application[] }) {
  const [data, setData] = useState<Application[]>(initialData);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleAction = async (id: string, action: "VERIFY" | "REJECT") => {
    setLoadingId(id);
    try {
      const res = await fetch("/api/samabathy/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action }),
      });

      if (res.ok) {
        toast.success(action === "VERIFY" ? "Application verified" : "Application rejected");
        setData(data.filter(app => app.id !== id));
      } else {
        const err = await res.json();
        toast.error(err.error || "Action failed");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setLoadingId(null);
    }
  };

  if (data.length === 0) {
    return (
      <Card className="mt-8">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="bg-muted rounded-full p-4 mb-4">
            <Check className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold">All caught up!</h3>
          <p className="text-muted-foreground">No applications pending review at this time.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {data.map((app) => (
          <Card key={app.id} className="overflow-hidden border-l-4 border-l-amber-500 shadow-sm">
            <CardHeader className="bg-muted/30 pb-4">
              <div className="flex justify-between items-start">
                <div>
                  <Badge variant="outline" className="mb-2 bg-amber-50 text-amber-700 border-amber-200">
                    UNDER REVIEW
                  </Badge>
                  <CardTitle className="text-lg">{app.applicationNumber || "Pending ID"}</CardTitle>
                </div>
                <div className="text-right text-xs text-muted-foreground">
                  {format(new Date(app.createdAt), "dd MMM yyyy")}
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-sm">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-primary/60" />
                  <span className="font-medium truncate">{app.applicantName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary/60" />
                  <span className="truncate">{app.villageName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-red-500/60" />
                  <span className="font-medium truncate">{app.deceasedName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{format(new Date(app.dateOfDeath), "dd MMM yy")}</span>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button 
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700" 
                  size="sm"
                  disabled={loadingId === app.id}
                  onClick={() => handleAction(app.id, "VERIFY")}
                >
                  {loadingId === app.id ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Check className="h-4 w-4 mr-2" />}
                  Verify
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1 text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50" 
                  size="sm"
                  disabled={loadingId === app.id}
                  onClick={() => handleAction(app.id, "REJECT")}
                >
                  <X className="h-4 w-4 mr-2" />
                  Reject
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
