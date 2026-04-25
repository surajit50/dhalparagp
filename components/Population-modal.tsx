"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import PopulationForm from "./form/population-form";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Village {
  id: string;
  name: string;
}

interface ModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  villages: Village[];
}

export default function PopulationModal({
  open,
  setOpen,
  villages,
}: ModalProps) {
  const router = useRouter();

  const handleCloseDialog = () => {
    setOpen(false);
    router.refresh();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] flex flex-col p-0 gap-0">
        <div className="px-6 py-4 border-b">
          <DialogHeader>
            <DialogTitle>Add Population</DialogTitle>
            <DialogDescription>
              Enter the population data in the form below.
            </DialogDescription>
          </DialogHeader>
        </div>
        <ScrollArea className="flex-grow px-6 py-4">
          <PopulationForm villages={villages} onSuccess={handleCloseDialog} />
        </ScrollArea>
        <DialogFooter className="px-6 py-4 border-t">
          <Button variant="outline" onClick={handleCloseDialog}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
