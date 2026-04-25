"use client";
import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Eye } from "lucide-react";

function ViewQrCell({ ack }: { ack: string }) {
  const [open, setOpen] = useState(false);
  const QRCode = require("qrcode.react").QRCodeSVG;
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          className="p-2 rounded hover:bg-blue-100 text-blue-700"
          title="View QR Code"
          onClick={() => setOpen(true)}
        >
          <Eye className="w-5 h-5" />
        </button>
      </DialogTrigger>
      <DialogContent className="flex flex-col items-center gap-4">
        <DialogTitle>QR Code for {ack}</DialogTitle>
        <QRCode value={ack} size={180} />
        <div className="text-xs text-gray-500 mt-2">{ack}</div>
      </DialogContent>
    </Dialog>
  );
}

export const warishColumns: ColumnDef<any>[] = [
  {
    header: "Sl. No.",
    accessorFn: (_row, i) => i + 1,
    cell: ({ row }) => row.index + 1,
    enableSorting: false,
    size: 60,
  },
  {
    header: "Acknowledgement No",
    accessorKey: "acknowlegment",
    cell: ({ getValue }) => (
      <span className="font-mono text-blue-800">{getValue() as string}</span>
    ),
  },
  {
    header: "Applicant Name",
    accessorKey: "applicantName",
  },
  {
    header: "View QR",
    id: "view-qr",
    cell: ({ row }) => <ViewQrCell ack={row.original.acknowlegment} />,
    enableSorting: false,
    size: 80,
  },
];
