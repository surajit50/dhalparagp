// app/admindashboard/manage-tender/addtechnicaldetails/[workid]/AddTechnicalDetailsButton.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import AddTechnicalDetailsDialog from "@/components/AddTechnicalDetailsDialog";

export default function AddTechnicalDetailsButton({ agencyId }: { agencyId: string }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <>
      <Button
        variant="default"
        size="sm"
        onClick={() => setIsDialogOpen(true)}
        className="flex items-center"
      >
        <Plus className="mr-2 h-4 w-4" />
        Add Details
      </Button>
      
      {isDialogOpen && (
        <AddTechnicalDetailsDialog
          agencyid={agencyId}
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
        />
      )}
    </>
  );
}
