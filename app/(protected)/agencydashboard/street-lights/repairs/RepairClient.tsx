"use client";

import { useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Camera, CheckCircle, Clock, Upload, Loader2, X } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { markComplaintRepaired } from "@/actions/agency-street-lights";
import Image from "next/image";

type Complaint = {
  id: string;
  complaintNo: string;
  status: string;
  priority: string;
  description: string;
  createdAt: string;
  assignedDate: string | null;
  repairDate: string | null;
  completionImageUrl: string | null;
  streetLight: {
    lightId: string;
    landmark?: string | null;
    mouza?: { mouzaName: string } | null;
  };
};

export default function RepairClient({ initialComplaints }: { initialComplaints: Complaint[] }) {
  const [complaints, setComplaints] = useState<Complaint[]>(initialComplaints);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [remarks, setRemarks] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openModal = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setRemarks("");
    setFile(null);
    setPreviewUrl(null);
    setIsModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  const handleSubmit = async () => {
    if (!selectedComplaint) return;
    if (!file) {
      toast.error("Please provide a photo as proof of repair.");
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Upload file to our API route which handles Cloudinary
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "street-lights/repairs");

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) {
        throw new Error("Failed to upload image");
      }

      const uploadData = await uploadRes.json();
      const imageUrl = uploadData.url;
      const publicId = uploadData.publicId;

      // 2. Call server action to update database
      const res = await markComplaintRepaired(selectedComplaint.id, remarks, imageUrl, publicId);
      
      if (res.success) {
        toast.success("Work order updated successfully!");
        // Update local state to reflect changes immediately
        setComplaints(prev => 
          prev.map(c => 
            c.id === selectedComplaint.id 
              ? { ...c, status: "RESOLVED", repairDate: new Date().toISOString(), completionImageUrl: imageUrl } 
              : c
          )
        );
        setIsModalOpen(false);
      } else {
        toast.error(res.error || "Failed to update work order");
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "RESOLVED":
      case "CLOSED":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200 border-green-200">Resolved</Badge>;
      case "IN_PROGRESS":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-200">In Progress</Badge>;
      case "ASSIGNED":
      case "PENDING":
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200 border-amber-200">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Complaint No</TableHead>
              <TableHead>Light ID & Location</TableHead>
              <TableHead>Assigned Date</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {complaints.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                  No work orders assigned to you yet.
                </TableCell>
              </TableRow>
            ) : (
              complaints.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-mono text-sm">{c.complaintNo}</TableCell>
                  <TableCell>
                    <div className="font-semibold text-orange-700">{c.streetLight.lightId}</div>
                    <div className="text-xs text-muted-foreground">
                      {c.streetLight.mouza?.mouzaName ? `${c.streetLight.mouza.mouzaName} - ` : ""}
                      {c.streetLight.landmark}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {c.assignedDate ? format(new Date(c.assignedDate), "PP") : "N/A"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={c.priority === "URGENT" || c.priority === "HIGH" ? "destructive" : "secondary"}>
                      {c.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>{getStatusBadge(c.status)}</TableCell>
                  <TableCell className="text-right">
                    {c.status === "RESOLVED" || c.status === "CLOSED" ? (
                      <Button variant="outline" size="sm" disabled className="w-24">
                        <CheckCircle className="w-4 h-4 mr-2 text-green-600" /> Done
                      </Button>
                    ) : (
                      <Button onClick={() => openModal(c)} size="sm" className="w-24 bg-blue-600 hover:bg-blue-700">
                        <Camera className="w-4 h-4 mr-2" /> Repair
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Mark Light as Repaired</DialogTitle>
            <DialogDescription>
              Upload a photo of the repaired light (ID: <span className="font-bold text-orange-700">{selectedComplaint?.streetLight.lightId}</span>) to submit the completion report.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="space-y-3">
              <Label>Proof of Repair (Photo)</Label>
              {previewUrl ? (
                <div className="relative rounded-lg overflow-hidden border aspect-video bg-muted flex items-center justify-center">
                  <img src={previewUrl} alt="Preview" className="object-cover w-full h-full" />
                  <Button 
                    size="icon" 
                    variant="destructive" 
                    className="absolute top-2 right-2 h-8 w-8 rounded-full"
                    onClick={() => { setFile(null); setPreviewUrl(null); }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-center w-full">
                  <label htmlFor="photo-upload" className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 border-gray-300">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Camera className="w-10 h-10 mb-3 text-gray-400" />
                      <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Tap to capture</span> or click to upload</p>
                    </div>
                    {/* capture="environment" forces rear camera on mobile */}
                    <input 
                      id="photo-upload" 
                      type="file" 
                      accept="image/*" 
                      capture="environment" 
                      className="hidden" 
                      onChange={handleFileChange}
                    />
                  </label>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <Label>Remarks (Optional)</Label>
              <Textarea 
                placeholder="Any additional details about the repair..."
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className="resize-none h-24"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting || !file} className="bg-green-600 hover:bg-green-700 text-white">
              {isSubmitting ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...</>
              ) : (
                <><Upload className="w-4 h-4 mr-2" /> Submit Report</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
