"use client";

import { useMemo, memo, useState, useEffect } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
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
import { useForm } from "react-hook-form";
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
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workId: string | null;
}) {
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
            <AOCForm
              {...data}
              workId={workId!}
              onOpenChange={onOpenChange}
            />
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
}: any) {
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const sortedBids = useMemo(() => {
    if (!acceptbi?.length) return [];
    return acceptbi
      .filter((b: any) => b.biddingAmount != null)
      .sort((a: any, b: any) => a.biddingAmount - b.biddingAmount);
  }, [acceptbi]);

  const form = useForm({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      acceptbidderId: "",
      memono: "",
      memodate: "",
    },
  });

  useEffect(() => {
    if (sortedBids.length) {
      form.setValue("acceptbidderId", sortedBids[0].id);
    }
  }, [sortedBids, form]);

  /* ===============================
     MUTATION (FIXED)
  =================================*/

  const mutation = useMutation({
    mutationFn: async (values: any) => {
      const formData = new FormData();
      formData.append("workId", workId);
      formData.append("acceptbidderId", values.acceptbidderId);
      formData.append("memono", values.memono);
      formData.append("memodate", values.memodate);

      return addAoCdetails(formData);
    },

    onSuccess: (result) => {
      if (!result || result.error) {
        toast({
          title: "Error",
          description: result?.error || "Something went wrong",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "AOC Finalized Successfully",
      });

      // ✅ CLOSE FIRST (IMPORTANT FIX)
      onOpenChange(false);

      // ✅ DELAY REFRESH (PREVENT REOPEN BUG)
      setTimeout(() => {
        queryClient.invalidateQueries({
          queryKey: ["workOrderAOC", workId],
        });
        router.refresh();
      }, 150);
    },

    onError: () => {
      toast({
        title: "Error",
        description: "Unexpected error occurred",
        variant: "destructive",
      });
    },
  });

  /* ===============================
     SUBMIT
  =================================*/

  const handleSubmit = (values: any) => {
    if (!sortedBids.length) {
      toast({
        title: "Validation Error",
        description: "No bidders available",
        variant: "destructive",
      });
      return;
    }

    const selectedBid = sortedBids.find(
      (b: any) => b.id === values.acceptbidderId
    );

    if (!selectedBid) return;

    if (selectedBid.id !== sortedBids[0]?.id) {
      if (!confirm("Selected bidder is NOT L1. Continue?")) return;
    }

    if (!confirm("Please confirm before finalizing AOC")) return;

    mutation.mutate(values);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-8"
      >
        <WorkDetailsCard worksDetail={worksDetail} />

        <Separator />

        <div className="space-y-4">
          {sortedBids.map((bid: any, index: number) => (
            <BidItem
              key={bid.id}
              item={bid}
              rank={index + 1}
              isSelected={form.watch("acceptbidderId") === bid.id}
              onSelect={() =>
                form.setValue("acceptbidderId", bid.id)
              }
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
            disabled={!form.formState.isValid || mutation.isPending}
            className="bg-blue-700 text-white"
          >
            {mutation.isPending ? "Processing..." : "Finalize AOC"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

/* ===============================
   MEMO DETAILS
=================================*/

function MemoDetailsCard({ form, lastAoc }: any) {
  return (
    <Card>
      <CardContent className="p-6 space-y-6">
        {lastAoc && (
          <div className="bg-blue-50 border rounded-lg p-4">
            <p className="font-bold">
              Memo No: {lastAoc.workodermenonumber}
            </p>
            <p className="text-sm">
              {format(
                new Date(lastAoc.workordeermemodate),
                "dd/MM/yyyy"
              )}
            </p>
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

function WorkDetailsCard({ worksDetail }: any) {
  const memoNo = worksDetail?.nitDetails?.memoNumber || "-";
  const year = worksDetail?.nitDetails?.memoDate
    ? new Date(worksDetail.nitDetails.memoDate).getFullYear()
    : "";

  return (
    <Card>
      <CardContent className="p-6 space-y-2">
        <Badge>
          NIT No: {memoNo}/{gpcode}/{year}
        </Badge>
        <p className="font-semibold">
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
}: any) {
  return (
    <Card
      onClick={onSelect}
      className={`cursor-pointer p-4 ${
        isSelected ? "border-blue-600 bg-blue-50" : ""
      }`}
    >
      <div className="flex justify-between">
        <div>
          <p className="font-semibold">{item.agencydetails.name}</p>
          <p className="text-sm">Rank: L{rank}</p>
        </div>
        <p className="font-semibold">
          ₹ {item.biddingAmount?.toLocaleString("en-IN")}
        </p>
      </div>
    </Card>
  );
});
