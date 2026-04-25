import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Hash,
  BookOpen,
  Calendar,
  User,
  CheckCircle,
  Save,
  Edit2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { MBFormData } from "./types";

interface MBMetadataProps {
  formData: MBFormData;
  setFormData: React.Dispatch<React.SetStateAction<MBFormData>>;
  selectedWorkId: string;
  onConfirm: () => void;
  isConfirmed: boolean;
}

export const MBMetadata: React.FC<MBMetadataProps> = ({
  formData,
  setFormData,
  selectedWorkId,
  onConfirm,
  isConfirmed,
}) => {
  return (
    <AnimatePresence>
      {selectedWorkId && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card
            className={`border-slate-200 shadow-sm hover:shadow-md transition-all bg-white rounded-xl ${isConfirmed ? "border-l-4 border-l-green-500" : ""}`}
          >
            <CardHeader className="pb-4 border-b border-slate-50">
              <CardTitle className="flex items-center gap-3">
                <div
                  className={`p-2.5 rounded-xl ${isConfirmed ? "bg-green-100/80 text-green-600" : "bg-blue-50 text-blue-600"}`}
                >
                  {isConfirmed ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <Hash className="h-5 w-5" />
                  )}
                </div>
                <div className="flex-1">
                  <span className="text-xl font-bold text-slate-800">MB Details</span>
                  <CardDescription className="mt-1 text-slate-500">
                    {isConfirmed
                      ? "Details saved. You can now add measurements."
                      : "Configure measurement book parameters to proceed"}
                  </CardDescription>
                </div>
                {isConfirmed && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onConfirm}
                    className="text-wb-primary hover:text-wb-primary hover:bg-wb-primary/10"
                  >
                    <Edit2 className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 pt-5">
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                      <Hash className="h-3 w-3" />
                      MB Number
                      <span className="text-red-500 font-bold">*</span>
                    </Label>
                    <Input
                      value={formData.mbNumber}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          mbNumber: e.target.value,
                        })
                      }
                      placeholder="MB-001"
                      className="bg-white focus-visible:ring-blue-500 transition-shadow h-10 shadow-sm"
                      disabled={isConfirmed}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                      <BookOpen className="h-3 w-3" />
                      Page Number
                      <span className="text-red-500 font-bold">*</span>
                    </Label>
                    <Input
                      value={formData.mbPageNumber}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          mbPageNumber: e.target.value,
                        })
                      }
                      placeholder="P-01"
                      className="bg-white focus-visible:ring-blue-500 transition-shadow h-10 shadow-sm"
                      disabled={isConfirmed}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar className="h-3 w-3" />
                    Measurement Date
                  </Label>
                  <Input
                    type="date"
                    value={formData.measuredDate}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        measuredDate: e.target.value,
                      })
                    }
                    className="bg-white focus-visible:ring-blue-500 transition-shadow h-10 shadow-sm"
                    disabled={isConfirmed}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <User className="h-3 w-3" />
                    Measured By
                    <span className="text-red-500 font-bold">*</span>
                  </Label>
                  <Input
                    value={formData.measuredBy}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        measuredBy: e.target.value,
                      })
                    }
                    placeholder="Enter name"
                    className="bg-white focus-visible:ring-blue-500 transition-shadow h-10 shadow-sm"
                    disabled={isConfirmed}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle className="h-3 w-3" />
                    Checked By
                  </Label>
                  <Input
                    value={formData.checkedBy}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        checkedBy: e.target.value,
                      })
                    }
                    placeholder="Enter name"
                    className="bg-white focus-visible:ring-blue-500 transition-shadow h-10 shadow-sm"
                    disabled={isConfirmed}
                  />
                </div>

                {!isConfirmed && (
                  <Button
                    className="w-full mt-6 h-11 bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all font-semibold"
                    onClick={onConfirm}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save & Continue
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
