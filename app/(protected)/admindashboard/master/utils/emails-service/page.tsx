"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

  import {
  emailServiceStatus,
  updateEmailServiceStatus,
  getEmailServiceHistory,
} from "@/lib/emailservide";
import { toast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Power, Clock, AlertCircle, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface StatusHistory {
  emailservicestatus: boolean;
  createdAt: Date;
}

const EmailServicePage = () => {
  const [isServiceRunning, setIsServiceRunning] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [history, setHistory] = useState<StatusHistory[]>([]);

  // -----------------------------
  // Fetch Service Status
  // -----------------------------
  const fetchServiceStatus = useCallback(async () => {
    try {
      const status = await emailServiceStatus();
      setIsServiceRunning(status);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Unexpected error occurred";

      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // -----------------------------
  // Fetch History (Sorted + Latest 5)
  // -----------------------------
  const fetchHistory = useCallback(async () => {
    try {
      const historyData = await getEmailServiceHistory();

      const sorted = historyData
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() -
            new Date(a.createdAt).getTime()
        )
        .slice(0, 5);

      setHistory(sorted);
    } catch (error: unknown) {
      toast({
        title: "Error",
        description: "Failed to fetch service history",
        variant: "destructive",
      });
    }
  }, []);

  // -----------------------------
  // Initial Load + Auto Refresh
  // -----------------------------
  useEffect(() => {
    fetchServiceStatus();
    fetchHistory();

    const interval = setInterval(() => {
      fetchServiceStatus();
      fetchHistory();
    }, 30000); // refresh every 30 seconds

    return () => clearInterval(interval);
  }, [fetchServiceStatus, fetchHistory]);

  // -----------------------------
  // Toggle Service
  // -----------------------------
  const handleToggleService = async () => {
    if (isLoading) return;

    try {
      if (isServiceRunning) {
        const confirmed = confirm(
          "Are you sure you want to stop the email service?"
        );
        if (!confirmed) return;
      }

      setIsLoading(true);

      const newStatus = !isServiceRunning;
      const success = await updateEmailServiceStatus(newStatus);

      if (!success) {
        throw new Error("Failed to update service status");
      }

      setIsServiceRunning(newStatus);
      await fetchHistory();

      toast({
        title: "Success",
        description: `Email service ${
          newStatus ? "started" : "stopped"
        } successfully`,
      });
    } catch (error: unknown) {
      toast({
        title: "Error",
        description: "Failed to update email service status",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Email Service</h1>
        <p className="text-muted-foreground mt-1">
          Manage and monitor the email service status
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* ============================= */}
        {/* Service Status Card */}
        {/* ============================= */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">Service Status</CardTitle>
                <CardDescription>
                  Current state of the email service
                </CardDescription>
              </div>

              <div
                className={`p-2 rounded-full ${
                  isServiceRunning ? "bg-green-100" : "bg-red-100"
                }`}
              >
                <Power
                  className={`h-6 w-6 ${
                    isServiceRunning ? "text-green-600" : "text-red-600"
                  }`}
                />
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Status Indicator */}
            <div className="flex items-center gap-3">
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  isServiceRunning ? "bg-green-500" : "bg-red-500"
                }`}
              />
              <Badge
                variant={isServiceRunning ? "success" : "destructive"}
              >
                {isServiceRunning ? "Running" : "Stopped"}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {isServiceRunning
                  ? "Email service is currently active"
                  : "Email service is currently inactive"}
              </span>
            </div>

            <Separator />

            {/* Toggle Button */}
            <Button
              onClick={handleToggleService}
              disabled={isLoading}
              variant={isServiceRunning ? "destructive" : "default"}
              className="w-full"
              size="lg"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing...
                </span>
              ) : isServiceRunning ? (
                "Stop Service"
              ) : (
                "Start Service"
              )}
            </Button>
          </CardContent>
        </Card>

        {/* ============================= */}
        {/* Service History Card */}
        {/* ============================= */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">Service History</CardTitle>
                <CardDescription>
                  Latest 5 status changes
                </CardDescription>
              </div>
              <Clock className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>

          <CardContent>
            {isLoading && history.length === 0 ? (
              <div className="space-y-3">
                <div className="h-6 bg-muted rounded animate-pulse" />
                <div className="h-6 bg-muted rounded animate-pulse" />
                <div className="h-6 bg-muted rounded animate-pulse" />
              </div>
            ) : history.length === 0 ? (
              <div className="flex items-center justify-center h-32 text-muted-foreground">
                <AlertCircle className="h-5 w-5 mr-2" />
                No history available
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {history.map((record, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">
                          {format(new Date(record.createdAt), "PPpp")}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              record.emailservicestatus
                                ? "success"
                                : "destructive"
                            }
                          >
                            {record.emailservicestatus
                              ? "Enabled"
                              : "Disabled"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <p className="text-xs text-muted-foreground text-center mt-2">
                  Showing the 5 most recent status changes
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EmailServicePage;
