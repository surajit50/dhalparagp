"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";

export default function GrievanceRedressal() {
  const [grievanceType, setGrievanceType] = useState("");

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    toast({
      title: "Grievance Submitted",
      description:
        "Your grievance has been recorded. We'll address it as soon as possible.",
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-6">Grievance Redressal</h1>
      <p className="text-xl mb-8">
        Submit your complaints or suggestions to Dhalpara Gram Panchayat.
      </p>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Grievance Submission Form</CardTitle>
          <CardDescription>
            Please provide details about your grievance or suggestion.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" placeholder="Enter your full name" required />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="mobile">Mobile Number</Label>
                <Input
                  id="mobile"
                  type="tel"
                  placeholder="Enter your mobile number"
                  required
                />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="grievanceType">Grievance Type</Label>
                <Select onValueChange={setGrievanceType} required>
                  <SelectTrigger id="grievanceType">
                    <SelectValue placeholder="Select grievance type" />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    <SelectItem value="water">Water Supply</SelectItem>
                    <SelectItem value="sanitation">Sanitation</SelectItem>
                    <SelectItem value="roads">
                      Roads and Infrastructure
                    </SelectItem>
                    <SelectItem value="electricity">Electricity</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="description">Grievance Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your grievance or suggestion in detail"
                  required
                />
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline">Cancel</Button>
          <Button type="submit" onClick={handleSubmit}>
            Submit Grievance
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
