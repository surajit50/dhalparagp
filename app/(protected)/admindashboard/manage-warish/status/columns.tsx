
"use client";
import { ShowWarishDetails } from "@/components/ShowWarishDetails";
import { WarishApplication, WarishApplicationStatus } from "@prisma/client";
import { ColumnDef } from "@tanstack/react-table";

export const warishapplicationColref: ColumnDef<WarishApplication>[] = [
  {
    id: "acknowlegment",
    header: () => <span className="font-bold text-gray-800 uppercase text-sm">Ack. No</span>,
    accessorFn: (row) => row.acknowlegment,
    cell: (info) => (
      <span className="font-medium text-blue-800 font-mono">
        {info.getValue<string>()}
      </span>
    ),
  },
  {
    id: "applicantName",
    header: () => <span className="font-bold text-gray-800 uppercase text-sm">Applicant</span>,
    accessorFn: (row) => row.applicantName,
    cell: (info) => (
      <span className="text-gray-900 font-medium">{info.getValue<string>()}</span>
    ),
  },
  {
    id: "nameOfDeceased",
    header: () => <span className="font-bold text-gray-800 uppercase text-sm">Deceased</span>,
    accessorFn: (row) => row.nameOfDeceased,
    cell: (info) => (
      <span className="text-gray-700">{info.getValue<string>()}</span>
    ),
  },
  {
    id: "villageName",
    header: () => <span className="font-bold text-gray-800 uppercase text-sm">Village</span>,
    accessorFn: (row) => row.villageName,
    cell: (info) => (
      <span className="text-gray-700">{info.getValue<string>()}</span>
    ),
  },
  {
    id: "status",
    header: () => <span className="font-bold text-gray-800 uppercase text-sm">Status</span>,
    accessorFn: (row) => row.warishApplicationStatus,
    cell: (info) => {
      const status = info.getValue<WarishApplicationStatus>();
      const statusStyle: Record<WarishApplicationStatus, string> = {
        approved: "bg-green-100 text-green-800",
        pending: "bg-amber-100 text-amber-800",
        rejected: "bg-red-100 text-red-800",
        cancelled: "bg-gray-100 text-gray-800",
        process: "bg-blue-100 text-blue-800",
        renewed: "bg-purple-100 text-purple-800",
        submitted: "bg-cyan-100 text-cyan-800",
      };
      
      const style = statusStyle[status];

      return (
        <div
          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${style}`}
        >
          <span className="h-2 w-2 rounded-full mr-2" style={{ backgroundColor: style.split(' ')[1].split('-')[2] === '100' ? style.split(' ')[3].split('-')[2] : style.split(' ')[1].split('-')[2] }} />
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </div>
      );
    },
  },
  {
    header: () => <span className="font-bold text-gray-800 uppercase text-sm">Actions</span>,
    id: "action",
    cell: (info) => {
      const row = info.row.original;
      return (
        <div className="flex gap-2">
          
            <ShowWarishDetails warishapplicationid={row.id} />
          
        </div>
      );
    },
  }
];
