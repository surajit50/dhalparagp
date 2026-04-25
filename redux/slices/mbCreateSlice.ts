import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { EstimateItem, MBEntry, MBFormData } from "@/app/(protected)/admindashboard/work-manage/(estimate_bii)/mb-create/components/types";

interface MbCreateState {
  works: any[];
  selectedWorkId: string;
  estimateItems: EstimateItem[];
  mbEntries: MBEntry[];
  formData: MBFormData;
  isMBSaved: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: MbCreateState = {
  works: [],
  selectedWorkId: "",
  estimateItems: [],
  mbEntries: [],
  formData: {
    mbNumber: "",
    mbPageNumber: "",
    measuredDate: new Date().toISOString().split("T")[0],
    measuredBy: "",
    checkedBy: "",
  },
  isMBSaved: false,
  loading: false,
  error: null,
};

export const fetchWorks = createAsyncThunk("mbCreate/fetchWorks", async () => {
  const response = await fetch("/api/works");
  if (!response.ok) throw new Error("Failed to fetch works");
  return await response.json();
});

export const fetchEstimateItems = createAsyncThunk(
  "mbCreate/fetchEstimateItems",
  async (workId: string) => {
    const response = await fetch(`/api/work-estimate-items?workId=${workId}`, {
      cache: "no-store",
    });
    if (!response.ok) throw new Error("Failed to fetch estimate items");
    const data = await response.json();
    const allItems = data.items || data || [];
    return allItems
      .filter((item: any) => !(item.description === "Contingency" && item.slNo === 9999))
      .sort((a: any, b: any) => a.slNo - b.slNo);
  }
);

export const fetchMBEntries = createAsyncThunk(
  "mbCreate/fetchMBEntries",
  async (workId: string) => {
    const response = await fetch(`/api/work-measurement-books?workId=${workId}`, {
      cache: "no-store",
    });
    if (!response.ok) throw new Error("Failed to fetch MB entries");
    return await response.json();
  }
);

export const saveMBEntries = createAsyncThunk(
  "mbCreate/saveMBEntries",
  async ({ workId, entries }: { workId: string; entries: MBEntry[] }) => {
    const newEntries = entries.filter((entry) => !entry.id);
    const existingEntries = entries.filter((entry) => entry.id);

    if (newEntries.length > 0) {
      const res = await fetch("/api/work-measurement-books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workId, entries }),
      });
      if (!res.ok) throw new Error("Failed to save new entries");
    } else if (existingEntries.length > 0) {
      const res = await fetch("/api/work-measurement-books", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entries: existingEntries }),
      });
      if (!res.ok) throw new Error("Failed to update entries");
    }
    return entries; // Returning what we sent to not reload, though re-fetching from UI might trigger
  }
);

export const deleteMBEntry = createAsyncThunk(
  "mbCreate/deleteMBEntry",
  async (id: string) => {
    const response = await fetch(`/api/work-measurement-books?id=${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "Failed to delete MB entry");
    }
    return id;
  }
);

const mbCreateSlice = createSlice({
  name: "mbCreate",
  initialState,
  reducers: {
    setSelectedWorkId(state, action: PayloadAction<string>) {
      state.selectedWorkId = action.payload;
      // Reset dependent states
      state.estimateItems = [];
      state.mbEntries = [];
      state.isMBSaved = false;
      state.formData = {
        mbNumber: "",
        mbPageNumber: "",
        measuredDate: new Date().toISOString().split("T")[0],
        measuredBy: "",
        checkedBy: "",
      };
    },
    setFormData(state, action: PayloadAction<MBFormData>) {
      state.formData = action.payload;
    },
    setIsMBSaved(state, action: PayloadAction<boolean>) {
      state.isMBSaved = action.payload;
    },
    addMBEntries(state, action: PayloadAction<MBEntry[]>) {
      state.mbEntries.push(...action.payload);
    },
    updateMBEntry(state, action: PayloadAction<MBEntry>) {
      const index = state.mbEntries.findIndex(
        (e) => (e.id && e.id === action.payload.id) || 
               (e.estimateItemId === action.payload.estimateItemId && e.subItemId === action.payload.subItemId)
      );
      if (index !== -1) {
        state.mbEntries[index] = action.payload;
      }
    },
    removeUnsavedMBEntry(state, action: PayloadAction<{estimateItemId: string, subItemId?: string}>) {
      state.mbEntries = state.mbEntries.filter(
        (e) => !(e.estimateItemId === action.payload.estimateItemId && (e.subItemId || undefined) === (action.payload.subItemId || undefined))
      );
    },
    setMbEntriesDirect(state, action: PayloadAction<MBEntry[]>) {
        state.mbEntries = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // fetchWorks
      .addCase(fetchWorks.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchWorks.fulfilled, (state, action) => {
        state.works = action.payload;
        state.loading = false;
      })
      .addCase(fetchWorks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch works";
      })
      // fetchEstimateItems
      .addCase(fetchEstimateItems.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchEstimateItems.fulfilled, (state, action) => {
        state.estimateItems = action.payload;
        state.loading = false;
      })
      .addCase(fetchEstimateItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch estimate items";
      })
      // fetchMBEntries
      .addCase(fetchMBEntries.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMBEntries.fulfilled, (state, action) => {
        state.mbEntries = action.payload;
        if (action.payload && action.payload.length > 0) {
          const sorted = [...action.payload].sort(
            (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          const latest = sorted[0];
          state.formData = {
            mbNumber: latest.mbNumber,
            mbPageNumber: latest.mbPageNumber,
            measuredDate: new Date(latest.measuredDate).toISOString().split("T")[0],
            measuredBy: latest.measuredBy,
            checkedBy: latest.checkedBy || "",
          };
          state.isMBSaved = true;
        }
        state.loading = false;
      })
      .addCase(fetchMBEntries.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch MB entries";
      })
      // saveMBEntries
      .addCase(saveMBEntries.pending, (state) => {
        state.loading = true;
      })
      .addCase(saveMBEntries.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(saveMBEntries.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to save MB entries";
      })
      // deleteMBEntry
      .addCase(deleteMBEntry.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteMBEntry.fulfilled, (state, action) => {
        state.mbEntries = state.mbEntries.filter((e) => e.id !== action.payload);
        state.loading = false;
      })
      .addCase(deleteMBEntry.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to delete entry";
      });
  },
});

export const {
  setSelectedWorkId,
  setFormData,
  setIsMBSaved,
  addMBEntries,
  updateMBEntry,
  removeUnsavedMBEntry,
  setMbEntriesDirect
} = mbCreateSlice.actions;

export default mbCreateSlice.reducer;
