"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { format } from "date-fns";
import type { Booking } from "@/types/watertank";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

interface ReceiptProps {
  booking: Booking;
  receiptNumber: string;
}

const convertPaiseToWords = (amount: number): string => {
  const units = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
  ];
  const teens = [
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];
  const tens = [
    "",
    "Ten",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];

  const convertLessThanThousand = (num: number): string => {
    if (num === 0) return "";
    let result = "";

    if (num >= 100) {
      result += units[Math.floor(num / 100)] + " Hundred ";
      num %= 100;
    }

    if (num >= 20) {
      result += tens[Math.floor(num / 10)] + " ";
      num %= 10;
    } else if (num >= 10) {
      result += teens[num - 10] + " ";
      num = 0;
    }

    if (num > 0) {
      result += units[num] + " ";
    }

    return result.trim();
  };

  let rupees = Math.floor(amount);
  const paise = Math.round((amount - rupees) * 100);

  let words = "";
  if (rupees > 0) {
    if (rupees >= 100000) {
      words += convertLessThanThousand(Math.floor(rupees / 100000)) + " Lakh ";
      rupees %= 100000;
    }
    if (rupees >= 1000) {
      words +=
        convertLessThanThousand(Math.floor(rupees / 1000)) + " Thousand ";
      rupees %= 1000;
    }
    words += convertLessThanThousand(rupees);
    words += " Rupees";
  }

  if (paise > 0) {
    if (words.length > 0) words += " and ";
    words += convertLessThanThousand(paise) + " Paise";
  }

  return words + (words.length > 0 ? " Only" : "Zero Rupees");
};

export function Receipt({ booking, receiptNumber }: ReceiptProps) {
  const handlePrint = () => {
    const printContent = document.getElementById("print-content");
    const printWindow = window.open("", "_blank");

    if (!printWindow || !printContent) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receipt #${receiptNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; padding: 20px; max-width: 800px; margin: 0 auto; }
            .receipt-header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #eee; padding-bottom: 20px; }
            .grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1rem; margin: 20px 0; }
            .font-medium { font-weight: 500; }
            .text-muted-foreground { color: #6b7280; }
            .break-words { word-break: break-word; }
            .italic { font-style: italic; }
            .text-center { text-align: center; }
            .shadow-sm { box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
            .rounded-lg { border-radius: 0.5rem; }
            .p-6 { padding: 1.5rem; }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 250);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Printer className="h-4 w-4" />
          View Receipt
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold mb-6">
            Receipt #{receiptNumber}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-8">
          <Card id="print-content" className="border-2">
            <CardHeader className="space-y-6 bg-muted/10">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Date: {format(new Date(), "dd/MM/yyyy")}
                  </p>
                  <Badge variant="outline" className="capitalize">
                    {booking.serviceType.toLowerCase().replace("_", " ")}
                  </Badge>
                </div>
                <div className="text-right space-y-2">
                  <p className="text-sm font-medium">Status</p>
                  <Badge
                    variant={
                      booking.status === "CONFIRMED" ? "default" : "secondary"
                    }
                  >
                    {booking.status.toLowerCase()}
                  </Badge>
                </div>
              </div>
              <Separator className="my-4" />
            </CardHeader>
            <CardContent className="space-y-8 p-8">
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      Customer Name
                    </p>
                    <p className="text-lg font-medium">{booking.name}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      Address
                    </p>
                    <p className="text-base break-words">{booking.address}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      Contact Number
                    </p>
                    <p className="text-base">+91 {booking.phone}</p>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      Booking Date
                    </p>
                    <p className="text-base">
                      {format(
                        new Date(booking.bookingDate),
                        "dd/MM/yyyy hh:mm a"
                      )}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      Amount Paid
                    </p>
                    <p className="text-2xl font-bold text-primary">
                      ₹{booking.amount.toFixed(2)}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      Amount in Words
                    </p>
                    <p className="text-base italic text-muted-foreground">
                      {convertPaiseToWords(booking.amount)}
                    </p>
                  </div>
                </div>
              </div>
              <Separator className="my-6" />
              <div className="text-center space-y-2 text-sm text-muted-foreground">
                <p className="font-medium">
                  This is a computer-generated receipt
                </p>
                <p>No signature required</p>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-2">
            <Button onClick={handlePrint} className="gap-2" size="lg">
              <Printer className="h-5 w-5" />
              Print Receipt
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
