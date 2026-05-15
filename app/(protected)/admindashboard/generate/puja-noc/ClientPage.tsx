"use client";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useState, useTransition, useEffect, useMemo, useCallback } from "react";
import React from "react";
import { useSearchParams } from "next/navigation";
import { gpname } from "@/constants/gpinfor";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  ClipboardList,
  Eye,
  Save,
  History,
  LayoutDashboard,
  Settings,
  FilePlus,
  Search,
  Printer,
  Calendar,
  MapPin,
  Users,
  CheckCircle2,
  AlertCircle,
  FileText,
} from "lucide-react";
import { generatePujaNOC, getPujaNOCs } from "@/action/puja-noc-actions";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// --- Helper Functions ---

async function fetchImageAsBase64(url: string): Promise<string | null> {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error("Error fetching image:", error);
    return null;
  }
}

async function generatePujaNocPdf(values: any) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF("p", "mm", "a4");

  const pw = doc.internal.pageSize.getWidth();
  const ph = doc.internal.pageSize.getHeight();
  const ml = 25;
  const mr = 25;
  const tw = pw - ml - mr;

  // Load Logo
  const logoBase64 = await fetchImageAsBase64("/images/logo.png");

  // Page Border
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.5);
  doc.rect(10, 10, pw - 20, ph - 20);

  let y = 15;

  // Header
  if (logoBase64) {
    doc.addImage(logoBase64, "PNG", ml, y, 20, 20);
  }

  doc.setTextColor(0, 0, 0);
  doc.setFont("times", "normal");
  doc.setFontSize(10);
  doc.text("Office of the Prodhan", pw / 2, y + 8, { align: "center" });

  doc.setFont("times", "bold");
  doc.setFontSize(18);
  doc.text(values.gpName, pw / 2, y + 15, { align: "center" });

  doc.setFont("times", "normal");
  doc.setFontSize(10);
  doc.text(
    `P.O.: ${values.postOffice} • P.S.: ${values.policeStation} • Dist.: ${values.district}, West Bengal`,
    pw / 2,
    y + 21,
    { align: "center" },
  );

  y += 28;
  doc.setLineWidth(0.5);
  doc.line(ml, y, pw - mr, y);
  y += 10;

  // Title
  doc.setFont("times", "bold");
  doc.setFontSize(16);
  doc.text("NO OBJECTION CERTIFICATE (NOC)", pw / 2, y, { align: "center" });
  y += 12;

  // Ref & Date
  doc.setFont("times", "bold");
  doc.setFontSize(11);
  doc.text(`Ref. No: ${values.refNo || "_______"} /GP`, ml, y);
  const formattedDate = values.date
    ? values.date.split("-").reverse().join("-")
    : "__ / __ / 20__";
  doc.text(`Date: ${formattedDate}`, pw - mr, y, { align: "right" });
  y += 15;

  // Body
  doc.setFont("times", "normal");
  doc.setFontSize(12);

  const body1 = `This is to certify that this Gram Panchayat has no objection to the organization of ${values.pujaName} at ${values.location} by ${values.organizer}.`;

  const body2 = `The aforementioned Puja / Festival is scheduled to take place from ${values.startDate ? values.startDate.split("-").reverse().join("-") : "________"} to ${values.endDate ? values.endDate.split("-").reverse().join("-") : "________"}.`;

  const paragraphs = [body1, body2];

  for (const para of paragraphs) {
    const lines = doc.splitTextToSize(para, tw - 2); // Split with a small buffer
    doc.text(para, ml, y, { align: "justify", maxWidth: tw - 2 });
    y += lines.length * 7 + 5;
  }

  // Conditions
  doc.setFont("times", "bold");
  doc.text("This NOC is granted subject to the following conditions:", ml, y);
  y += 8;

  doc.setFont("times", "normal");
  const conditions = [
    "1. The organizers must ensure peaceful conduct of the Puja without causing any public inconvenience or obstruction to traffic.",
    "2. Proper cleanliness, hygiene, and sanitation must be maintained at the venue at all times.",
    "3. Use of loudspeakers must strictly comply with the permissible time and volume limits as prescribed by the Law/Pollution Control Board.",
    "4. No unlawful, objectionable, or communal activities are to be carried out within the premises.",
    "5. The organizers shall remain fully responsible for maintaining law and order, fire safety, and the overall security of the participants and public.",
    "6. Necessary permissions from the Police Department and Electricity Board must be obtained separately.",
  ];

  for (const cond of conditions) {
    const lines = doc.splitTextToSize(cond, tw - 10);
    doc.text(cond, ml + 5, y, { maxWidth: tw - 10, align: "justify" });
    y += lines.length * 6 + 2;
  }

  y += 5;
  doc.text(
    "This certificate is issued on the request of the organizers for official and administrative purposes.",
    ml,
    y,
  );

  // Footer
  y = ph - 60; // Move footer up to ensure it fits within the border
  doc.setLineWidth(0.2);
  doc.setDrawColor(200, 200, 200);
  doc.line(ml, y, pw - mr, y);
  y += 8;

  // Seal & Signature
  doc.setFont("times", "bold");
  doc.setFontSize(9);
  doc.setDrawColor(0, 0, 0);
  doc.rect(ml, y, 35, 35); // Slightly larger seal box
  doc.text("OFFICE SEAL", ml + 17.5, y + 18, { align: "center" });

  doc.setFontSize(11);
  const sigLineW = 50;
  doc.line(pw - mr - sigLineW, y + 20, pw - mr, y + 20); // Signature Line
  doc.text("Prodhan", pw - mr - sigLineW / 2, y + 25, { align: "center" });
  doc.setFontSize(10);
  doc.text(`${values.gpName}`, pw - mr - sigLineW / 2, y + 30, {
    align: "center",
  });

  doc.save(`Puja_NOC_${values.refNo || "certificate"}.pdf`);
}

// --- Components ---

function NocCertificate({
  values,
}: {
  values: {
    gpName: string;
    postOffice: string;
    policeStation: string;
    district: string;
    refNo: string;
    date: string;
    pujaName: string;
    location: string;
    organizer: string;
    startDate: string;
    endDate: string;
  };
}) {
  return (
    <div
      className="w-[210mm] min-h-[297mm] mx-auto bg-white text-black p-8 border shadow-md print:border-0 print:shadow-none print:w-full print:h-auto print:min-h-0 print:p-0"
      style={{ fontFamily: "'Times New Roman', Times, serif" }}
    >
      <div className="border-[1.5px] border-black p-8 min-h-[1020px] flex flex-col relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="w-24">
            <img 
              src="/images/logo.png" 
              alt="GP Logo" 
              className="w-20 h-20 object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
          <div className="text-center flex-1">
            <p className="text-lg font-medium">Office of the Prodhan</p>
            <h1 className="text-3xl font-bold uppercase">{values.gpName}</h1>
            <p className="text-sm mt-1">
              P.O.: {values.postOffice} • P.S.: {values.policeStation} • Dist.:{" "}
              {values.district}, West Bengal
            </p>
          </div>
          <div className="w-24"></div> {/* Spacer for centering */}
        </div>

        <div className="mb-6 border-t-[1.5px] border-black" />

        <div className="text-center mb-8">
          <h2 className="text-xl font-bold underline decoration-1 underline-offset-4">
            NO OBJECTION CERTIFICATE (NOC)
          </h2>
        </div>

        <div className="flex justify-between mb-8 text-base">
          <p>
            <span className="font-bold">Ref. No:</span>{" "}
            {values.refNo || "_______"} /GP
          </p>
          <p>
            <span className="font-bold">Date:</span>{" "}
            {values.date
              ? values.date.split("-").reverse().join("-")
              : "__ / __ / 20__"}
          </p>
        </div>

        <div className="space-y-6 text-lg leading-relaxed text-justify flex-1">
          <p>
            This is to certify that this Gram Panchayat has{" "}
            <strong>no objection</strong> to the organization of{" "}
            <strong>{values.pujaName || "_________________"}</strong> at{" "}
            <strong>{values.location || "_________________"}</strong> by{" "}
            <strong>{values.organizer || "_________________"}</strong>.
          </p>

          <p>
            The aforementioned Puja / Festival is scheduled to take place from{" "}
            <strong>
              {values.startDate
                ? values.startDate.split("-").reverse().join("-")
                : "________"}
            </strong>{" "}
            to{" "}
            <strong>
              {values.endDate
                ? values.endDate.split("-").reverse().join("-")
                : "________"}
            </strong>
            .
          </p>

          <div className="mt-8">
            <p className="font-bold mb-3">
              This NOC is granted subject to the following conditions:
            </p>
            <ol className="list-decimal pl-8 space-y-3">
              <li>
                The organizers must ensure peaceful conduct of the Puja without
                causing any public inconvenience or obstruction to traffic.
              </li>
              <li>
                Proper cleanliness, hygiene, and sanitation must be maintained at
                the venue at all times.
              </li>
              <li>
                Use of loudspeakers must strictly comply with the permissible time
                and volume limits as prescribed by the Law/Pollution Control
                Board.
              </li>
              <li>
                No unlawful, objectionable, or communal activities are to be
                carried out within the premises.
              </li>
              <li>
                The organizers shall remain fully responsible for maintaining law
                and order, fire safety, and the overall security of the
                participants and public.
              </li>
              <li>
                Necessary permissions from the Police Department and Electricity
                Board must be obtained separately.
              </li>
            </ol>
          </div>

          <p className="pt-6">
            This certificate is issued on the request of the organizers for
            official and administrative purposes.
          </p>
        </div>

        {/* Footer */}
        <div className="mt-auto pt-16 flex justify-between items-end pb-2 px-2">
          <div className="text-center">
            <div className="w-32 h-32 border-[1.5px] border-black flex items-center justify-center text-black font-bold text-sm uppercase">
              Office Seal
            </div>
          </div>
          <div className="text-center flex flex-col items-center">
            <div className="w-56 border-t-[1.5px] border-black pt-2 space-y-1">
              <p className="font-bold text-lg">Prodhan</p>
              <p className="text-base font-semibold max-w-[200px] whitespace-normal leading-tight mx-auto">
                {values.gpName}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Main Page ---

export default function ClientPage() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") || "dashboard";
  const [activeTab, setActiveTab] = useState(initialTab);

  // Update tab if URL parameter changes
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const [history, setHistory] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // ---------- new state for the Select dropdown ----------
  const [pujaType, setPujaType] = useState<string>(""); 
  const [customPujaName, setCustomPujaName] = useState("");

  // derived final puja name: if "Other" is selected, use custom name; otherwise use the selected option
  const effectivePujaName = pujaType === "Other" ? customPujaName : pujaType;

  const [values, setValues] = useState({
    gpName: gpname || "[Name of Gram Panchayat]",
    postOffice: "Trimohini",
    policeStation: "Hili",
    district: "Dakshin Dinajpur",
    refNo: "",
    date: "",
    pujaName: "", // will be updated via effect
    location: "",
    organizer: "",
    startDate: "",
    endDate: "",
  });

  // keep form's pujaName in sync with derived name
  useEffect(() => {
    setValues((prev) => ({ ...prev, pujaName: effectivePujaName }));
  }, [effectivePujaName]);

  const loadHistoryIntoForm = useCallback(
    (item: any) => {
      const presetList = [
        "Durga Puja", "Kali Puja", "Saraswati Puja", "Jagaddhatri Puja",
        "Ganesh Puja", "Eid-ul-Fitr", "Muharram", "Christmas"
      ];
      const eventName = item.eventName;
      if (presetList.includes(eventName)) {
        setPujaType(eventName);
        setCustomPujaName("");
      } else {
        setPujaType("Other");
        setCustomPujaName(eventName);
      }

      setValues((prev) => ({
        ...prev,
        refNo: item.refNo,
        date: new Date(item.refDate).toISOString().split("T")[0],
        location: item.eventLocation,
        organizer: item.organizerName,
        startDate: new Date(item.startDate).toISOString().split("T")[0],
        endDate: new Date(item.endDate).toISOString().split("T")[0],
      }));
      
      setActiveTab("preview");
    },
    []
  );

  const [isPending, startTransition] = useTransition();

  const handleDownload = useCallback(() => {
    generatePujaNocPdf(values);
  }, [values]);

  // Load history
  const fetchHistory = useCallback(async () => {
    setIsLoadingHistory(true);
    const res = await getPujaNOCs();
    if (res.success) {
      setHistory(res.data || []);
    }
    setIsLoadingHistory(false);
  }, []);

  useEffect(() => {
    if (activeTab === "history" || activeTab === "dashboard") {
      fetchHistory();
    }
  }, [activeTab, fetchHistory]);

  const handleGenerate = useCallback(() => {
    if (
      !effectivePujaName ||
      !values.location ||
      !values.organizer ||
      !values.startDate ||
      !values.endDate
    ) {
      toast.error("Please fill in all required fields.");
      return;
    }

    startTransition(async () => {
      const res = await generatePujaNOC({
        pujaName: effectivePujaName,
        location: values.location,
        organizer: values.organizer,
        startDate: values.startDate,
        endDate: values.endDate,
      });

      if (res.success && res.refNo && res.date) {
        setValues((prev) => ({
          ...prev,
          refNo: res.refNo!,
          date: res.date!,
        }));
        toast.success("NOC generated successfully!");
        setActiveTab("preview");
      } else {
        toast.error(res.message || "Something went wrong");
      }
    });
  }, [effectivePujaName, values.location, values.organizer, values.startDate, values.endDate]);

  const filteredHistory = useMemo(() => {
    return history.filter(
      (item) =>
        item.eventName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.organizerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.refNo?.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [history, searchQuery]);

  const stats = useMemo(() => {
    const total = history.length;
    const thisMonth = history.filter((item) => {
      const date = new Date(item.createdAt);
      const now = new Date();
      return (
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()
      );
    }).length;

    return { total, thisMonth };
  }, [history]);

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Puja & Festival NOC Management
          </h1>
          <p className="text-muted-foreground">
            Comprehensive system for issuing and managing festival permissions
          </p>
        </div>
        <div className="flex items-center gap-2">
          {activeTab === "form" && (
            <Button onClick={handleGenerate} disabled={isPending}>
              {isPending ? (
                "Processing..."
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" /> Generate & Save
                </>
              )}
            </Button>
          )}
          {activeTab === "preview" && (
            <Button
              onClick={handleDownload}
              className="bg-orange-600 hover:bg-orange-700"
            >
              <Printer className="mr-2 h-4 w-4" /> Generate & Print
            </Button>
          )}
          {activeTab !== "form" && (
            <Button onClick={() => setActiveTab("form")} variant="outline">
              <FilePlus className="mr-2 h-4 w-4" /> New NOC
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sidebar Navigation */}
        <aside className="lg:col-span-3 space-y-2">
          <nav className="flex lg:flex-col gap-1 overflow-x-auto pb-2 lg:pb-0">
            <Button
              variant={activeTab === "dashboard" ? "default" : "ghost"}
              className="justify-start"
              onClick={() => setActiveTab("dashboard")}
            >
              <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
            </Button>
            <Button
              variant={activeTab === "form" ? "default" : "ghost"}
              className="justify-start"
              onClick={() => setActiveTab("form")}
            >
              <FilePlus className="mr-2 h-4 w-4" /> Generate NOC
            </Button>
            <Button
              variant={activeTab === "history" ? "default" : "ghost"}
              className="justify-start"
              onClick={() => setActiveTab("history")}
            >
              <History className="mr-2 h-4 w-4" /> Issued NOCs
            </Button>
            <Button
              variant={activeTab === "preview" ? "default" : "ghost"}
              className={cn(
                "justify-start",
                !values.refNo && "opacity-50 cursor-not-allowed",
              )}
              disabled={!values.refNo}
              onClick={() => setActiveTab("preview")}
            >
              <Eye className="mr-2 h-4 w-4" /> Preview
            </Button>
            <Button
              variant={activeTab === "settings" ? "default" : "ghost"}
              className="justify-start"
              onClick={() => setActiveTab("settings")}
            >
              <Settings className="mr-2 h-4 w-4" /> Settings
            </Button>
          </nav>

          <Separator className="my-4" />

          <Card className="hidden lg:block">
            <CardHeader className="p-4">
              <CardTitle className="text-sm font-medium">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  Total Issued
                </span>
                <span className="text-sm font-bold">{stats.total}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  This Month
                </span>
                <span className="text-sm font-bold text-green-600">
                  +{stats.thisMonth}
                </span>
              </div>
            </CardContent>
          </Card>
        </aside>

        {/* Main Content Area */}
        <main className="lg:col-span-9">
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total NOCs
                    </CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.total}</div>
                    <p className="text-xs text-muted-foreground">
                      All time issued certificates
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Active This Month
                    </CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.thisMonth}</div>
                    <p className="text-xs text-muted-foreground">
                      Permissions issued in current month
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Status
                    </CardTitle>
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">Operational</div>
                    <p className="text-xs text-muted-foreground">
                      System is running normally
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>
                    Latest 5 NOCs issued by the system
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Ref No</TableHead>
                        <TableHead>Event</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {history.slice(0, 5).map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">
                            {item.refNo}
                          </TableCell>
                          <TableCell>{item.eventName}</TableCell>
                          <TableCell>
                            {new Date(item.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className="bg-green-50 text-green-700 border-green-200"
                            >
                              Issued
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                      {history.length === 0 && (
                        <TableRow>
                          <TableCell
                            colSpan={4}
                            className="text-center py-8 text-muted-foreground"
                          >
                            No recent activity found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "form" && (
            <Card className="border-t-4 border-t-orange-600">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardList className="h-5 w-5 text-orange-600" />
                  Certificate Details
                </CardTitle>
                <CardDescription>
                  Fill in the details accurately to generate the NOC
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* GP Info Section */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <MapPin className="h-4 w-4" /> Authority Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Gram Panchayat</Label>
                      <Input
                        value={values.gpName}
                        disabled
                        className="bg-muted/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Police Station</Label>
                      <Input
                        value={values.policeStation}
                        disabled
                        className="bg-muted/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Post Office</Label>
                      <Input
                        value={values.postOffice}
                        disabled
                        className="bg-muted/50"
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Event Info Section */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <Users className="h-4 w-4" /> Organizer & Event
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* ---------- Select - Dropdown for Puja Name ---------- */}
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="pujaSelect">
                        Name of Puja/Festival{" "}
                        <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={pujaType}
                        onValueChange={(value) => {
                          setPujaType(value);
                          if (value !== "Other") {
                            setCustomPujaName(""); // clear custom when choosing a preset
                          }
                        }}
                      >
                        <SelectTrigger id="pujaSelect">
                          <SelectValue placeholder="Select Puja/Festival" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Durga Puja">Durga Puja</SelectItem>
                          <SelectItem value="Kali Puja">Kali Puja</SelectItem>
                          <SelectItem value="Saraswati Puja">Saraswati Puja</SelectItem>
                          <SelectItem value="Jagaddhatri Puja">Jagaddhatri Puja</SelectItem>
                          <SelectItem value="Ganesh Puja">Ganesh Puja</SelectItem>
                          <SelectItem value="Eid-ul-Fitr">Eid-ul-Fitr</SelectItem>
                          <SelectItem value="Muharram">Muharram</SelectItem>
                          <SelectItem value="Christmas">Christmas</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Show custom input only when "Other" is selected */}
                    {pujaType === "Other" && (
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="customPujaName">
                          Specify Puja/Festival Name{" "}
                          <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="customPujaName"
                          value={customPujaName}
                          onChange={(e) => setCustomPujaName(e.target.value)}
                          placeholder="e.g., Vishwakarma Puja"
                        />
                      </div>
                    )}

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="organizer">
                        Organizer (Committee/Club){" "}
                        <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="organizer"
                        value={values.organizer}
                        onChange={(e) =>
                          setValues({ ...values, organizer: e.target.value })
                        }
                        placeholder="e.g., Azad Hind Club"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="location">
                        Exact Venue/Address{" "}
                        <span className="text-red-500">*</span>
                      </Label>
                      <Textarea
                        id="location"
                        value={values.location}
                        onChange={(e) =>
                          setValues({ ...values, location: e.target.value })
                        }
                        placeholder="Provide the specific ground or address name"
                        rows={2}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="startDate">
                        Start Date <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={values.startDate}
                        onChange={(e) =>
                          setValues({ ...values, startDate: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="endDate">
                        End Date <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={values.endDate}
                        onChange={(e) =>
                          setValues({ ...values, endDate: e.target.value })
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div className="text-sm text-amber-800">
                    <p className="font-semibold">Review Before Generating</p>
                    <p>
                      Once generated, the NOC will be assigned a unique
                      reference number and saved in the system history. Please
                      ensure all dates and spellings are correct.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "history" && (
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <CardTitle>Issued Certificates</CardTitle>
                    <CardDescription>
                      Search and manage previously issued NOCs
                    </CardDescription>
                  </div>
                  <div className="relative w-full md:w-64">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search ref, event, or club..."
                      className="pl-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Ref No</TableHead>
                        <TableHead>Event Name</TableHead>
                        <TableHead>Organizer</TableHead>
                        <TableHead>Period</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoadingHistory ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8">
                            Loading records...
                          </TableCell>
                        </TableRow>
                      ) : filteredHistory.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={5}
                            className="text-center py-8 text-muted-foreground"
                          >
                            No certificates found matching your search
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredHistory.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="font-mono text-xs font-bold">
                              {item.refNo}
                            </TableCell>
                            <TableCell>{item.eventName}</TableCell>
                            <TableCell className="text-sm">
                              {item.organizerName}
                            </TableCell>
                            <TableCell className="text-xs">
                              {new Date(item.startDate).toLocaleDateString()} -{" "}
                              {new Date(item.endDate).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => loadHistoryIntoForm(item)}
                              >
                                <Eye className="h-4 w-4 mr-1" /> View
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "preview" && (
            <div className="space-y-6">
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Eye className="h-5 w-5 text-orange-600" />
                  <div>
                    <p className="text-sm font-semibold text-orange-900">
                      Certificate Preview Mode
                    </p>
                    <p className="text-xs text-orange-700">
                      Review the official document before printing.
                    </p>
                  </div>
                </div>
                <Button onClick={handleDownload} size="sm">
                  <Printer className="h-4 w-4 mr-2" /> Download & Print
                </Button>
              </div>

              <div className="bg-slate-100 p-4 md:p-8 rounded-xl border-2 border-dashed border-slate-300 overflow-x-auto flex justify-center">
                <NocCertificate values={values} />
              </div>
            </div>
          )}

          {activeTab === "settings" && (
            <Card>
              <CardHeader>
                <CardTitle>System Settings</CardTitle>
                <CardDescription>
                  Configure NOC templates and authority details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold">
                    Authority Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Signatory Designation</Label>
                      <Input defaultValue="Prodhan" />
                    </div>
                    <div className="space-y-2">
                      <Label>Gram Panchayat Name</Label>
                      <Input value={values.gpName} disabled />
                    </div>
                  </div>
                </div>
                <Separator />
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold">
                    Template Configuration
                  </h3>
                  <p className="text-xs text-muted-foreground italic">
                    Standard legal conditions are currently hardcoded in the
                    certificate component for compliance.
                  </p>
                  <Button variant="outline" disabled>
                    Edit Standard Conditions
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
}
