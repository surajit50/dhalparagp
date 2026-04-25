"use client";

import React, { useState } from "react";
import PopulationModal from "../Population-modal";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

interface Village {
  id: string;
  name: string;
}

interface PopulationProps {
  villages: Village[];
}

export default function Population({ villages }: PopulationProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex items-center justify-between p-4 bg-background rounded-lg shadow">
      <h2 className="text-xl font-semibold text-foreground">
        Village Population
      </h2>
      <Button
        onClick={() => setOpen(true)}
        aria-label="Add population data"
        className="flex items-center gap-2"
      >
        <PlusCircle className="w-4 h-4" />
        Add
      </Button>
      <PopulationModal open={open} setOpen={setOpen} villages={villages} />
    </div>
  );
}
