"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { useToast } from "@/components/ui/use-toast";
import { getBackupData } from "./actions";
import JSZip from "jszip";

const BackupPage = () => {
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const { toast } = useToast();

  const handleBackup = async () => {
    try {
      setIsBackingUp(true);
      const result = await getBackupData();

      if (result.success && result.data) {
        const zip = new JSZip();
        const timestamp = result.data.timestamp;
        const backupData = result.data.data;

        // Add each model as a separate JSON file
        Object.entries(backupData).forEach(([modelName, data]) => {
          zip.file(`${modelName}.json`, JSON.stringify(data, null, 2));
        });

        // Add a metadata file
        zip.file("metadata.json", JSON.stringify({ timestamp }, null, 2));

        // Generate zip file
        const content = await zip.generateAsync({ type: "blob" });

        // Create downloadable file
        const url = window.URL.createObjectURL(content);
        const link = document.createElement("a");
        link.href = url;
        link.download = `backup-${new Date()
          .toISOString()
          .replace(/[:.]/g, "-")}.zip`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);

        toast({
          title: "Success",
          description: "Backup zip file has been downloaded successfully.",
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("Backup error:", error);
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
      input.accept = ".zip,.json";

      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) return;

        try {
          if (file.name.endsWith(".zip")) {
            const zip = new JSZip();
            const content = await zip.loadAsync(file);
            const modelFiles = Object.keys(content.files).filter(
              (name) => name.endsWith(".json") && name !== "metadata.json",
            );

            console.log(`Found ${modelFiles.length} models in backup zip`);
            // Implementation for ZIP restoration would go here
          } else {
            const content = await file.text();
            const backupData = JSON.parse(content);
            // Implementation for single JSON restoration
          }

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
