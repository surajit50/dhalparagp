"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  ChevronRight,
  PlusCircle,
  Save,
  Trash2,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { maleRelationships, femaleRelationships } from "@/constants";
import { cn } from "@/lib/utils";
import type { WarishDetailType } from "@/types/warish";
import type {
  FamilyRelationship,
  Gender,
  LivingStatus,
  MaritialStatus,
} from "@prisma/client";
import {
  createWarishDetail,
  deleteWarishDetail,
  updateWarishDetail,
} from "./actions";

interface WarishDetailRowProps {
  detail: WarishDetailType;
  level?: number;
  index?: number;
  parentIndex?: string;
  warishApplicationId: string;
}

const getSerialNumber = (depth: number, index: number): string => {
  if (depth === 0) return `${index + 1}`;
  if (depth === 1) return String.fromCharCode(65 + index);
  return String.fromCharCode(97 + index);
};

function WarishDetailRow({
  detail,
  level = 0,
  index = 0,
  parentIndex = "",
  warishApplicationId,
}: WarishDetailRowProps) {
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [showAddButton, setShowAddButton] = useState(false);
  const currentIndex = parentIndex
    ? `${parentIndex}.${getSerialNumber(level, index)}`
    : getSerialNumber(level, index);

  // Form state
  const [formData, setFormData] = useState({
    id: detail.id,
    name: detail.name,
    gender: detail.gender,
    relation: detail.relation,
    livingStatus: detail.livingStatus,
    maritialStatus: detail.maritialStatus,
    hasbandName: detail.hasbandName || "",
  });

  // New entry state
  const [newEntry, setNewEntry] = useState({
    name: "",
    gender: "male" as Gender,
    relation: "Son" as FamilyRelationship,
    livingStatus: "alive" as LivingStatus,
    maritialStatus: "unmarried" as MaritialStatus,
    hasbandName: "",
  });

  // Status states
  const [deleteState, setDeleteState] = useState({
    loading: false,
    error: "",
  });
  const [saveState, setSaveState] = useState({
    loading: false,
    error: "",
  });

  // Add effect to handle status change
  useEffect(() => {
    if (formData.livingStatus === "dead") {
      setShowAddButton(true);
    } else {
      setShowAddButton(false);
    }
  }, [formData.livingStatus]);

  // Manual save handler
  const handleSave = async () => {
    setSaveState({ loading: true, error: "" });
    try {
      // Validate required fields before sending
      if (
        !formData.name ||
        !formData.gender ||
        !formData.relation ||
        !formData.livingStatus ||
        !formData.maritialStatus
      ) {
        throw new Error("All required fields must be filled");
      }

      const form = new FormData();
      // Only append necessary fields
      form.append("id", formData.id);
      form.append("name", formData.name);
      form.append("gender", formData.gender);
      form.append("relation", formData.relation);
      form.append("livingStatus", formData.livingStatus);
      form.append("maritialStatus", formData.maritialStatus);
      form.append("hasbandName", formData.hasbandName);

      const result = await updateWarishDetail(form);
      if (!result.success) throw new Error(result.message);

      setSaveState({ loading: false, error: "" });

      toast({
        title: "Success",
        description: "Changes saved successfully",
      });
    } catch (error: any) {
      setSaveState({ loading: false, error: error.message });

      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Enhanced handleChange with validation
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Basic input validation
    if (name === "name" && value.length > 100) {
      setSaveState({
        loading: false,
        error: "Name cannot exceed 100 characters",
      });
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Enhanced delete handler with confirmation
  const handleDelete = async () => {
    if (
      !window.confirm(
        "Are you sure you want to permanently delete this record?"
      )
    )
      return;

    setDeleteState({ loading: true, error: "" });
    try {
      const result = await deleteWarishDetail(detail.id);

      if (!result.success) {
        throw new Error(result.message || "Failed to delete record");
      }

      toast({
        title: "Success",
        description: "Record deleted successfully",
      });

      // Refresh data without full page reload
      router.refresh();
    } catch (error: any) {
      setDeleteState({
        loading: false,
        error: error.message || "An error occurred during deletion",
      });
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Handle adding child
  const handleAddChild = async () => {
    try {
      const form = new FormData();
      form.append("name", newEntry.name);
      form.append("gender", newEntry.gender);
      form.append("relation", newEntry.relation);
      form.append("livingStatus", newEntry.livingStatus);
      form.append("maritialStatus", newEntry.maritialStatus);
      form.append("hasbandName", newEntry.hasbandName);
      form.append("parentId", detail.id);
      form.append("warishApplicationId", warishApplicationId);

      const result = await createWarishDetail(form);
      if (!result.success) throw new Error(result.message);

      setIsAddModalOpen(false);
      setNewEntry({
        name: "",
        gender: "male",
        relation: "Son",
        livingStatus: "alive",
        maritialStatus: "unmarried",
        hasbandName: "",
      });
      window.location.reload();
    } catch (error: any) {
      console.error("Failed to add child:", error);
    }
  };

  return (
    <>
      <TableRow
        className={cn(
          level > 0 && "bg-muted/20",
          "hover:bg-muted/10 transition-colors"
        )}
      >
        {/* Serial Number */}
        <TableCell
          className="sticky left-0 z-10 bg-inherit"
          style={{ paddingLeft: `${8 + level * 16}px` }}
        >
          <div className="flex items-center gap-1">
            {detail.livingStatus === "dead" && detail.children?.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="p-0 h-6 w-6 text-primary hover:bg-primary/10"
                onClick={() => setIsExpanded(!isExpanded)}
                aria-label={isExpanded ? "Collapse" : "Expand"}
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            )}
            <span className="text-sm font-medium">{currentIndex}</span>
          </div>
        </TableCell>

        {/* Name */}
        <TableCell>
          <Input
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={cn(
              "min-w-[120px] h-8 text-sm border-l-4",
              level === 0
                ? "border-l-primary"
                : `border-l-primary-${level + 1}00`
            )}
          />
        </TableCell>

        {/* Gender */}
        <TableCell>
          <Select
            value={formData.gender}
            onValueChange={(value) =>
              setFormData((prev) => ({
                ...prev,
                gender: value as Gender,
              }))
            }
          >
            <SelectTrigger className="h-8 text-sm">
              <SelectValue placeholder="Select Gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
            </SelectContent>
          </Select>
        </TableCell>

        {/* Marital Status */}
        <TableCell>
          <Select
            value={formData.maritialStatus}
            onValueChange={(value) =>
              setFormData((prev) => ({
                ...prev,
                maritialStatus: value as MaritialStatus,
              }))
            }
          >
            <SelectTrigger className="h-8 text-sm">
              <SelectValue placeholder="Marital Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="married">Married</SelectItem>
              <SelectItem value="unmarried">Unmarried</SelectItem>
              <SelectItem value="divorced">Divorced</SelectItem>
              <SelectItem value="widowed">Widowed</SelectItem>
            </SelectContent>
          </Select>
        </TableCell>

        {/* Relation */}
        <TableCell>
          <Select
            value={formData.relation}
            onValueChange={(value) =>
              setFormData((prev) => ({
                ...prev,
                relation: value as FamilyRelationship,
              }))
            }
          >
            <SelectTrigger className="h-8 text-sm">
              <SelectValue placeholder="Relation" />
            </SelectTrigger>
            <SelectContent>
              {formData.gender === "female"
                ? femaleRelationships.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))
                : maleRelationships.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
            </SelectContent>
          </Select>
        </TableCell>

        {/* Living Status */}
        <TableCell>
          <Select
            value={formData.livingStatus}
            onValueChange={(value) =>
              setFormData((prev) => ({
                ...prev,
                livingStatus: value as LivingStatus,
              }))
            }
          >
            <SelectTrigger className="h-8 text-sm">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="alive">Alive</SelectItem>
              <SelectItem value="dead">Dead</SelectItem>
            </SelectContent>
          </Select>
        </TableCell>

        {/* Actions */}
        <TableCell>
          <div className="flex gap-2">
            <Button
              onClick={handleSave}
              variant="outline"
              size="sm"
              className="h-8 text-sm"
              disabled={saveState.loading}
            >
              {saveState.loading ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-1" />
              )}
              Save
            </Button>

            <Button
              variant="destructive"
              size="sm"
              className="h-8 text-sm"
              onClick={handleDelete}
              disabled={deleteState.loading}
            >
              {deleteState.loading ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4 mr-1" />
              )}
              Delete
            </Button>

            {showAddButton && (
              <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 text-sm">
                    <PlusCircle className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader className="space-y-1">
                    <DialogTitle className="text-2xl font-semibold tracking-tight">
                      Add New Member
                    </DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-6 py-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium flex items-center gap-1">
                          Name
                          <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          value={newEntry.name}
                          onChange={(e) =>
                            setNewEntry((prev) => ({
                              ...prev,
                              name: e.target.value,
                            }))
                          }
                          placeholder="Enter member name"
                          className="h-9 transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium flex items-center gap-1">
                          Gender
                          <span className="text-red-500">*</span>
                        </Label>
                        <Select
                          value={newEntry.gender}
                          onValueChange={(value) =>
                            setNewEntry((prev) => ({
                              ...prev,
                              gender: value as Gender,
                            }))
                          }
                        >
                          <SelectTrigger className="h-9 transition-colors focus:border-primary focus:ring-1 focus:ring-primary">
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium flex items-center gap-1">
                          Living Status
                          <span className="text-red-500">*</span>
                        </Label>
                        <Select
                          value={newEntry.livingStatus}
                          onValueChange={(value) =>
                            setNewEntry((prev) => ({
                              ...prev,
                              livingStatus: value as LivingStatus,
                            }))
                          }
                        >
                          <SelectTrigger className="h-9 transition-colors focus:border-primary focus:ring-1 focus:ring-primary">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="alive">Alive</SelectItem>
                            <SelectItem value="dead">Dead</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium flex items-center gap-1">
                          Marital Status
                          <span className="text-red-500">*</span>
                        </Label>
                        <Select
                          value={newEntry.maritialStatus}
                          onValueChange={(value) =>
                            setNewEntry((prev) => ({
                              ...prev,
                              maritialStatus: value as MaritialStatus,
                            }))
                          }
                        >
                          <SelectTrigger className="h-9 transition-colors focus:border-primary focus:ring-1 focus:ring-primary">
                            <SelectValue placeholder="Select marital status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="married">Married</SelectItem>
                            <SelectItem value="unmarried">Unmarried</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {newEntry.gender === "female" &&
                      newEntry.maritialStatus === "married" && (
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">
                            Husband Name
                          </Label>
                          <Input
                            value={newEntry.hasbandName}
                            onChange={(e) =>
                              setNewEntry((prev) => ({
                                ...prev,
                                hasbandName: e.target.value,
                              }))
                            }
                            placeholder="Enter husband's name"
                            className="h-9 transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
                          />
                        </div>
                      )}
                  </div>
                  <DialogFooter className="gap-2 sm:gap-0">
                    <Button
                      variant="outline"
                      onClick={() => setIsAddModalOpen(false)}
                      className="h-9 hover:bg-muted/50 transition-colors"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleAddChild}
                      className="h-9 bg-primary hover:bg-primary/90 transition-colors"
                    >
                      Add Member
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
          {(saveState.error || deleteState.error) && (
            <div className="mt-1 text-xs text-red-500">
              {saveState.error || deleteState.error}
            </div>
          )}
        </TableCell>
      </TableRow>

      {/* Husband Name Row */}
      {formData.gender === "female" &&
        formData.maritialStatus === "married" && (
          <TableRow>
            <TableCell colSpan={7} className="bg-muted/10 p-2">
              <div className="flex items-center gap-4 px-4 py-2">
                <Label className="text-sm font-medium min-w-[120px]">
                  Husband Name
                </Label>
                <Input
                  name="hasbandName"
                  value={formData.hasbandName}
                  onChange={handleChange}
                  className="max-w-md"
                />
              </div>
            </TableCell>
          </TableRow>
        )}

      {/* Nested Children */}
      {isExpanded && detail.children && detail.children.length > 0 && (
        <>
          {detail.children.map((child, childIndex) => (
            <WarishDetailRow
              key={child.id}
              detail={child}
              level={level + 1}
              index={childIndex}
              parentIndex={currentIndex}
              warishApplicationId={warishApplicationId}
            />
          ))}
        </>
      )}
    </>
  );
}

export { WarishDetailRow };
