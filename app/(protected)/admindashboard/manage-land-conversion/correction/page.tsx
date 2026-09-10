"use client";

import { useState, useTransition } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { FileEdit, Search, Loader2 } from "lucide-react";
import LandConversionLayout from "../components/LandConversionLayout";
import { searchLandConversionByNo, updateLandConversionDetails } from "@/action/land-conversion-actions"; // Refresh TS


export default function CorrectionPage() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [isSearching, startSearch] = useTransition();
  const [isUpdating, startUpdate] = useTransition();
  const [application, setApplication] = useState<any>(null);

  // Form State
  const [formData, setFormData] = useState({
    applicantName: "",
    khatianNo: "",
    plotNo: "",
    mouza: "",
    jlNo: "",
    landAreaDec: "",
    presentLandUse: "",
    proposedLandUse: ""
  });

  const handleSearch = () => {
    if (!search.trim()) return;
    startSearch(async () => {
      const result = await searchLandConversionByNo(search.trim());
      if (result.success && result.data) {
        setApplication(result.data);
        setFormData({
          applicantName: result.data.applicantName || "",
          khatianNo: result.data.khatianNo || "",
          plotNo: result.data.plotNo || "",
          mouza: result.data.mouza || "",
          jlNo: result.data.jlNo || "",
          landAreaDec: result.data.landAreaDec || "",
          presentLandUse: result.data.presentLandUse || "",
          proposedLandUse: result.data.proposedLandUse || ""
        });
        toast({ title: "Application found" });
      } else {
        setApplication(null);
        toast({
          title: "Not found",
          description: result.error || "Application not found.",
          variant: "destructive"
        });
      }
    });
  };

  const handleUpdate = () => {
    if (!application) return;
    startUpdate(async () => {
      const result = await updateLandConversionDetails(application.id, formData);
      if (result.success) {
        toast({ title: "Success", description: result.message });
      } else {
        toast({ title: "Error", description: result.error, variant: "destructive" });
      }
    });
  };

  return (
    <LandConversionLayout
      title="Make Correction"
      description="Correct land details if there were any mistakes during entry."
      icon={FileEdit}
    >
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Search Application</CardTitle>
            <CardDescription>Enter the application number to fetch details (e.g. LC-2024-0001)</CardDescription>
          </CardHeader>
          <CardContent className="flex gap-2">
            <Input 
              placeholder="Application No..." 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
              className="max-w-md"
            />
            <Button onClick={handleSearch} disabled={isSearching}>
              {isSearching ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Search className="h-4 w-4 mr-2" />}
              Search
            </Button>
          </CardContent>
        </Card>

        {application && (
          <Card>
            <CardHeader>
              <CardTitle>Edit Application Details</CardTitle>
              <CardDescription>Update the details below and save.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Applicant Name</Label>
                  <Input 
                    value={formData.applicantName} 
                    onChange={e => setFormData({...formData, applicantName: e.target.value})} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Khatian No</Label>
                  <Input 
                    value={formData.khatianNo} 
                    onChange={e => setFormData({...formData, khatianNo: e.target.value})} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Plot No</Label>
                  <Input 
                    value={formData.plotNo} 
                    onChange={e => setFormData({...formData, plotNo: e.target.value})} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Mouza</Label>
                  <Input 
                    value={formData.mouza} 
                    onChange={e => setFormData({...formData, mouza: e.target.value})} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>JL No</Label>
                  <Input 
                    value={formData.jlNo} 
                    onChange={e => setFormData({...formData, jlNo: e.target.value})} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Land Area (Dec)</Label>
                  <Input 
                    value={formData.landAreaDec} 
                    onChange={e => setFormData({...formData, landAreaDec: e.target.value})} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Present Land Use</Label>
                  <Input 
                    value={formData.presentLandUse} 
                    onChange={e => setFormData({...formData, presentLandUse: e.target.value})} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Proposed Land Use</Label>
                  <Input 
                    value={formData.proposedLandUse} 
                    onChange={e => setFormData({...formData, proposedLandUse: e.target.value})} 
                  />
                </div>
              </div>
              <Button onClick={handleUpdate} disabled={isUpdating} className="mt-4">
                {isUpdating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <FileEdit className="h-4 w-4 mr-2" />}
                Save Corrections
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </LandConversionLayout>
  );
}
