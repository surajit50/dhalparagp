import Link from "next/link";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { formatDateTime } from "@/utils/utils";
import { Badge } from "@/components/ui/badge";
import { gpcode } from "@/constants/gpinfor";
interface NitItem {
  memoNumber: number;
  memoDate: string | null;
  technicalBidOpeningDate: string | null;
  financialBidOpeningDate: string | null;
}

interface Worklist {
  id: string;
  ApprovedActionPlanDetails: {
    activityDescription: string | null;
  };
}

interface NitTableRowProps {
  item: NitItem;
  worklist: Worklist;
}

export default function NitTableRow({ item, worklist }: NitTableRowProps) {
  const formatDate = (date: string | null) => {
    return date ? formatDateTime(date).dateOnly : "N/A";
  };

  return (
    <TableRow className="hover:bg-muted/50 transition-colors">
      <TableCell className="font-medium">
        {typeof item.memoNumber === "number"
          ? `${item.memoNumber}/${gpcode}/2024`
          : "N/A"}
      </TableCell>
      <TableCell className="max-w-xs">
        <p
          className="truncate"
          title={
            worklist.ApprovedActionPlanDetails.activityDescription || "N/A"
          }
        >
          {worklist.ApprovedActionPlanDetails.activityDescription || "N/A"}
        </p>
      </TableCell>
      <TableCell>{formatDate(item.memoDate)}</TableCell>
      <TableCell>{formatDate(item.technicalBidOpeningDate)}</TableCell>
      <TableCell>{formatDate(item.financialBidOpeningDate)}</TableCell>
      <TableCell>
        <Badge variant="default">In Progress</Badge>
      </TableCell>
      <TableCell className="text-right">
        <Link
          href={`/admindashboard/manage-tender/addbidderdetails/${worklist.id}`}
          passHref
        >
          <Button
            size="sm"
            className="bg-primary hover:bg-primary/90 text-primary-foreground transition-colors"
          >
            Add Bidder Details
          </Button>
        </Link>
      </TableCell>
    </TableRow>
  );
}
