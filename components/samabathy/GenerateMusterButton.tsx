"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Loader2, FilePlus } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  getEligibleApplicationIds,
  generateMusterRollBatch,
  finalizeMusterRollGeneration,
} from "@/app/actions/generate-muster-roll";
import { Progress } from "@/components/ui/progress";
import { SAMABYATHI_CONFIG } from "@/constants/samabyathi";
import FullPageLoader from "./FullPageLoader";

export default function GenerateMusterButton() {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const router = useRouter();

  const handleClick = async () => {
    setLoading(true);
    setProgress(0);

    try {
      const ids = await getEligibleApplicationIds();

      if (ids.length === 0) {
        toast.error("No eligible applications found");
        setLoading(false);
        return;
      }

      const musterRollNo = `MR-${new Date().getFullYear()}-${Date.now()}`;
      const CHUNK_SIZE = SAMABYATHI_CONFIG.CHUNK_SIZE;
      const total = ids.length;
      let processed = 0;

      for (let i = 0; i < total; i += CHUNK_SIZE) {
        const batch = ids.slice(i, i + CHUNK_SIZE);
        const result = await generateMusterRollBatch(batch, musterRollNo);

        if (!result.success) {
          throw new Error(result.error || "Batch failed");
        }

        processed += batch.length;
        setProgress(Math.round((processed / total) * 100));
      }

      await finalizeMusterRollGeneration();
      toast.success(
        `Generated ${total} muster roll(s) - ₹${(total * SAMABYATHI_CONFIG.AMOUNT_PER_APP).toLocaleString("en-IN")}`,
      );
      router.refresh();
    } catch (err) {
      console.error("[v0] Error generating muster roll:", err);
      toast.error(
        err instanceof Error ? err.message : "Failed to generate muster roll",
      );
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  return (
    <div className="flex flex-col gap-2 min-w-[150px]">
      <FullPageLoader
        isLoading={loading}
        progress={progress}
        title="Generating Muster Rolls"
        description="Please wait while we process and generate the muster rolls for eligible applications."
      />
      <Button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="w-full"
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin mr-2 h-4 w-4" />
            Generating ({progress}%)
          </>
        ) : (
          <>
            <FilePlus className="mr-2 h-4 w-4" />
            Generate Muster
          </>
        )}
      </Button>
    </div>
  );
}
