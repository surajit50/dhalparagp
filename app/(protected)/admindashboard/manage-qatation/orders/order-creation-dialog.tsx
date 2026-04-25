"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, CheckCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createOrder } from "@/lib/actions/orders";
import { useRouter } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { formatCurrency } from "@/lib/utils";
import { Quotation, Bid, QuotationType, AgencyDetails } from "@prisma/client";
import { cn } from "@/lib/utils";

interface BidWithBidder extends Bid {
  agencyDetails: AgencyDetails | null;
}

interface QuotationWithBids extends Quotation {
  bids: BidWithBidder[];
}

const orderSchema = z.object({
  orderNo: z.string().min(1, "Order number is required"),
  orderDate: z.string().min(1, "Order date is required"),
  deliveryDate: z.string().min(1, "Delivery date is required"),
  specialInstructions: z.string().optional(),
  discount: z.coerce
    .number()
    .min(0, "Discount cannot be negative")
    .max(100, "Discount cannot exceed 100%")
    .optional()
    .default(0),
});

type OrderFormType = z.infer<typeof orderSchema>;

interface OrderCreationDialogProps {
  quotation: QuotationWithBids;
  winningBid: BidWithBidder | null;
}

export default function OrderCreationDialog({
  quotation,
  winningBid,
}: OrderCreationDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const form = useForm<OrderFormType>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      orderNo: `ORD/${String(quotation.id).slice(-3).padStart(3, "0")}/24-25`,
      orderDate: new Date().toISOString().split("T")[0],
      deliveryDate: "",
      specialInstructions: "",
      discount: 0,
    },
  });

  // Calculate adjusted amount with discount
  const discount = form.watch("discount") || 0;
  const adjustedAmount = winningBid
    ? winningBid.amount * (1 - discount / 100)
    : 0;

  const onSubmit = async (data: OrderFormType) => {
    // Validate for SALE quotations
    if (
      quotation.quotationType === QuotationType.SALE &&
      winningBid &&
      winningBid.amount < quotation.estimatedAmount
    ) {
      setError(
        `For SALE quotations, bid amount must be above estimated amount (${formatCurrency(
          quotation.estimatedAmount
        )})`
      );
      return;
    }

    if (!winningBid || !winningBid.agencyDetails) {
      setError("No valid winning bidder found for this quotation");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const user = await currentUser();

      if (!user?.id) {
        setError("User authentication failed");
        return;
      }

      // Apply discount to order items
      const adjustedTotal =
        winningBid.amount * (1 - (data.discount || 0) / 100);
      const quantity = Number(quotation.quantity) || 1;

      const orderItems = [
        {
          name: quotation.workName,
          specifications:
            quotation.specifications || quotation.description || "",
          quantity: quantity,
          unit: quotation.unit || "Item",
          rate: adjustedTotal / quantity,
          amount: adjustedTotal,
        },
      ];

      const orderData = {
        ...data,
        items: orderItems,
      };

      const result = await createOrder(
        quotation.id,
        winningBid.agencyDetails.id,
        orderData,
        user.id
      );

      if (result?.success) {
        alert("Order created successfully!");
        setIsOpen(false);
        router.refresh();
      } else {
        setError(result?.error || "Failed to create order");
      }
    } catch (error) {
      setError("An unexpected error occurred");
      console.error("Error creating order:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-1" />
          Create Order
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Purchase Order</DialogTitle>
          <DialogDescription>
            Create a purchase order for {quotation.workName}
          </DialogDescription>
        </DialogHeader>

        <div className="mb-4 p-4 bg-muted rounded-lg">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">NIT/NIQ No:</span> {quotation.nitNo}
            </div>
            <div>
              <span className="font-medium">Selected Bidder:</span>{" "}
              {winningBid?.agencyDetails?.name || "No bidder selected"}
            </div>
            <div>
              <span className="font-medium">Quotation Type:</span>{" "}
              <span
                className={cn(
                  "font-semibold",
                  quotation.quotationType === QuotationType.SALE
                    ? "text-green-600"
                    : "text-blue-600"
                )}
              >
                {quotation.quotationType}
              </span>
            </div>
            <div>
              <span className="font-medium">Estimated Amount:</span>{" "}
              {formatCurrency(quotation.estimatedAmount)}
            </div>
            <div className="col-span-2 grid grid-cols-3 gap-2 pt-2 border-t">
              <div>
                <span className="font-medium">Bid Amount:</span>{" "}
                {winningBid ? formatCurrency(winningBid.amount) : "N/A"}
              </div>
              <div>
                <span className="font-medium">Discount:</span>{" "}
                {discount > 0 ? `${discount}%` : "None"}
              </div>
              <div className="font-semibold">
                <span className="font-medium">Order Total:</span>{" "}
                {formatCurrency(adjustedAmount)}
              </div>
            </div>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <div className="grid grid-cols-3 gap-4">
              <FormField
                name="orderNo"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Order Number</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="orderDate"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Order Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="discount"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Discount (%)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type="number"
                          min={0}
                          max={100}
                          step={0.5}
                          {...field}
                        />
                        <span className="absolute right-3 top-2.5 text-muted-foreground">
                          %
                        </span>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                name="deliveryDate"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expected Delivery Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="pt-1">
                <p className="text-sm font-medium text-muted-foreground pb-1">
                  Original Amount
                </p>
                <p className="text-lg font-semibold">
                  {winningBid ? formatCurrency(winningBid.amount) : "N/A"}
                </p>
              </div>
            </div>

            <FormField
              name="specialInstructions"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Special Instructions (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Any special delivery or quality requirements..."
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* SALE type validation notice */}
            {quotation.quotationType === QuotationType.SALE && winningBid && (
              <div
                className={cn(
                  "p-3 rounded-md text-sm",
                  winningBid.amount >= quotation.estimatedAmount
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : "bg-yellow-50 text-yellow-700 border border-yellow-200"
                )}
              >
                {winningBid.amount >= quotation.estimatedAmount ? (
                  <CheckCircle className="h-4 w-4 inline mr-1.5" />
                ) : (
                  <span className="font-bold">⚠️ Requirement:</span>
                )}
                For SALE quotations, bid amount must be above estimated amount (
                {formatCurrency(quotation.estimatedAmount)})
              </div>
            )}

            <div className="flex justify-end gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading || !winningBid}>
                <CheckCircle className="h-4 w-4 mr-2" />
                {isLoading ? "Creating..." : "Create Order"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
