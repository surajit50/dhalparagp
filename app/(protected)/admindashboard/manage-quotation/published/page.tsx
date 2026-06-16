"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  Plus,
  CheckCircle,
  ArrowRight,
  IndianRupee,
  ShieldCheck,
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
import {
  getQuotationForOrder,
  createProcurementOrder,
} from "@/action/procurement-order";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";

interface Quotation {
  id: string;
  nitNo: string;
  nitDate: Date | string;
  workName: string;
  category: { name: string };
  comparativeStatement?: any;
  order?: any;
}

interface OrderData {
  orderNo: string;
  orderDate: Date;
  orderType: "WORK" | "SUPPLY" | "SERVICE";
  deliveryDate: Date;
  terms: string;
}

export default function PublishedQuotationsPage() {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQ, setSelectedQ] = useState<any>(null);
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [orderData, setOrderData] = useState<OrderData>({
    orderNo: "",
    orderDate: new Date(),
    orderType: "WORK",
    deliveryDate: new Date(),
    terms: "Standard government terms apply.",
  });
  const { toast } = useToast();
  const router = useRouter();

  const fetchQuotations = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getQuotations();
      setQuotations(
        data.filter((q: Quotation) => q.comparativeStatement && !q.order),
      );
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

  const handlePrepareOrder = useCallback(
    async (q: Quotation) => {
      try {
        const fullData = await getQuotationForOrder(q.id);
        setSelectedQ(fullData);
        setOrderData((prev) => ({
          ...prev,
          orderNo: `${q.nitNo}/WO/${new Date().getFullYear()}`,
          orderType: q.category.name.includes("Supply")
            ? "SUPPLY"
            : q.category.name.includes("Vehicle")
              ? "SERVICE"
              : "WORK",
        }));
        setIsOrderDialogOpen(true);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load quotation details",
          variant: "destructive",
        });
      }
    },
    [toast],
  );

  const handleCreateOrder = useCallback(async () => {
    if (!selectedQ || !selectedQ.bidders[0]) return;

    try {
      setCreatingOrder(true);
      const result = await createProcurementOrder({
        ...orderData,
        quotationId: selectedQ.id,
        agencyId: selectedQ.bidders[0].agencyId,
        amount: selectedQ.bidders[0].bidAmount,
      });

      if (result.success) {
        toast({
          title: "Order Generated",
          description: "Work/Supply order has been issued.",
        });
        setIsOrderDialogOpen(false);
        fetchQuotations();
        router.push("/admindashboard/manage-quotation/orders");
      } else {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create order",
        variant: "destructive",
      });
    } finally {
      setCreatingOrder(false);
    }
  }, [selectedQ, orderData, fetchQuotations, router, toast]);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Approved Quotations</h1>
          <p className="text-muted-foreground">
            Ready for issuance of Work/Supply Orders
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quotations.map((q) => (
          <Card key={q.id} className="border-green-200 bg-green-50/10">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none">
                  <ShieldCheck className="h-3 w-3 mr-1" /> Approved CS
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {format(new Date(q.nitDate), "dd MMM yyyy")}
                </span>
              </div>
              <CardTitle className="text-lg mt-2">{q.nitNo}</CardTitle>
              <CardDescription className="line-clamp-2">
                {q.workName}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 bg-white rounded border text-sm">
                <p className="text-xs text-muted-foreground mb-1">
                  Selected L1 Agency
                </p>
                <p className="font-bold">Waiting for selection...</p>
                {/* Note: In a real app we'd fetch L1 here or include it in the query */}
              </div>

              <Button
                className="w-full"
                variant="default"
                onClick={() => handlePrepareOrder(q)}
              >
                Generate Order <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        ))}

        {quotations.length === 0 && !loading && (
          <div className="col-span-full py-20 text-center border-2 border-dashed rounded-lg">
            <CheckCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-20" />
            <p className="text-muted-foreground">
              No quotations are currently ready for order issuance.
            </p>
            <p className="text-xs text-muted-foreground">
              Approve Comparative Statements first.
            </p>
          </div>
        )}
      </div>

      {/* Order Dialog */}
      <Dialog open={isOrderDialogOpen} onOpenChange={setIsOrderDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Issue Procurement Order</DialogTitle>
            <DialogDescription>
              Creating order for {selectedQ?.nitNo} based on approved
              Comparative Statement.
            </DialogDescription>
          </DialogHeader>

          {selectedQ && selectedQ.bidders[0] && (
            <div className="grid gap-6 py-4">
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                <div>
                  <Label className="text-xs">L1 Agency</Label>
                  <p className="font-bold text-sm">
                    {selectedQ.bidders[0].agency.name}
                  </p>
                </div>
                <div>
                  <Label className="text-xs">Contract Amount</Label>
                  <p className="font-bold text-sm text-primary">
                    ₹{selectedQ.bidders[0].bidAmount.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Order Number</Label>
                  <Input
                    value={orderData.orderNo}
                    onChange={(e) =>
                      setOrderData({ ...orderData, orderNo: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Order Date</Label>
                  <Input
                    type="date"
                    value={format(orderData.orderDate, "yyyy-MM-dd")}
                    onChange={(e) =>
                      setOrderData({
                        ...orderData,
                        orderDate: new Date(e.target.value),
                      })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Order Type</Label>
                  <Select
                    value={orderData.orderType}
                    onValueChange={(val) =>
                      setOrderData({ ...orderData, orderType: val as "WORK" | "SUPPLY" | "SERVICE" })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="WORK">Work Order</SelectItem>
                      <SelectItem value="SUPPLY">Supply Order</SelectItem>
                      <SelectItem value="SERVICE">Service Order</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Completion/Delivery Deadline</Label>
                  <Input
                    type="date"
                    value={format(orderData.deliveryDate, "yyyy-MM-dd")}
                    onChange={(e) =>
                      setOrderData({
                        ...orderData,
                        deliveryDate: new Date(e.target.value),
                      })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Terms & Conditions</Label>
                <Input
                  value={orderData.terms}
                  onChange={(e) =>
                    setOrderData({ ...orderData, terms: e.target.value })
                  }
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsOrderDialogOpen(false)}
              disabled={creatingOrder}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateOrder} disabled={creatingOrder}>
              {creatingOrder ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Generate & Publish Order"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
