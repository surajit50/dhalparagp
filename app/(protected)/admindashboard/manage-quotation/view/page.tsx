"use client";

import { useState, useEffect, useCallback } from "react";
import {
  FileText,
  Download,
  Eye,
  MoreVertical,
  CheckCircle,
  Clock,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getQuotations } from "@/action/procurement-quotation";
import { format } from "date-fns";
import { generateNiqPdf } from "@/utils/procurement-pdf-generator";
import { useToast } from "@/components/ui/use-toast";

interface Quotation {
  id: string;
  nitNo: string;
  nitDate: string;
  workName: string;
  category: { name: string };
  estimatedAmount: number;
  _count: { bidders: number };
  status: string;
  items: any[];
  submissionDate: string;
  openingDate: string;
}

export default function ViewQuotationsPage() {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchQuotations = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getQuotations();
      setQuotations(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load quotations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchQuotations();
  }, [fetchQuotations]);

  const handleDownloadPdf = useCallback(
    async (q: Quotation) => {
      try {
        setDownloadingId(q.id);
        const pdf = await generateNiqPdf({
          gpName: "No. 3 Dhalpara Gram Panchayat",
          gpAddress: "P.O. Dhalpara, Dist. Dakshin Dinajpur",
          nitNo: q.nitNo,
          nitDate: format(new Date(q.nitDate), "dd/MM/yyyy"),
          workName: q.workName,
          items: q.items,
          submissionDeadline: format(
            new Date(q.submissionDate),
            "dd/MM/yyyy HH:mm",
          ),
          openingDate: format(new Date(q.openingDate), "dd/MM/yyyy HH:mm"),
        });

        const blob = new Blob([pdf.buffer], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `NIQ_${q.nitNo.replace(/\//g, "_")}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to download PDF",
          variant: "destructive",
        });
      } finally {
        setDownloadingId(null);
      }
    },
    [toast],
  );

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">View Quotations</h1>
          <p className="text-muted-foreground">
            Monitor and manage all issued NIQs
          </p>
        </div>
      </div>

      <div className="border rounded-lg bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b font-medium">
            <tr>
              <th className="p-4 text-left">NIT No & Date</th>
              <th className="p-4 text-left">Category</th>
              <th className="p-4 text-left">Work Name</th>
              <th className="p-4 text-left">Estimated Amt</th>
              <th className="p-4 text-left">Bidders</th>
              <th className="p-4 text-left">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="p-8 text-center">
                  Loading quotations...
                </td>
              </tr>
            ) : quotations.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="p-8 text-center text-muted-foreground"
                >
                  No quotations found.
                </td>
              </tr>
            ) : (
              quotations.map((q) => (
                <tr
                  key={q.id}
                  className="border-b last:border-0 hover:bg-muted/30"
                >
                  <td className="p-4">
                    <div className="font-bold">{q.nitNo}</div>
                    <div className="text-xs text-muted-foreground">
                      {format(new Date(q.nitDate), "dd MMM yyyy")}
                    </div>
                  </td>
                  <td className="p-4">
                    <Badge variant="outline">{q.category.name}</Badge>
                  </td>
                  <td className="p-4 max-w-xs truncate">{q.workName}</td>
                  <td className="p-4 font-medium">
                    ₹{q.estimatedAmount.toLocaleString()}
                  </td>
                  <td className="p-4">
                    <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none">
                      {q._count.bidders} Bids
                    </Badge>
                  </td>
                  <td className="p-4">
                    {q.status === "PUBLISHED" ? (
                      <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none">
                        <CheckCircle className="h-3 w-3 mr-1" /> Published
                      </Badge>
                    ) : (
                      <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 border-none">
                        <Clock className="h-3 w-3 mr-1" /> Draft
                      </Badge>
                    )}
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleDownloadPdf(q)}
                      disabled={downloadingId === q.id}
                    >
                      {downloadingId === q.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Download className="h-4 w-4" />
                      )}
                    </Button>
                    <Button variant="outline" size="icon" className="h-8 w-8">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
