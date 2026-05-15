import {
  ListChecks,
  Plus,
  ChevronDown,
  Sparkles,
  FileText,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ItemsTable from "@/components/ItemsTable";
import AddEditItemDialog from "../AddEditItemDialog";
import EstimateLibraryDialog from "@/components/EstimateLibraryDialog";
import SaveTemplateDialog from "@/components/SaveTemplateDialog";
import LoadTemplateDialog from "@/components/LoadTemplateDialog";
import { StepHeader, StepNav } from "../components";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UseFormReturn } from "react-hook-form";
import { EstimateItemFormValues } from "../schema";
import {
  EstimateItem,
  GlobalDimensions,
  DrainParams,
  EstimateType,
} from "../types";

interface Step4Props {
  items: EstimateItem[];
  setItems: React.Dispatch<React.SetStateAction<EstimateItem[]>>;
  handleEditItem: (index: number) => void;
  addEditDialogOpen: boolean;
  setAddEditDialogOpen: (open: boolean) => void;
  form: UseFormReturn<EstimateItemFormValues>;
  editIndex: number | null;
  handleSaveAddEditItem: (newItem: EstimateItem) => void;
  estimateExists: boolean;
  isEditing: boolean;
  globalDimensions: GlobalDimensions;
  drainParams: DrainParams;
  estimateType: EstimateType;
  libraryDialogOpen: boolean;
  setLibraryDialogOpen: (open: boolean) => void;
  handleAddLibraryItems: (newItems: any[]) => void;
  saveTemplateOpen: boolean;
  setSaveTemplateOpen: (open: boolean) => void;
  loadTemplateOpen: boolean;
  setLoadTemplateOpen: (open: boolean) => void;
  handleLoadTemplateItems: (newItems: any[]) => void;
  openAddItemDialog: () => void;
  onNext: () => void;
  onPrev: () => void;
}

export function Step4_AddItems({
  items,
  setItems,
  handleEditItem,
  addEditDialogOpen,
  setAddEditDialogOpen,
  form,
  editIndex,
  handleSaveAddEditItem,
  estimateExists,
  isEditing,
  globalDimensions,
  drainParams,
  estimateType,
  libraryDialogOpen,
  setLibraryDialogOpen,
  handleAddLibraryItems,
  saveTemplateOpen,
  setSaveTemplateOpen,
  loadTemplateOpen,
  setLoadTemplateOpen,
  handleLoadTemplateItems,
  openAddItemDialog,
  onNext,
  onPrev,
}: Step4Props) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <StepHeader
        step={4}
        icon={<ListChecks className="h-5 w-5 text-emerald-600" />}
        title="Add & Manage Items"
        description="Add estimate items from the library, a template, or manually"
      />

      <Card className="overflow-hidden rounded-2xl shadow-sm border border-slate-200/80 bg-white">
        <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white px-6 py-5">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-slate-800">
                  Estimate Items
                </h2>
                <p className="text-sm text-slate-500 mt-0.5">
                  Add and manage items in your estimate
                </p>
              </div>
            </div>

            {(!estimateExists || isEditing) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm">
                    <Plus className="h-4 w-4" />
                    Add Items
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem
                    onSelect={() => setLibraryDialogOpen(true)}
                    className="cursor-pointer hover:bg-emerald-50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-100 rounded-lg">
                        <Sparkles className="h-4 w-4 text-emerald-700" />
                      </div>
                      <div>
                        <div className="font-medium">From Library</div>
                        <div className="text-xs text-slate-500">
                          Bulk add from template
                        </div>
                      </div>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() => setLoadTemplateOpen(true)}
                    className="cursor-pointer hover:bg-emerald-50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-orange-100 rounded-lg">
                        <FileText className="h-4 w-4 text-orange-700" />
                      </div>
                      <div>
                        <div className="font-medium">Load Template</div>
                        <div className="text-xs text-slate-500">
                          Use saved template
                        </div>
                      </div>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={openAddItemDialog}
                    className="cursor-pointer hover:bg-emerald-50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-100 rounded-lg">
                        <Plus className="h-4 w-4 text-slate-700" />
                      </div>
                      <div>
                        <div className="font-medium">Manual Entry</div>
                        <div className="text-xs text-slate-500">
                          Add items one by one
                        </div>
                      </div>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        <div className="px-6 pt-5 pb-1 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            Items List
            <Badge
              variant="secondary"
              className="rounded-full bg-emerald-100 text-emerald-800 font-medium"
            >
              {items.length}
            </Badge>
          </h3>
        </div>

        <div className="px-6 pb-6">
          {items.length > 0 ? (
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <ItemsTable
                items={items}
                deleteItem={(index) => {
                  setItems(
                    items
                      .filter((_, i) => i !== index)
                      .map((item, i) => ({ ...item, slNo: i + 1 })),
                  );
                }}
                editItem={handleEditItem}
                moveItem={(index, direction) => {
                  const newItems = [...items];
                  if (direction === "up" && index > 0) {
                    [newItems[index - 1], newItems[index]] = [
                      newItems[index],
                      newItems[index - 1],
                    ];
                  } else if (direction === "down" && index < items.length - 1) {
                    [newItems[index], newItems[index + 1]] = [
                      newItems[index + 1],
                      newItems[index],
                    ];
                  }
                  setItems(
                    newItems.map((item, i) => ({ ...item, slNo: i + 1 })),
                  );
                }}
                estimateExists={estimateExists}
                isEditing={isEditing}
              />
            </div>
          ) : (
            <div className="text-center py-14 px-6 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
              <div className="mx-auto w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center mb-4">
                <Plus className="h-7 w-7 text-emerald-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-1">
                No items yet
              </h3>
              <p className="text-slate-500 text-sm mb-6 max-w-sm mx-auto">
                Add items from the library, load a template, or enter one
                manually.
              </p>
              <Button
                onClick={openAddItemDialog}
                className="gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <Plus className="h-4 w-4" />
                Add First Item
              </Button>
            </div>
          )}
        </div>

        <AddEditItemDialog
          open={addEditDialogOpen}
          onOpenChange={setAddEditDialogOpen}
          form={form}
          isEditMode={editIndex !== null}
          onSave={handleSaveAddEditItem}
          estimateExists={estimateExists}
          isEditing={isEditing}
          items={items}
          setItems={setItems}
          globalDimensions={globalDimensions}
          drainParams={estimateType === "drain" ? drainParams : undefined}
          estimateType={estimateType}
        />
        <EstimateLibraryDialog
          open={libraryDialogOpen}
          onOpenChange={setLibraryDialogOpen}
          onAddItems={handleAddLibraryItems}
        />
        <SaveTemplateDialog
          open={saveTemplateOpen}
          onOpenChange={setSaveTemplateOpen}
          items={items}
        />
        <LoadTemplateDialog
          open={loadTemplateOpen}
          onOpenChange={setLoadTemplateOpen}
          onSelectTemplate={handleLoadTemplateItems}
        />
      </Card>

      <StepNav
        step={4}
        totalSteps={5}
        canNext={items.length > 0}
        onPrev={onPrev}
        onNext={onNext}
        nextLabel="Continue to Summary & Save"
        nextDisabledHint="Add at least one item to continue"
      />
    </div>
  );
}
