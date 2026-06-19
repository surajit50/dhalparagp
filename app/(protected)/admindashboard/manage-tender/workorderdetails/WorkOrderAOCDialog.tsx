"use client";

import { useMemo, memo, useState, useEffect } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircleIcon, CheckIcon, FileTextIcon, TrophyIcon, InfoIcon } from "lucide-react";
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
      <DialogContent className="w-full max-w-5xl max-h-[92vh] overflow-y-auto p-0 rounded-3xl shadow-2xl border-0">
        <div className="bg-gradient-to-br from-orange-600 via-orange-700 to-orange-900 text-white px-8 py-7 rounded-t-3xl shadow-md relative overflow-hidden">
          <div className="absolute top-0 right-0 opacity-10 pointer-events-none transform translate-x-1/4 -translate-y-1/4 mix-blend-overlay">
            <FileTextIcon className="w-64 h-64" />
          </div>
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay pointer-events-none"></div>
          <h2 className="text-3xl font-extrabold flex items-center gap-3 relative z-10 tracking-tight">
            <CheckCircleIcon className="w-8 h-8 text-orange-200" />
            Acceptance of Contract (AOC)
          </h2>
          <p className="text-orange-100 mt-2 ml-11 text-base font-medium relative z-10 opacity-90">
            Review the L1 bidder and finalize the contract award process.
          </p>
        </div>

        <div className="p-6 md:p-8 bg-slate-50/80 backdrop-blur-xl">
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-20 text-slate-500 animate-pulse">
              <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4 shadow-lg"></div>
              <span className="font-semibold tracking-wide">Loading work details...</span>
            </div>
          )}

          {error && <p className="text-red-500 text-center py-10 font-bold bg-red-50 rounded-xl">Failed to load data. Please try again.</p>}

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

        <Separator className="my-6 bg-slate-200" />

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* LEFT COLUMN: BIDDERS */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 px-1">
              <TrophyIcon className="w-5 h-5 text-amber-500" />
              <h3 className="text-lg font-semibold text-slate-800">Available Bidders</h3>
            </div>
            
            <div className="grid gap-4 mt-2">
              {sortedBids.map((bid: any, index: number) => (
                <BidItem
                  key={bid.id}
                  item={bid}
                  rank={index + 1}
                  isSelected={form.watch("acceptbidderId") === bid.id}
                  onSelect={() =>
                    form.setValue("acceptbidderId", bid.id, { shouldValidate: true })
                  }
                />
              ))}
            </div>
          </div>

          {/* RIGHT COLUMN: AOC DOCUMENT DETAILS */}
          <div className="space-y-4">
            <MemoDetailsCard form={form} lastAoc={lastAoc} />
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-slate-200/80">
          <DialogClose asChild>
            <Button variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-100 hover:text-slate-900 font-bold px-6 h-12 rounded-xl transition-colors">
              Cancel
            </Button>
          </DialogClose>

          <Button
            type="submit"
            disabled={!form.formState.isValid || mutation.isPending}
            className="bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-500 hover:to-orange-600 text-white font-bold px-8 h-12 rounded-xl shadow-lg shadow-orange-600/20 transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:hover:translate-y-0 text-base"
          >
            {mutation.isPending ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Processing...
              </div>
            ) : "Finalize AOC"}
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
    <Card className="shadow-lg border-0 bg-white ring-1 ring-slate-100/80 rounded-2xl overflow-hidden">
      <CardContent className="p-6 md:p-8 space-y-7">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="p-2.5 bg-slate-50 rounded-xl shadow-inner border border-slate-100">
            <FileTextIcon className="w-5 h-5 text-slate-600" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 tracking-tight">AOC Document Details</h3>
        </div>

        {lastAoc && (
          <div className="bg-blue-50/80 border border-blue-200 rounded-2xl p-5 flex items-start gap-4 shadow-sm relative overflow-hidden">
            <div className="absolute right-0 top-0 w-24 h-24 bg-blue-500/5 rounded-full blur-xl transform translate-x-1/2 -translate-y-1/2 pointer-events-none" />
            <div className="mt-0.5 p-1.5 bg-blue-100 rounded-full text-blue-600">
              <InfoIcon className="w-5 h-5" />
            </div>
            <div className="relative z-10">
              <p className="text-sm font-bold text-blue-900 tracking-wide uppercase">Previous AOC Record Found</p>
              <div className="flex flex-wrap gap-4 mt-2.5 text-sm text-blue-800">
                <p className="flex items-center gap-2">
                  <span className="opacity-80">Memo No:</span> 
                  <span className="font-bold bg-white px-2.5 py-1 rounded-md shadow-sm border border-blue-100">{lastAoc.workodermenonumber}</span>
                </p>
                <p className="flex items-center gap-2">
                  <span className="opacity-80">Date:</span> 
                  <span className="font-bold bg-white px-2.5 py-1 rounded-md shadow-sm border border-blue-100">{format(new Date(lastAoc.workordeermemodate), "dd/MM/yyyy")}</span>
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-7 pt-2">
          <FormField
            control={form.control}
            name="memono"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-700 font-bold text-[13px] uppercase tracking-wider">AOC Memo Number</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Enter AOC memo number..." 
                    className="bg-slate-50 border-slate-200 hover:border-slate-300 focus:bg-white focus:border-orange-500 focus-visible:ring-4 focus-visible:ring-orange-500/10 h-12 transition-all duration-200 rounded-xl text-base px-4 shadow-sm" 
                    {...field} 
                  />
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
                <FormLabel className="text-slate-700 font-bold text-[13px] uppercase tracking-wider">AOC Memo Date</FormLabel>
                <FormControl>
                  <Input 
                    type="date" 
                    className="bg-slate-50 border-slate-200 hover:border-slate-300 focus:bg-white focus:border-orange-500 focus-visible:ring-4 focus-visible:ring-orange-500/10 h-12 transition-all duration-200 rounded-xl text-base px-4 shadow-sm" 
                    {...field} 
                  />
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
    <Card className="border-0 shadow-xl bg-slate-900 text-white relative overflow-hidden rounded-2xl">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-500/20 rounded-full blur-[80px] -mr-40 -mt-40 pointer-events-none mix-blend-screen"></div>
      <CardContent className="p-6 md:p-8 relative z-10">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <Badge className="bg-orange-500/20 text-orange-300 hover:bg-orange-500/30 border border-orange-500/30 font-bold px-3 py-1.5 backdrop-blur-md rounded-lg shadow-inner">
              NIT No: {memoNo}/{gpcode}/{year}
            </Badge>
            {worksDetail?.estimatedAmount && (
              <Badge variant="outline" className="text-slate-300 border-slate-600 bg-slate-800/60 px-3 py-1.5 backdrop-blur-md rounded-lg font-bold">
                Est: ₹ {worksDetail.estimatedAmount.toLocaleString('en-IN')}
              </Badge>
            )}
          </div>
          <h3 className="text-xl md:text-2xl font-extrabold text-slate-50 leading-snug tracking-tight">
            {worksDetail?.ApprovedActionPlanDetails?.activityDescription || "No activity description available."}
          </h3>
        </div>
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
      className={`group cursor-pointer transition-all duration-300 border-2 overflow-hidden rounded-2xl ${
        isSelected
          ? "border-orange-500 bg-orange-50/90 shadow-xl shadow-orange-500/10 ring-4 ring-orange-500/10 scale-[1.02]"
          : "border-transparent border-slate-200 hover:border-orange-300 hover:bg-white hover:shadow-lg bg-slate-50/50 hover:-translate-y-1"
      }`}
    >
      <div className="p-5 md:p-6 flex items-center gap-5 relative">
        <div
          className={`flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-full border-2 transition-all duration-300 shadow-sm ${
            isSelected
              ? "border-orange-500 bg-orange-500 text-white scale-110"
              : "border-slate-300 text-transparent bg-white group-hover:border-orange-400 group-hover:text-orange-200"
          }`}
        >
          <CheckIcon className="w-4 h-4 font-bold" />
        </div>

        <div className="flex-grow flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1.5">
              <h4 className={`font-extrabold text-[18px] transition-colors ${isSelected ? 'text-orange-900' : 'text-slate-800 group-hover:text-slate-900'}`}>
                {item.agencydetails.name}
              </h4>
              <Badge 
                variant={rank === 1 ? "default" : "secondary"}
                className={rank === 1 ? "bg-emerald-500 hover:bg-emerald-600 shadow-sm text-white font-bold tracking-wide rounded-md px-2 py-0.5" : "bg-slate-200/80 text-slate-700 font-bold rounded-md px-2 py-0.5"}
              >
                L{rank} {rank === 1 && " Bidder"}
              </Badge>
            </div>
            {item.agencydetails.phone && (
              <p className="text-sm text-slate-500 font-medium flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                {item.agencydetails.phone}
              </p>
            )}
          </div>
          
          <div className={`md:text-right p-3 md:p-0 rounded-xl md:rounded-none md:bg-transparent transition-colors ${isSelected ? 'bg-orange-100/60' : 'bg-slate-100/80 group-hover:bg-orange-50/50'}`}>
            <p className="text-[11px] text-slate-500 uppercase tracking-widest font-black mb-1 opacity-80">Bid Amount</p>
            <p className={`font-black text-2xl tracking-tight ${rank === 1 ? 'text-emerald-600' : 'text-slate-700 group-hover:text-slate-900'}`}>
              ₹ {item.biddingAmount?.toLocaleString("en-IN") || "0"}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
});
