"use client"

import { useState } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { UserIcon, Trash2Icon, StoreIcon, User2Icon } from "lucide-react"
import { deleteBidder } from "@/action/bookNitNuber"

type AgencyType = "FARM" | "INDIVIDUAL"

interface Agency {
  id: string
  agencydetails: {
    name: string
    agencyType: AgencyType
    proprietorName: string | null
  }
}

interface WorkDetails {
  biddingAgencies: Agency[]
}

interface BidderDetailsProps {
  workdetails: WorkDetails | null
  workid: string
}

const agencyTypeIcons = {
  FARM: <StoreIcon className="w-4 h-4 text-green-700" />,
  INDIVIDUAL: <User2Icon className="w-4 h-4 text-orange-700" />,
}

const agencyTypeLabels = {
  FARM: "Farm",
  INDIVIDUAL: "Individual",
}

export function BidderDetails({ workdetails, workid }: BidderDetailsProps) {
  const [selectedAgency, setSelectedAgency] = useState<Agency | null>(null)

  const farms =
    workdetails?.biddingAgencies.filter(
      (a) => a.agencydetails.agencyType === "FARM"
    ).length || 0

  const individuals =
    workdetails?.biddingAgencies.filter(
      (a) => a.agencydetails.agencyType === "INDIVIDUAL"
    ).length || 0

  return (
    <>
      <Card className="w-full border border-gray-300 shadow-sm bg-white">
        {/* Header */}
        <CardHeader className="bg-orange-600 text-white border-b border-orange-700 py-3 px-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <UserIcon className="w-4 h-4" />
              Bidding Agencies
            </CardTitle>

            {workdetails?.biddingAgencies.length ? (
              <div className="flex flex-wrap gap-2 text-xs font-medium">
                <span className="bg-white text-orange-700 px-2 py-1 border border-orange-300 rounded">
                  Farms: {farms}
                </span>
                <span className="bg-white text-orange-700 px-2 py-1 border border-orange-300 rounded">
                  Individuals: {individuals}
                </span>
                <span className="bg-white text-orange-700 px-2 py-1 border border-orange-300 rounded">
                  Total: {workdetails.biddingAgencies.length}
                </span>
              </div>
            ) : null}
          </div>
        </CardHeader>

        <CardContent className="p-4">
          {workdetails && workdetails.biddingAgencies.length > 0 ? (
            <div className="border border-gray-300">

              {/* DESKTOP TABLE VIEW */}
              <div className="hidden md:block">
                <ScrollArea className="max-h-[400px]">

                  {/* Table Header */}
                  <div className="grid grid-cols-12 bg-orange-100 text-sm font-semibold text-orange-900 border-b border-gray-300 p-2 sticky top-0 z-10">
                    <div className="col-span-1">Sl</div>
                    <div className="col-span-5">Agency Name</div>
                    <div className="col-span-3">Type</div>
                    <div className="col-span-2">Proprietor</div>
                    <div className="col-span-1 text-center">Action</div>
                  </div>

                  {workdetails.biddingAgencies.map((agency, index) => (
                    <div
                      key={agency.id}
                      className={`grid grid-cols-12 text-sm border-b border-gray-200 p-2 
                      ${index % 2 === 0 ? "bg-white" : "bg-orange-50"}
                      hover:bg-orange-100 transition`}
                    >
                      <div className="col-span-1 font-medium">
                        {index + 1}
                      </div>

                      <div className="col-span-5 break-words">
                        {agency.agencydetails.name}
                      </div>

                      <div className="col-span-3 flex items-center gap-2">
                        {agencyTypeIcons[agency.agencydetails.agencyType]}
                        {agencyTypeLabels[agency.agencydetails.agencyType]}
                      </div>

                      <div className="col-span-2 break-words">
                        {agency.agencydetails.agencyType === "FARM"
                          ? agency.agencydetails.proprietorName || "N/A"
                          : "-"}
                      </div>

                      <div className="col-span-1 flex justify-center">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => setSelectedAgency(agency)}
                          className="h-8 w-8 text-red-600 hover:bg-red-100 border border-red-300"
                        >
                          <Trash2Icon className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}

                </ScrollArea>
              </div>

              {/* MOBILE STACKED VIEW */}
              <div className="md:hidden space-y-3 p-3">
                {workdetails.biddingAgencies.map((agency, index) => (
                  <div
                    key={agency.id}
                    className="border border-orange-200 rounded-lg p-3 bg-orange-50"
                  >
                    <div className="flex justify-between items-start">
                      <div className="font-semibold text-orange-900">
                        {index + 1}. {agency.agencydetails.name}
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setSelectedAgency(agency)}
                        className="h-8 w-8 text-red-600 hover:bg-red-100 border border-red-300"
                      >
                        <Trash2Icon className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="mt-2 text-sm text-gray-700 space-y-1">
                      <div className="flex items-center gap-2">
                        {agencyTypeIcons[agency.agencydetails.agencyType]}
                        {agencyTypeLabels[agency.agencydetails.agencyType]}
                      </div>

                      {agency.agencydetails.agencyType === "FARM" && (
                        <div>
                          <span className="font-medium">Proprietor:</span>{" "}
                          {agency.agencydetails.proprietorName || "N/A"}
                        </div>
                      )}

                      <div className="text-xs text-gray-500 break-all">
                        ID: {agency.id}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          ) : (
            <div className="text-center py-12 text-gray-600">
              <UserIcon className="mx-auto mb-3 w-12 h-12 text-orange-400" />
              <p className="font-semibold text-base">
                No Bidding Agencies Available
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* DELETE CONFIRMATION MODAL */}
      <Dialog
        open={!!selectedAgency}
        onOpenChange={() => setSelectedAgency(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600">
              Confirm Deletion
            </DialogTitle>
          </DialogHeader>

          <p className="text-sm text-gray-700">
            Are you sure you want to remove{" "}
            <span className="font-semibold">
              {selectedAgency?.agencydetails.name}
            </span>{" "}
            from bidding?
          </p>

          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => setSelectedAgency(null)}
            >
              Cancel
            </Button>

            {selectedAgency && (
              <form action={deleteBidder}>
                <input
                  type="hidden"
                  name="agencyId"
                  value={selectedAgency.id}
                />
                <input type="hidden" name="workId" value={workid} />
                <Button
                  type="submit"
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Delete
                </Button>
              </form>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
