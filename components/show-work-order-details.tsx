
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  FileText,
  CalendarDays,
  Hash,
  ClipboardList,
  List,
} from "lucide-react";
import { formatDate } from "@/utils/utils";
import { gpcode } from "@/constants/gpinfor";
interface WorkOrderDetailsProps {
  workorderno: string;
  workorderdate?: Date;
  nitno?: string;
  workname?: string;
  slno?: string;
}

export const ShowWorkOrderDetails: React.FC<WorkOrderDetailsProps> = ({
  workorderno,
  workorderdate,
  nitno,
  workname,
  slno,
}) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="group bg-white shadow-sm border rounded-md px-3 py-2 hover:shadow-md transition-all duration-200 cursor-pointer hover:border-blue-400">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <FileText className="w-4 h-4 text-blue-500" />
              {workorderno}/{gpcode}/{workorderdate?.getFullYear() || "N/A"}
            </div>
            <div className="text-xs text-gray-500">
              {workorderdate ? formatDate(workorderdate) : "N/A"}
            </div>
          </div>
        </div>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <div className="flex items-center justify-center gap-2 mb-6 pb-4 border-b">
            <FileText className="w-5 h-5 text-blue-500" />
            <DialogTitle className="text-xl font-semibold text-gray-900">
              Work Order Details
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          <div className="bg-gray-50/70 p-5 rounded-xl border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <Hash className="w-4 h-4 text-blue-500" />
              <h4 className="font-semibold text-gray-800">Work Order Info</h4>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-gray-500">Order Number</p>
                <p className="font-medium text-gray-800">
                  {workorderno}/{gpcode}/{workorderdate?.getFullYear() || "N/A"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-500">Order Date</p>
                <p className="font-medium text-gray-800">
                  {workorderdate ? formatDate(workorderdate) : "N/A"}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50/70 p-5 rounded-xl border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <ClipboardList className="w-4 h-4 text-blue-500" />
              <h4 className="font-semibold text-gray-800">
                Additional Details
              </h4>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">NIT Number</p>
                  <p className="font-medium text-gray-800">{nitno || "N/A"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Serial Number</p>
                  <p className="font-medium text-gray-800">{slno || "N/A"}</p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-500">Work Description</p>
                <p className="font-medium text-gray-800 line-clamp-2">
                  {workname || "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
