"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Loader2 } from "lucide-react";
import { useToast } from "../ui/use-toast";

interface ServiceFeeFormData {
  serviceType: "WATER_TANKER" | "DUSTBIN_VAN";
  amount: number;
}

export default function ServiceAddForm() {
  const [formData, setFormData] = useState<ServiceFeeFormData>({
    serviceType: "WATER_TANKER",
    amount: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast({
        title: "Service fee updated",
        description: `${formData.serviceType.replace("_", " ")} fee set to ₹${
          formData.amount
        }`,
      });

      // Reset form
      setFormData({
        serviceType: "WATER_TANKER",
        amount: 0,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update service fee",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Add/Update Service Fee</CardTitle>
        <CardDescription>
          Set the pricing for water tanker and dustbin van services
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="serviceType">Service Type</Label>
            <Select
              value={formData.serviceType}
              onValueChange={(value: "WATER_TANKER" | "DUSTBIN_VAN") =>
                setFormData((prev) => ({ ...prev, serviceType: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select service type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="WATER_TANKER">Water Tanker</SelectItem>
                <SelectItem value="DUSTBIN_VAN">Dustbin Van</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount (₹)</Label>
            <Input
              id="amount"
              type="number"
              min="0"
              step="0.01"
              value={formData.amount}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  amount: Number.parseFloat(e.target.value) || 0,
                }))
              }
              placeholder="Enter service fee"
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? "Updating..." : "Update Service Fee"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
