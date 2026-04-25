"use client";

import { useMemo, memo, useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircleIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { addAoCdetails } from "./aocServerAction";
import { useToast } from "@/components/ui/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, UseFormReturn } from "react-hook-form";
import * as z from "zod";
import { format } from "date-fns";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { gpcode } from "@/constants/gpinfor";

/* ===============================
   TYPES
=================================*/

interface AgencyDetails {
  name: string;
}

interface Bid {
  id: string;
  biddingAmount: number | null;
  agencydetails: AgencyDetails;
}

interface WorkDetails {
  nitDetails?: {
    memoNumber: string;
    memoDate: string;
  };
  ApprovedActionPlanDetails?: {
    activityDescription: string;
    activityCode: string;
    estimatedCost: number;
  };
}

interface LastAoc {
  workodermenonumber: string;
  workordeermemodate: string;
  WorksDetail: {
    workslno: number;
    ApprovedActionPlanDetails: {
      activityDescription: string;
    };
  }[];
}

interface AOCFormProps {
  worksDetail: WorkDetails;
  acceptbi: Bid[];
  workId: string;
  lastAoc?: LastAoc;
  onOpenChange: (open: boolean) => void;
}

interface WorkOrderAOCDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workId: string | null;
}

/* ===============================
   VALIDATION
=================================*/

const formSchema = z.object({
  acceptbidderId: z.string().min(1, "Select bidder"),
  memono: z.string().min(1, "Memo number required"),
  memodate: z.string().refine((val) => new Date(val) <= new Date(), {
    message: "Memo date cannot be future",
  }),
});

/* ===============================
   MAIN DIALOG
=================================*/

export default function WorkOrderAOCDialog({
  open,
  onOpenChange,
  workId,
}: WorkOrderAOCDialogProps) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["workOrderAOC", workId],
    enabled: open && !!workId,
    queryFn: async () => {
      const res = await fetch(`/api/workorder-aoc?workId=${workId}`);
      if (!res.ok) throw new Error("Failed to load");
      return res.json();
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-6xl max-h-[92vh] overflow-y-auto p-0 rounded-2xl">
        <div className="bg-blue-900 text-white px-6 py-4 rounded-t-2xl">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <CheckCircleIcon className="w-5 h-5" />
            Acceptance of Contract (AOC)
          </h2>
        </div>

        <div className="p-6 bg-slate-50">
          {isLoading && (
            <div className="text-center py-10 text-muted-foreground">
              Loading work details...
            </div>
          )}

          {error && <p className="text-red-500">Failed to load data</p>}

          {data && (
            <AOCForm {...data} workId={workId!} onOpenChange={onOpenChange} />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ===============================
   FORM
=================================*/

function AOCForm({
  worksDetail,
  acceptbi,
  workId,
  lastAoc,
  onOpenChange,
}: AOCFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  const sortedBids = useMemo(() => {
    if (!acceptbi?.length) return [];

    return acceptbi
      .filter((b) => b.biddingAmount != null)
      .sort((a, b) => a.biddingAmount! - b.biddingAmount!);
  }, [acceptbi]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      acceptbidderId: "",
      memono: "",
      memodate: "",
    },
  });

  const selectedBidderId = form.watch("acceptbidderId");

  useEffect(() => {
    if (sortedBids.length) {
      form.setValue("acceptbidderId", sortedBids[0].id);
    }
  }, [form, sortedBids]);

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    if (loading) return;

    if (!sortedBids.length) {
      toast({
        title: "Validation Error",
        description: "No bidders available",
        variant: "destructive",
      });
      return;
    }

    const selectedBid = sortedBids.find((b) => b.id === values.acceptbidderId);

    if (!selectedBid) return;

    if (selectedBid.id !== sortedBids[0]?.id) {
      if (!confirm("Selected bidder is NOT L1. Continue?")) return;
    }

    if (!confirm("Please confirm before finalizing AOC")) return;

    try {
      setLoading(true);

      const formData = new FormData();

      formData.append("workId", workId);
      formData.append("acceptbidderId", values.acceptbidderId);
      formData.append("memono", values.memono);
      formData.append("memodate", values.memodate);

      const result = await addAoCdetails(formData);

      if (result?.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "AOC Finalized Successfully",
      });

      queryClient.invalidateQueries({
        queryKey: ["workOrderAOC", workId],
      });

      router.refresh();

      onOpenChange(false);
    } catch {
      toast({
        title: "Unexpected Error",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <WorkDetailsCard worksDetail={worksDetail} />

        <Separator />

        <div className="space-y-4">
          {sortedBids.map((bid, index) => (
            <BidItem
              key={bid.id}
              item={bid}
              rank={index + 1}
              isSelected={selectedBidderId === bid.id}
              onSelect={() => form.setValue("acceptbidderId", bid.id)}
            />
          ))}
        </div>

        <MemoDetailsCard form={form} lastAoc={lastAoc} />

        <div className="flex justify-end gap-4">
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>

          <Button
            type="submit"
            disabled={!form.formState.isValid || loading}
            className="bg-blue-700 text-white"
          >
            {loading ? "Processing..." : "Finalize AOC"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

/* ===============================
   MEMO DETAILS
=================================*/

function MemoDetailsCard({
  form,
  lastAoc,
}: {
  form: UseFormReturn<z.infer<typeof formSchema>>;
  lastAoc?: LastAoc;
}) {
  return (
    <Card>
      <CardContent className="p-6 space-y-6">
        {lastAoc && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-blue-100 pb-2">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">
                  Last Saved Work Order
                </span>

                <span className="text-sm font-bold text-blue-900">
                  Memo No: {lastAoc.workodermenonumber}
                </span>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-blue-400 font-medium block uppercase tracking-widest">
                  Memo Date
                </span>

                <span className="text-xs font-semibold text-blue-700">
                  {format(new Date(lastAoc.workordeermemodate), "dd/MM/yyyy")}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="memono"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Memo Number</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="memodate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Memo Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
}

/* ===============================
   WORK DETAILS
=================================*/

function WorkDetailsCard({ worksDetail }: { worksDetail: WorkDetails }) {
  const nitMemoNumber = worksDetail?.nitDetails?.memoNumber || "-";

  const nitMemoYear = worksDetail?.nitDetails?.memoDate
    ? new Date(worksDetail.nitDetails.memoDate).getFullYear()
    : "";

  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        <Badge>
          NIT No: {nitMemoNumber}/{gpcode}/{nitMemoYear}
        </Badge>

        <p className="font-semibold text-lg">
          {worksDetail?.ApprovedActionPlanDetails?.activityDescription}
        </p>
      </CardContent>
    </Card>
  );
}

/* ===============================
   BID ITEM
=================================*/

const BidItem = memo(function BidItem({
  item,
  rank,
  isSelected,
  onSelect,
}: {
  item: Bid;
  rank: number;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <Card
      onClick={onSelect}
      className={`cursor-pointer border rounded-xl p-4 transition
      ${isSelected ? "border-blue-600 bg-blue-50" : "border-gray-200"}`}
    >
      <div className="flex justify-between items-center">
        <div>
          <p className="font-semibold">{item.agencydetails.name}</p>

          <p className="text-sm text-gray-500">Rank: L{rank}</p>
        </div>

        <p className="font-semibold text-lg">
          ₹ {item.biddingAmount?.toLocaleString("en-IN")}
        </p>
      </div>
    </Card>
  );
});

/* ===============================
   FINAL REVIEW
=================================*/

function FinalReviewCard({ form, sortedBids }: any) {
  const selected = sortedBids.find(
    (b: Bid) => b.id === form.watch("acceptbidderId"),
  );

  return (
    <Card className="border-green-300 bg-green-50">
      <CardContent className="p-4 text-sm space-y-2">
        <p className="font-semibold text-green-700">
          Final Review Before Submission
        </p>

        <p>Selected Bidder: {selected?.agencydetails.name || "-"}</p>

        <p>Memo No: {form.watch("memono") || "-"}</p>

        <p>Memo Date: {form.watch("memodate") || "-"}</p>

        <p className="text-red-600 text-xs">
          After finalization editing will be disabled.
        </p>
      </CardContent>
    </Card>
  );
}
