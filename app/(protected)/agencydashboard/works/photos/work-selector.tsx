"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Camera, Upload, Eye, CheckCircle2, Image as ImageIcon, Check, ChevronsUpDown } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type WorkPhoto = { status: string; isVerified: boolean };

type Work = {
  id: string;
  nitDetails: { memoNumber: number, memoDate: Date } | null;
  ApprovedActionPlanDetails: { activityDescription: string, activityCode: string } | null;
  workPhotos: WorkPhoto[];
};

export default function WorkSelector({ works }: { works: Work[] }) {
  const [selectedWorkId, setSelectedWorkId] = useState<string>("");
  const [open, setOpen] = useState(false);

  const selectedWork = works.find((w) => w.id === selectedWorkId);

  let content = null;

  if (selectedWork) {
    const photos = selectedWork.workPhotos;
    const onsetVerified = photos.some((p) => p.status === "onset" && p.isVerified);
    const ongoingVerified = photos.some((p) => p.status === "ongoing" && p.isVerified);
    const completeVerified = photos.some((p) => p.status === "complete" && p.isVerified);
    const allVerified = onsetVerified && ongoingVerified && completeVerified;
    const uploadedCount = photos.length;

    content = (
      <Card className="mt-6 border-slate-200/60 shadow-md bg-white/80 backdrop-blur-sm transition-all duration-300 hover:shadow-lg rounded-xl overflow-hidden">
        <div className="h-1.5 w-full bg-gradient-to-r from-fuchsia-400 to-purple-500" />
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-4 flex-1">
              <div>
                <h3 className="text-lg font-bold text-slate-800">
                  {selectedWork.ApprovedActionPlanDetails?.activityCode} - {selectedWork.ApprovedActionPlanDetails?.activityDescription || "No Description"}
                </h3>
                <p className="text-sm font-medium text-slate-500 mt-1 flex items-center gap-2">
                  <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs font-semibold">NIT No.</span>
                  {selectedWork.nitDetails?.memoNumber || "N/A"}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-2">
                <span className="text-sm font-semibold text-slate-600 mr-2">Stages:</span>
                {(["onset", "ongoing", "complete"] as const).map((stage) => {
                  const verified = photos.some((p) => p.status === stage && p.isVerified);
                  const uploaded = photos.some((p) => p.status === stage);
                  return (
                    <span
                      key={stage}
                      className={`text-[11px] px-2.5 py-1 rounded-md uppercase tracking-wider font-bold ${verified
                        ? "bg-green-100 text-green-700 border border-green-200"
                        : uploaded
                          ? "bg-amber-100 text-amber-700 border border-amber-200"
                          : "bg-slate-100 text-slate-400 border border-slate-200"
                        }`}
                    >
                      {stage}
                    </span>
                  );
                })}
                <span className="text-xs font-bold text-slate-400 ml-2">
                  ({uploadedCount}/3)
                </span>
              </div>
            </div>

            <div className="flex flex-col items-start sm:items-end gap-3 w-full md:w-auto md:min-w-[140px] mt-4 md:mt-0">
              {allVerified ? (
                <>
                  <Badge className="bg-green-50 text-green-700 hover:bg-green-100 border-green-200 shadow-sm gap-1.5 py-1.5 px-4 self-start sm:self-end rounded-full font-medium transition-colors">
                    <CheckCircle2 className="h-4 w-4" /> All Complete
                  </Badge>
                  <Button asChild variant="outline" className="w-full gap-2 text-slate-600 hover:text-fuchsia-700 hover:bg-fuchsia-50 hover:border-fuchsia-200 border-slate-200 shadow-sm transition-all duration-300 rounded-lg">
                    <Link href={`/agencydashboard/works/photos/${selectedWork.id}`}>
                      <Eye className="h-4 w-4" /> View Photos
                    </Link>
                  </Button>
                </>
              ) : (
                <Button asChild className="w-full gap-2 bg-gradient-to-r from-fuchsia-600 to-violet-600 hover:from-fuchsia-500 hover:to-violet-500 text-white shadow-md hover:shadow-lg hover:shadow-fuchsia-500/20 transition-all duration-300 rounded-lg">
                  <Link href={`/agencydashboard/works/photos/${selectedWork.id}`}>
                    <Upload className="h-4 w-4" />
                    Upload Photos
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  } else if (works.length > 0) {
    content = (
      <div className="mt-6 md:mt-8 flex flex-col items-center justify-center text-center p-8 md:p-14 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50 mx-2 md:mx-0 shadow-sm">
        <div className="h-16 w-16 bg-white rounded-full shadow-sm flex items-center justify-center mb-4 border border-slate-100">
          <ImageIcon className="h-8 w-8 text-slate-300" />
        </div>
        <h3 className="text-base md:text-lg font-semibold text-slate-700">No work selected</h3>
        <p className="text-xs md:text-sm text-slate-500 mt-2 max-w-sm">Please select a work from the dropdown menu above to manage and view its photo progress.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-sm border-slate-200/60 overflow-visible bg-white/60 backdrop-blur-md rounded-2xl">
        <CardHeader className="bg-gradient-to-b from-slate-50/50 to-white/0 border-b border-slate-100/80 pb-5 p-4 md:p-6 rounded-t-2xl">
          <CardTitle className="text-lg md:text-xl font-bold text-slate-800 flex items-center gap-3">
            <div className="p-2 bg-fuchsia-100/50 rounded-xl text-fuchsia-600 shadow-sm border border-fuchsia-100">
              <Camera className="h-4 w-4 md:h-5 md:w-5" />
            </div>
            Select Work
          </CardTitle>
          <CardDescription className="text-xs md:text-sm text-slate-500 font-medium">
            Choose a work below to view its photo upload status.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 md:p-6 overflow-visible">
          {works.length === 0 ? (
            <div className="text-center py-6 md:py-8 text-slate-500 font-medium text-sm md:text-base">
              No active works found for photo uploads.
            </div>
          ) : (
            <div className="max-w-2xl">
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full bg-white h-auto min-h-[52px] py-3 text-sm md:text-base font-medium border-slate-200 shadow-sm rounded-xl hover:bg-slate-50 justify-between focus:ring-2 focus:ring-fuchsia-500/20 focus:border-fuchsia-400 transition-all whitespace-normal text-left"
                  >
                    {selectedWorkId && selectedWork
                      ? (
                        <div className="flex flex-col items-start w-full">
                          <span className="truncate w-full block">{selectedWork.ApprovedActionPlanDetails?.activityCode} - {selectedWork.ApprovedActionPlanDetails?.activityDescription || "Unnamed Work"}</span>
                        </div>
                      )
                      : "Select a work to manage photos..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 rounded-xl border-slate-200 shadow-xl" align="start">
                  <Command>
                    <CommandInput placeholder="Search work by code, description, or NIT..." className="h-11" />
                    <CommandList>
                      <CommandEmpty>No work found.</CommandEmpty>
                      <CommandGroup>
                        {works.map((work) => {
                          const nitYear = work.nitDetails?.memoDate ? new Date(work.nitDetails.memoDate).getFullYear() : "N/A";
                          const searchString = `${work.ApprovedActionPlanDetails?.activityCode} ${work.ApprovedActionPlanDetails?.activityDescription} ${work.nitDetails?.memoNumber}`.toLowerCase();
                          return (
                            <CommandItem
                              key={work.id}
                              value={searchString} // Provide a rich string for internal filtering
                              onSelect={() => {
                                setSelectedWorkId(work.id);
                                setOpen(false);
                              }}
                              className="py-3 cursor-pointer rounded-lg mx-1 my-0.5 transition-colors flex items-start"
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4 mt-0.5 shrink-0 text-fuchsia-600",
                                  selectedWorkId === work.id ? "opacity-100" : "opacity-0"
                                )}
                              />
                              <div className="flex-1 overflow-hidden">
                                <div className="font-semibold text-slate-700 whitespace-normal text-left text-sm md:text-base leading-snug break-words">
                                  {work.ApprovedActionPlanDetails?.activityCode} - {work.ApprovedActionPlanDetails?.activityDescription || "Unnamed Work"}
                                </div>
                                <div className="text-[11px] md:text-xs font-medium text-slate-400 mt-1.5 flex items-center gap-1.5">
                                  <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-500">NIT</span>
                                  {work.nitDetails?.memoNumber || "N/A"}/DGP/{nitYear}
                                </div>
                              </div>
                            </CommandItem>
                          );
                        })}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          )}
        </CardContent>
      </Card>

      {content}
    </div>
  );
}
