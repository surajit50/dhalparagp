import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { MBEntry, MBFormData, MeasurableItem, Measurement, SubItem } from "../components/types";
import { deleteMBEntry as deleteApi, fetchMBEntries as fetchApi, saveMBEntries as saveApi, updateMBEntries as updateApi } from "../api";

interface UseMBEntriesProps {
  selectedWorkId: string;
  formData: MBFormData;
  setFormData: (data: MBFormData | ((prev: MBFormData) => MBFormData)) => void;
  setIsMBSaved: (saved: boolean) => void;
}

export function useMBEntries({ selectedWorkId, formData, setFormData, setIsMBSaved }: UseMBEntriesProps) {
  const [mbEntries, setMbEntries] = useState<MBEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchMBEntries = useCallback(async (workId: string) => {
    try {
      setLoading(true);
      const data = await fetchApi(workId);
      setMbEntries(data);

      if (data && data.length > 0) {
        // Find the most recently created entry to populate form data
        const sorted = [...data].sort(
          (a: any, b: any) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
        const latest = sorted[0];

        setFormData({
          mbNumber: latest.mbNumber,
          mbPageNumber: latest.mbPageNumber,
          measuredDate: new Date(latest.measuredDate)
            .toISOString()
            .split("T")[0],
          measuredBy: latest.measuredBy,
          checkedBy: latest.checkedBy || "",
        });
        setIsMBSaved(true);
      }
    } catch (error) {
      console.error("Error fetching MB entries:", error);
      toast.error("Failed to load MB entries");
    } finally {
      setLoading(false);
    }
  }, [setFormData, setIsMBSaved]);

  const handleDeleteEntry = useCallback(async (entry: MBEntry) => {
    if (entry.id) {
      if (!confirm("Are you sure you want to delete this MB entry?")) {
        return;
      }

      setLoading(true);
      try {
        await deleteApi(entry.id);
        toast.success("MB entry deleted", {
          description: "The item is now available for measurement again",
          position: "top-center",
          duration: 3000,
        });
        setMbEntries((prev) => prev.filter((e) => e.id !== entry.id));
      } catch (error: any) {
        console.error("Error deleting MB entry:", error);
        toast.error(error.message || "Error deleting MB entry");
      } finally {
        setLoading(false);
      }
    } else {
      // Unsaved entry: remove by estimateItemId + subItemId match
      setMbEntries((prev) =>
        prev.filter((e) => {
          const sameEntry =
            e.estimateItemId === entry.estimateItemId &&
            (e.subItemId || undefined) === (entry.subItemId || undefined);
          return !sameEntry;
        }),
      );
      toast.info("Unsaved entry removed", {
        description: "The item is now available for measurement again",
        position: "top-center",
        duration: 3000,
      });
    }
  }, []);

  const handleSave = useCallback(async () => {
    if (!selectedWorkId) {
      toast.error("Please select a work");
      return;
    }

    if (mbEntries.length === 0) {
      toast.error("Please add at least one MB entry");
      return;
    }

    const newEntries = mbEntries.filter((entry) => !entry.id);
    const existingEntries = mbEntries.filter((entry) => entry.id);

    if (newEntries.length === 0 && existingEntries.length === 0) {
      toast.info("No entries to save");
      return;
    }

    setLoading(true);
    try {
      if (newEntries.length > 0) {
        await saveApi(selectedWorkId, mbEntries);
      } else if (existingEntries.length > 0) {
        await updateApi(existingEntries);
      }

      toast.success("Measurement Book saved successfully", {
        position: "top-center",
        duration: 3000,
      });
      await fetchMBEntries(selectedWorkId);
    } catch (error) {
      console.error("Error saving MB entries:", error);
      toast.error("Error saving MB entries");
    } finally {
      setLoading(false);
    }
  }, [selectedWorkId, mbEntries, fetchMBEntries]);

  return {
    mbEntries,
    setMbEntries,
    loading,
    fetchMBEntries,
    handleDeleteEntry,
    handleSave,
  };
}
