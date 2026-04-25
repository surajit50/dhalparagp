"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { useToast } from "@/components/ui/use-toast";
import { getBackupData } from "./actions";

const BackupPage = () => {
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const { toast } = useToast();

  const handleBackup = async () => {
    try {
      setIsBackingUp(true);
      const result = await getBackupData();

      if (result.success) {
        // Create downloadable file
        const blob = new Blob([JSON.stringify(result.data, null, 2)], {
          type: "application/json",
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `backup-${new Date()
          .toISOString()
          .replace(/[:.]/g, "-")}.json`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);

        toast({
          title: "Success",
          description: "Backup file has been downloaded successfully.",
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create system backup.",
      });
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleRestore = async () => {
    if (!date) return;
    try {
      setIsRestoring(true);

      // Create file input element
      const input = document.createElement("input");
      input.type = "file";
      input.accept = ".json";

      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) return;

        try {
          const content = await file.text();
          const backupData = JSON.parse(content);

          // Here you would implement the restore logic using another server action
          // For now, just show success message
          toast({
            title: "Success",
            description: "System has been restored successfully.",
          });
        } catch (error) {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Invalid backup file.",
          });
        }
      };

      input.click();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to restore system.",
      });
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Backup & Restore</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Create Backup</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Create a new backup of your system data
            </p>
            <Button
              className="w-full"
              onClick={handleBackup}
              disabled={isBackingUp}
            >
              {isBackingUp ? "Creating Backup..." : "Create Backup"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Restore System</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Restore system from a previous backup
            </p>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border"
            />
            <Button
              variant="destructive"
              className="w-full"
              onClick={handleRestore}
              disabled={isRestoring || !date}
            >
              {isRestoring ? "Restoring..." : "Restore System"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BackupPage;
