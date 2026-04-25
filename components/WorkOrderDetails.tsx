import { Label } from "@/components/ui/label";

interface WorksDetail {
  id: string;
  nitDetailsId: string | null;
  finalEstimateAmount: number | null;
  approvedActionPlanDetailsId: string | null;
}

export function WorkOrderDetails({
  worksDetail,
}: {
  worksDetail: WorksDetail | null;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4 bg-muted/30 rounded-lg border">
      <DetailItem 
        label="Tender Reference No"
        value={worksDetail?.nitDetailsId}
      />
      <DetailItem
        label="Estimated Amount"
        value={worksDetail?.finalEstimateAmount?.toLocaleString("en-IN", {
          style: "currency",
          currency: "INR",
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        })}
      />
      <DetailItem
        label="Work Order No"
        value={worksDetail?.approvedActionPlanDetailsId}
      />
      <DetailItem
        label="Work Name"
        value="Construction of Community Center" // Replace with actual data field
      />
    </div>
  );
}

function DetailItem({
  label,
  value,
}: {
  label: string;
  value: string | number | null | undefined;
}) {
  return (
    <div className="space-y-1 p-4 bg-background rounded-lg border shadow-sm">
      <Label className="text-sm font-medium uppercase text-muted-foreground tracking-wider">
        {label}
      </Label>
      <div className="text-xl font-semibold mt-1 text-primary">
        {value || <span className="text-muted-foreground/70">N/A</span>}
      </div>
    </div>
  );
}
