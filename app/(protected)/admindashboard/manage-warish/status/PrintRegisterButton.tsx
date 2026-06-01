"use client";

import { useState, useMemo } from "react";
import { WarishApplication } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Printer, Download } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface PrintRegisterButtonProps {
  applications: WarishApplication[];
}

export default function PrintRegisterButton({ applications }: PrintRegisterButtonProps) {
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [isOpen, setIsOpen] = useState(false);

  const approvedApps = useMemo(() => {
    return applications.filter(
      (app) =>
        app.warishApplicationStatus === "approved" ||
        app.warishApplicationStatus === "renewed"
    );
  }, [applications]);

  const years = useMemo(() => {
    const y = new Set<string>();
    approvedApps.forEach((app) => {
      if (app.approvalYear) y.add(app.approvalYear);
    });
    return Array.from(y).sort((a, b) => b.localeCompare(a));
  }, [approvedApps]);

  const filteredApps = useMemo(() => {
    let result = approvedApps;
    if (selectedYear !== "all") {
      result = approvedApps.filter((app) => app.approvalYear === selectedYear);
    }
    // Sort by Acknowledgment Number ascending (Ack. No. wise)
    return [...result].sort((a, b) => a.acknowlegment.localeCompare(b.acknowlegment));
  }, [approvedApps, selectedYear]);

  const handleDownloadPDF = () => {
    const doc = new jsPDF();

    const title =
      selectedYear === "all"
        ? "Warish Register - All Approved Applications"
        : `Warish Register - Financial Year: ${selectedYear}`;

    doc.setFontSize(14);
    doc.text(title, 14, 22);

    const tableColumn = [
      "Sl. No.",
      "Ack. No.",
      "Applicant Name",
      "Deceased Name",
      "Village",
      "Memo No.",
      "Date",
      "Prodhan Sig.",
    ];
    
    const tableRows: any[][] = [];

    filteredApps.forEach((app, index) => {
      const rowData = [
        index + 1,
        app.acknowlegment,
        app.applicantName,
        app.nameOfDeceased,
        app.villageName,
        app.warishRefNo || "-",
        app.warishRefDate ? new Date(app.warishRefDate).toLocaleDateString("en-IN") : "-",
        "",
      ];
      tableRows.push(rowData);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 30,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    });

    doc.save(`Warish_Register_${selectedYear}.pdf`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Printer className="h-4 w-4" />
          Print Register
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-5xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Warish Register PDF Download</DialogTitle>
        </DialogHeader>

        <div className="flex gap-4 items-center mb-4">
          <span className="text-sm font-medium">Select Year:</span>
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="All Years" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Years</SelectItem>
              {years.map((y) => (
                <SelectItem key={y} value={y}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button onClick={handleDownloadPDF} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Download PDF
          </Button>
        </div>

        <div className="p-4 border rounded-md bg-white">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold uppercase underline">Warish Register Preview</h2>
            <p className="text-sm font-semibold mt-1">
              {selectedYear === "all"
                ? "All Approved Applications"
                : `Financial Year: ${selectedYear}`}
            </p>
          </div>

          <table className="w-full border-collapse border border-gray-300 text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 p-2 text-left">Sl. No.</th>
                <th className="border border-gray-300 p-2 text-left">Ack. No.</th>
                <th className="border border-gray-300 p-2 text-left">Applicant Name</th>
                <th className="border border-gray-300 p-2 text-left">Deceased Name</th>
                <th className="border border-gray-300 p-2 text-left">Village</th>
                <th className="border border-gray-300 p-2 text-left">Memo No.</th>
                <th className="border border-gray-300 p-2 text-left">Date</th>
                <th className="border border-gray-300 p-2 text-left">Prodhan Sig.</th>
              </tr>
            </thead>
            <tbody>
              {filteredApps.length === 0 ? (
                <tr>
                  <td colSpan={8} className="border border-gray-300 p-4 text-center">
                    No approved applications found.
                  </td>
                </tr>
              ) : (
                filteredApps.map((app, i) => (
                  <tr key={app.id} className="hover:bg-gray-50">
                    <td className="border border-gray-300 p-2 text-center">{i + 1}</td>
                    <td className="border border-gray-300 p-2 font-medium">{app.acknowlegment}</td>
                    <td className="border border-gray-300 p-2">{app.applicantName}</td>
                    <td className="border border-gray-300 p-2">{app.nameOfDeceased}</td>
                    <td className="border border-gray-300 p-2">{app.villageName}</td>
                    <td className="border border-gray-300 p-2">{app.warishRefNo || "-"}</td>
                    <td className="border border-gray-300 p-2">
                      {app.warishRefDate
                        ? new Date(app.warishRefDate).toLocaleDateString("en-IN")
                        : "-"}
                    </td>
                    <td className="border border-gray-300 p-2"></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </DialogContent>
    </Dialog>
  );
}
