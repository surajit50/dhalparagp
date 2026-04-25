import type { Metadata } from "next";
import { PollingStationTable } from "./polling-station-table";
import { AddPollingStationDialog } from "./add-polling-station-dialog";
import { gpnameinshort } from "@/constants/gpinfor";

export const metadata: Metadata = {
  title: `Polling Station Management | ${gpnameinshort} Gram Panchayat`,
  description: `Manage polling stations and gram sansad member assignments for elections in ${gpnameinshort} Gram Panchayat`,
};

export default function PollingStationsPage() {
  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Polling Station Management</h1>
        <AddPollingStationDialog />
      </div>
      <PollingStationTable />
    </div>
  );
}
