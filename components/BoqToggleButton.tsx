"use client";

import { useState } from "react";
import { toggleBoqPrepared } from "@/lib/actions/works";
import { CheckCircle, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner"; // or any toast library

interface BoqToggleButtonProps {
  workId: string;
  initialBoqPrepared: boolean;
}

export function BoqToggleButton({ workId, initialBoqPrepared }: BoqToggleButtonProps) {
  const [isPrepared, setIsPrepared] = useState(initialBoqPrepared);
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    setLoading(true);
    const result = await toggleBoqPrepared(workId, isPrepared);
    if (result.success) {
      setIsPrepared(!isPrepared);
      toast.success(`BOQ marked as ${!isPrepared ? "prepared" : "not prepared"}`);
    } else {
      toast.error("Failed to update BOQ status");
    }
    setLoading(false);
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleToggle}
      disabled={loading}
      className="flex items-center gap-1"
    >
      {isPrepared ? (
        <CheckCircle className="w-4 h-4 text-green-600" />
      ) : (
        <Circle className="w-4 h-4 text-gray-400" />
      )}
      <span className="text-sm">{isPrepared ? "BOQ Ready" : "Mark BOQ Ready"}</span>
    </Button>
  );
}
