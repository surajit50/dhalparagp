"use client";

import Link from "next/link";
import { Trash2, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useToast } from "@/components/ui/use-toast";
import { useTransition, useState, useCallback, memo, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";

type TenderStatus =
  | "publish"
  | "published"
  | "ToBeOpened"
  | "TechnicalBidOpening"
  | "TechnicalEvaluation"
  | "FinancialBidOpening"
  | "FinancialEvaluation"
  | "AOC"
  | "Retender"
  | "Cancelled";

interface WorkDetailsListProps {
  workDetails: {
    id: string;
    WorksDetail: Array<{
      id: string;
      finalEstimateAmount: number;
      estimateValue?: number;
      participationFee: number;
      earnestMoneyFee: number;
      tenderStatus: TenderStatus;
      ApprovedActionPlanDetails: {
        id: string;
        financialYear: string;
        themeName: string;
        activityCode: string;
        activityName: string;
        activityDescription: string;
        activityFor: string;
        sector: string;
        isPublish: boolean;
        estimatedCost: number;
      };
    }>;
  };
}

// 辅助函数：获取招标状态显示名称
const getTenderStatusDisplayName = (status: TenderStatus): string => {
  const statusMap: Record<TenderStatus, string> = {
    publish: "Publish",
    published: "Published",
    ToBeOpened: "To Be Opened",
    TechnicalBidOpening: "Technical Bid Opening",
    TechnicalEvaluation: "Technical Evaluation",
    FinancialBidOpening: "Financial Bid Opening",
    FinancialEvaluation: "Financial Evaluation",
    AOC: "AOC",
    Retender: "Retender",
    Cancelled: "Cancelled",
  };
  return statusMap[status] || status;
};

// 辅助函数：根据招标状态获取徽章样式变体
const getTenderStatusVariant = (status: TenderStatus) => {
  switch (status) {
    case "published":
    case "publish":
      return "default";
    case "ToBeOpened":
    case "TechnicalBidOpening":
    case "TechnicalEvaluation":
    case "FinancialBidOpening":
    case "FinancialEvaluation":
      return "outline";
    case "AOC":
      return "secondary";
    case "Retender":
    case "Cancelled":
      return "destructive";
    default:
      return "outline";
  }
};

// 辅助函数：获取招标状态描述
const getTenderStatusDescription = (status: TenderStatus): string => {
  const descriptions: Record<TenderStatus, string> = {
    publish: "Tender is ready to be published",
    published: "Tender has been published",
    ToBeOpened: "Tender is scheduled to be opened",
    TechnicalBidOpening: "Technical bids are being opened",
    TechnicalEvaluation: "Technical evaluation in progress",
    FinancialBidOpening: "Financial bids are being opened",
    FinancialEvaluation: "Financial evaluation in progress",
    AOC: "Award of Contract",
    Retender: "Tender is being re-tendered",
    Cancelled: "Tender has been cancelled",
  };
  return descriptions[status] || "";
};

const WorkDetailItem = memo(
  ({
    item,
    index,
    onEdit,
    onDelete,
    isPending,
  }: {
    item: WorkDetailsListProps["workDetails"]["WorksDetail"][0];
    index: number;
    onEdit: (
      item: WorkDetailsListProps["workDetails"]["WorksDetail"][0],
    ) => void;
    onDelete: (id: string) => void;
    isPending: boolean;
  }) => {
    // 如果没有提供estimateValue，使用finalEstimateAmount
    const estimateValue = item.estimateValue || item.finalEstimateAmount;

    return (
      <AccordionItem value={item.id} className="border rounded-lg mb-4">
        <AccordionTrigger className="hover:no-underline px-4 hover:bg-gray-50 rounded-t-lg">
          <div className="flex items-center gap-4 w-full">
            <Badge
              variant="secondary"
              className="w-8 h-8 rounded-full flex items-center justify-center"
            >
              {index + 1}
            </Badge>
            <div className="flex-1 text-left">
              <div className="flex flex-wrap gap-2 items-center">
                <p className="font-medium min-w-[180px]">
                  Activity Code: {item.ApprovedActionPlanDetails.activityCode}
                </p>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={getTenderStatusVariant(item.tenderStatus)}
                    className="capitalize"
                  >
                    {getTenderStatusDisplayName(item.tenderStatus)}
                  </Badge>
                </div>
                <p>
                  Estimate Cost: ₹{item.finalEstimateAmount.toLocaleString()}
                </p>
                {/* 显示估算值 */}
                <p className="text-sm text-gray-600">
                  Est. Value: ₹{estimateValue.toLocaleString()}
                </p>
              </div>
              <p className="text-sm text-gray-500 truncate">
                {item.ApprovedActionPlanDetails.activityName}
              </p>
            </div>
            <ChevronRight className="h-4 w-4 shrink-0 transition-transform duration-200" />
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-4 bg-gray-50 rounded-b-lg">
          <div className="pl-12 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DetailItem
                label="Theme"
                value={item.ApprovedActionPlanDetails.themeName}
              />
              <DetailItem
                label="Financial Year"
                value={item.ApprovedActionPlanDetails.financialYear}
              />
              <DetailItem
                label="Tender Form Fee"
                value={`₹${item.participationFee.toLocaleString()}`}
              />
              <DetailItem
                label="Estimated Cost"
                value={`₹${item.finalEstimateAmount.toLocaleString()}`}
              />
              {/* 添加估算值显示 */}
              <DetailItem
                label="Estimate Value"
                value={`₹${estimateValue.toLocaleString()}`}
              />
              {/* 添加招标状态显示 */}
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Tender Status
                </p>
                <div className="flex flex-col gap-1 mt-1">
                  <Badge
                    variant={getTenderStatusVariant(item.tenderStatus)}
                    className="capitalize w-fit"
                  >
                    {getTenderStatusDisplayName(item.tenderStatus)}
                  </Badge>
                  <p className="text-xs text-gray-500">
                    {getTenderStatusDescription(item.tenderStatus)}
                  </p>
                </div>
              </div>
              {/* 添加保证金费用显示 */}
              {item.earnestMoneyFee > 0 && (
                <DetailItem
                  label="Earnest Money Fee"
                  value={`₹${item.earnestMoneyFee.toLocaleString()}`}
                />
              )}
            </div>
            <DetailItem
              label="Description"
              value={item.ApprovedActionPlanDetails.activityDescription}
              fullWidth
            />
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-gray-600">
                Publication Status
              </p>
              <Badge
                variant={
                  item.ApprovedActionPlanDetails.isPublish
                    ? "default"
                    : "destructive"
                }
              >
                {item.ApprovedActionPlanDetails.isPublish
                  ? "Published"
                  : "Not Published"}
              </Badge>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onEdit(item)}
              disabled={isPending}
            >
              Update
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => onDelete(item.id)}
              disabled={isPending}
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Delete
            </Button>
          </div>
        </AccordionContent>
      </AccordionItem>
    );
  },
);
WorkDetailItem.displayName = "WorkDetailItem";

const DetailItem = ({
  label,
  value,
  fullWidth = false,
}: {
  label: string;
  value: string | number;
  fullWidth?: boolean;
}) => (
  <div className={fullWidth ? "col-span-2" : ""}>
    <p className="text-sm font-medium text-gray-600">{label}</p>
    <p className={typeof value === "string" ? "text-gray-700" : "font-medium"}>
      {value}
    </p>
  </div>
);

function WorkDetailsList({ workDetails }: WorkDetailsListProps) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [editWork, setEditWork] = useState<
    null | (typeof workDetails.WorksDetail)[0]
  >(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFields, setEditFields] = useState({
    finalEstimateAmount: "",
    participationFee: "",
    estimateValue: "",
  });

  const router = useRouter();
  const allWorkPublished = workDetails.WorksDetail.every(
    (work) => work.ApprovedActionPlanDetails.isPublish,
  );

  // 计算总估算金额
  const totalEstimatedAmount = workDetails.WorksDetail.reduce(
    (sum, item) => sum + item.finalEstimateAmount,
    0,
  );

  // 计算总估算值（如果可用则使用estimateValue，否则使用finalEstimateAmount）
  const totalEstimateValue = workDetails.WorksDetail.reduce(
    (sum, item) => sum + (item.estimateValue || item.finalEstimateAmount),
    0,
  );

  const handleDeleteAll = useCallback(async () => {
    startTransition(async () => {
      try {
        const res = await fetch("/api/works/delete-by-nit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nitId: workDetails.id }),
        });
        const data = await res.json();

        if (res.ok) {
          toast({
            title: "All works deleted",
            description: `${data.count} works were deleted.`,
          });
          router.refresh();
        } else {
          throw new Error(data.error || "Failed to delete works");
        }
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      }
    });
  }, [workDetails.id, toast, router]);

  const handleDelete = useCallback(
    async (id: string) => {
      startTransition(async () => {
        try {
          const res = await fetch(`/api/works/${id}`, { method: "DELETE" });
          const data = await res.json();

          if (res.ok) {
            toast({
              title: "Work deleted",
              description: `Work was deleted successfully.`,
            });
            router.refresh();
          } else {
            throw new Error(data.error || "Failed to delete work");
          }
        } catch (error: any) {
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive",
          });
        }
      });
    },
    [toast, router],
  );

  const handleEdit = useCallback(
    (item: (typeof workDetails.WorksDetail)[0]) => {
      setEditWork(item);
      setEditFields({
        finalEstimateAmount: item.finalEstimateAmount.toString(),
        participationFee: item.participationFee.toString(),

        estimateValue: (
          item.estimateValue || item.finalEstimateAmount
        ).toString(),
      });
      setShowEditModal(true);
    },
    [workDetails],
  );

  // 当表单中的finalEstimateAmount更改时自动更新estimateValue
  useEffect(() => {
    if (showEditModal) {
      const finalEstimateAmount = Number(editFields.finalEstimateAmount) || 0;
      setEditFields((prev) => ({
        ...prev,
        estimateValue: finalEstimateAmount.toString(),
      }));
    }
  }, [editFields.finalEstimateAmount, showEditModal]);

  const handleEditSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!editWork) return;

      startTransition(async () => {
        try {
          const res = await fetch(`/api/works/${editWork.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              finalEstimateAmount: Number(editFields.finalEstimateAmount),
              participationFee: Number(editFields.participationFee),
              estimateValue: Number(editFields.estimateValue), // 发送estimateValue
            }),
          });
          const data = await res.json();

          if (res.ok) {
            toast({
              title: "Work updated",
              description: `Work details updated successfully.`,
            });
            setShowEditModal(false);
            setEditWork(null);
            router.refresh();
          } else {
            throw new Error(data.error || "Failed to update work");
          }
        } catch (error: any) {
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive",
          });
        }
      });
    },
    [editWork, editFields, toast, router],
  );

  const closeEditModal = useCallback(() => {
    setShowEditModal(false);
    setEditWork(null);
  }, []);

  if (workDetails.WorksDetail.length === 0) {
    return (
      <Card className="w-full max-w-3xl mx-auto">
        <CardContent className="flex items-center justify-center h-32">
          <p className="text-gray-500">No work details found.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardContent className="py-6">
        {/* 显示两个总计 */}
        <div className="mb-6 space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-blue-800">
                Total Estimated Amount
              </h3>
              <p className="text-2xl font-bold text-blue-900">
                ₹{totalEstimatedAmount.toLocaleString()}
              </p>
            </div>
            <p className="text-sm text-blue-600 mt-1">
              Based on {workDetails.WorksDetail.length} work items
            </p>
          </div>

          <div className="p-4 bg-green-50 rounded-lg border border-green-100">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-green-800">
                Total Estimate Value
              </h3>
              <p className="text-2xl font-bold text-green-900">
                ₹{totalEstimateValue.toLocaleString()}
              </p>
            </div>
            <p className="text-sm text-green-600 mt-1">
              Auto-calculated from final estimate amounts
            </p>
          </div>
        </div>

        <Accordion type="single" collapsible className="w-full">
          {workDetails.WorksDetail.map((item, index) => (
            <WorkDetailItem
              key={item.id}
              item={item}
              index={index}
              onEdit={handleEdit}
              onDelete={handleDelete}
              isPending={isPending}
            />
          ))}
        </Accordion>
      </CardContent>

      {allWorkPublished && (
        <CardFooter className="flex justify-end p-4 border-t">
          <Button
            variant="destructive"
            onClick={handleDeleteAll}
            disabled={isPending}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            {isPending ? "Deleting..." : "Delete All"}
          </Button>
        </CardFooter>
      )}

      <EditWorkModal
        open={showEditModal}
        onClose={closeEditModal}
        editFields={editFields}
        setEditFields={setEditFields}
        onSubmit={handleEditSubmit}
        isPending={isPending}
        tenderStatus={editWork?.tenderStatus}
      />
    </Card>
  );
}

const EditWorkModal = memo(
  ({
    open,
    onClose,
    editFields,
    setEditFields,
    onSubmit,
    isPending,
    tenderStatus,
  }: {
    open: boolean;
    onClose: () => void;
    editFields: {
      finalEstimateAmount: string;
      participationFee: string;
      estimateValue: string;
    };
    setEditFields: React.Dispatch<
      React.SetStateAction<{
        finalEstimateAmount: string;
        participationFee: string;
        estimateValue: string;
      }>
    >;
    onSubmit: (e: React.FormEvent) => void;
    isPending: boolean;
    tenderStatus?: TenderStatus;
  }) => (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Work Details</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4 mt-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Final Estimate Amount (₹)
            </label>
            <Input
              name="finalEstimateAmount"
              type="number"
              value={editFields.finalEstimateAmount}
              onChange={(e) =>
                setEditFields((prev) => ({
                  ...prev,
                  finalEstimateAmount: e.target.value,
                }))
              }
              required
              min="0"
              step="0.01"
            />
          </div>

          {/* 估算值字段（自动填充且只读） */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Estimate Value (₹){" "}
              <span className="text-xs text-gray-500">(auto-calculated)</span>
            </label>
            <Input
              name="estimateValue"
              type="number"
              value={editFields.estimateValue}
              readOnly
              className="bg-gray-50 cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 mt-1">
              This value is automatically set to match the Final Estimate Amount
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Participation Fee (₹)
            </label>
            <Input
              name="participationFee"
              type="number"
              value={editFields.participationFee}
              onChange={(e) =>
                setEditFields((prev) => ({
                  ...prev,
                  participationFee: e.target.value,
                }))
              }
              required
              min="0"
              step="0.01"
            />
          </div>

          {/* 显示招标状态（只读） */}
          {tenderStatus && (
            <div>
              <label className="block text-sm font-medium mb-1">
                Tender Status
              </label>
              <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-md">
                <Badge
                  variant={getTenderStatusVariant(tenderStatus)}
                  className="capitalize"
                >
                  {getTenderStatusDisplayName(tenderStatus)}
                </Badge>
                <span className="text-sm text-gray-600">
                  {getTenderStatusDescription(tenderStatus)}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Tender status cannot be changed here. Contact administrator for
                status updates.
              </p>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Updating..." : "Update"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  ),
);
EditWorkModal.displayName = "EditWorkModal";

export default memo(WorkDetailsList);
export type { TenderStatus };
