import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Building2, IndianRupee, Trophy, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface BidAgency {
  id: string;
  biddingAmount: number | null;
  agencydetails: {
    name: string;
  };
}

export function BidItem({
  item,
  getBidRank,
  getBadgeColor,
  isSelected,
}: {
  item: BidAgency;
  getBidRank: (bidId: string) => number;
  getBadgeColor: (rank: number) => string;
  isSelected: boolean;
}) {
  const rank = getBidRank(item.id);
  const badgeColor = getBadgeColor(rank);

  const isTopRank = rank === 1;

  return (
    <div
      className={cn(
        "relative flex items-center gap-5 p-6 rounded-2xl border bg-background transition-all duration-200",
        isSelected
          ? "ring-2 ring-primary shadow-md"
          : "hover:shadow-sm hover:border-primary/40",
        isTopRank && "border-emerald-400 bg-emerald-50/40"
      )}
    >
      {/* Checkbox */}
      <Checkbox
        id={`bid-${item.id}`}
        value={item.id}
        name="acceptbidderId"
        defaultChecked={isSelected}
        className="mt-1"
      />

      <Label
        htmlFor={`bid-${item.id}`}
        className="flex flex-1 items-center justify-between cursor-pointer"
      >
        {/* LEFT SECTION */}
        <div className="space-y-4">

          {/* Agency Name */}
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-muted">
              <Building2 className="w-5 h-5 text-muted-foreground" />
            </div>

            <div>
              <p className="font-semibold text-base">
                {item.agencydetails.name}
              </p>
              <p className="text-xs text-muted-foreground">
                Bidder ID: {item.id.slice(0, 8)}
              </p>
            </div>
          </div>

          {/* Rank + Status Badges */}
          <div className="flex items-center gap-3 flex-wrap">

            {/* Rank Badge */}
            {rank <= 3 && (
              <Badge
                className={cn(
                  "px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1",
                  badgeColor
                )}
              >
                <Trophy className="w-3.5 h-3.5" />
                {rank === 1
                  ? "L1 (Lowest)"
                  : rank === 2
                  ? "L2"
                  : "L3"}
              </Badge>
            )}

            {/* Selected Badge */}
            {isSelected && (
              <Badge className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Selected
              </Badge>
            )}
          </div>
        </div>

        {/* RIGHT SECTION - Amount */}
        <div
          className={cn(
            "flex items-center gap-2 px-4 py-3 rounded-xl font-semibold text-base",
            isTopRank
              ? "bg-emerald-100 text-emerald-700"
              : "bg-muted text-foreground"
          )}
        >
          <IndianRupee className="w-5 h-5" />
          {item.biddingAmount?.toLocaleString("en-IN", {
            maximumFractionDigits: 0,
          }) || "N/A"}
        </div>
      </Label>

      {/* Left rank stripe for L1 */}
      {isTopRank && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 rounded-l-2xl" />
      )}
    </div>
  );
}
