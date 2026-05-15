"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import CorrectionRequestReview from "./correction-request-review";
import CorrectionRequestForm from "./correction-request-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Loader2, 
  Search, 
  User, 
  FileText, 
  Users, 
  Calendar, 
  MapPin, 
  Phone,
  History,
  PenTool,
  ArrowRight,
  Sparkles,
  ChevronRight
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDate } from "@/utils/utils";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

// Component Props
interface EnhancedCorrectionSearchProps {
  initialRequests: any[];
  initialApp: any;
}

export default function EnhancedCorrectionSearch({
  initialRequests,
  initialApp,
}: EnhancedCorrectionSearchProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [app, setApp] = useState(initialApp);
  const [requests, setRequests] = useState(initialRequests);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [details, setDetails] = useState<any[]>([]);

  // Initialize with props
  useEffect(() => {
    if (initialApp) {
      setApp(initialApp);
      setDetails(initialApp.details || []);
    }
    if (initialRequests) {
      setRequests(initialRequests);
    }
  }, [initialApp, initialRequests]);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    setRequests([]);
    setApp(null);
    setDetails([]);

    try {
      const res = await fetch(`/api/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ searchQuery }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Failed to fetch application");
      }

      const foundApp = data?.app || data;
      if (!foundApp?.id) {
        throw new Error("No application found for this query");
      }

      // Navigate to the dedicated correction page
      router.push(`/employeedashboard/warish/apply-correction/${foundApp.id}`);
      
      // Fallback local state update
      setApp(foundApp);
      setDetails(foundApp.details || []);
      await fetchRequests(foundApp.id);
    } catch (err: any) {
      setError(err.message || "An error occurred while searching");
    } finally {
      setLoading(false);
    }
  }

  async function fetchRequests(warishApplicationId: string) {
    try {
      const reqRes = await fetch(
        `/api/warish-correction-requests?warishApplicationId=${warishApplicationId}`
      );

      if (!reqRes.ok) {
        throw new Error("Failed to fetch correction requests");
      }

      const reqData = await reqRes.json();
      setRequests(reqData.requests || []);
    } catch (err) {
      console.error("Failed to fetch requests:", err);
    }
  }

  const handleRequestReviewed = () => {
    if (app) {
      fetchRequests(app.id);
    }
  };

  const handleRequestSubmitted = () => {
    if (app) {
      fetchRequests(app.id);
    }
  };

  // Define available fields for correction
  const applicationFields = [
    { value: "applicantName", label: "Applicant Name", currentValue: app?.applicantName, icon: User },
    { value: "applicantMobileNumber", label: "Mobile Number", currentValue: app?.applicantMobileNumber, icon: Phone },
    { value: "relationwithdeceased", label: "Relation with Deceased", currentValue: app?.relationwithdeceased, icon: Users },
    { value: "nameOfDeceased", label: "Name of Deceased", currentValue: app?.nameOfDeceased, icon: User },
    { value: "fatherName", label: "Father Name", currentValue: app?.fatherName, icon: User },
    { value: "spouseName", label: "Spouse Name", currentValue: app?.spouseName, icon: User },
    { value: "villageName", label: "Village Name", currentValue: app?.villageName, icon: MapPin },
    { value: "postOffice", label: "Post Office", currentValue: app?.postOffice, icon: MapPin },
  ];

  // Detail fields for each heir
  const detailFields = (detail: any) => [
    { value: "name", label: "Heir Name", currentValue: detail?.name, icon: User },
    { value: "gender", label: "Gender", currentValue: detail?.gender, icon: Users },
    { value: "relation", label: "Relation", currentValue: detail?.relation, icon: Users },
    { value: "livingStatus", label: "Living Status", currentValue: detail?.livingStatus, icon: User },
    { value: "maritialStatus", label: "Marital Status", currentValue: detail?.maritialStatus, icon: Users },
    { value: "hasbandName", label: "Husband Name", currentValue: detail?.hasbandName || "", icon: User },
  ];

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl space-y-8 animate-in fade-in zoom-in-95 duration-500">
      
      {/* Hero Search Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-background dark:via-muted/20 dark:to-background p-8 md:p-12 text-white shadow-2xl ring-1 ring-white/10">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay pointer-events-none"></div>
        <div className="relative z-10 max-w-2xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white/80 text-xs font-medium backdrop-blur-sm border border-white/10 shadow-sm">
            <Sparkles className="w-3 h-3 text-yellow-300" />
            <span>Apply for Corrections Instantly</span>
          </div>
          
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-white drop-shadow-sm">
            Find Your Application
          </h1>
          <p className="text-slate-300 text-lg md:text-xl font-light">
            Search by Acknowledgment No, Reference No, or Name to request modifications or track status.
          </p>
          
          <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-md mt-8 overflow-hidden">
            <CardContent className="p-2">
              <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1 group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors duration-300" />
                  <Input 
                    type="text"
                    className="pl-12 h-14 border-0 bg-transparent text-lg focus-visible:ring-0 placeholder:text-muted-foreground/50 text-foreground w-full" 
                    placeholder="Enter details here..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <Button 
                  type="submit" 
                  size="lg" 
                  disabled={loading || !searchQuery.trim()}
                  className="h-14 px-8 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300 rounded-lg sm:rounded-md"
                >
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      Search
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
          
          {error && (
            <div className="mt-4 p-3 bg-red-500/10 backdrop-blur-sm border border-red-500/20 text-red-200 text-sm rounded-lg inline-flex items-center gap-2 animate-in slide-in-from-top-2">
              <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
              {error}
            </div>
          )}
        </div>
      </div>

      {/* Results Section */}
      {app && (
        <div className="grid gap-8 animate-in slide-in-from-bottom-8 duration-700 ease-out fill-mode-forwards delay-100">
          
          {/* Detailed Application Header */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-3 border-l-4 border-l-primary shadow-md overflow-hidden bg-background/50 backdrop-blur-sm">
               <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                 <FileText className="w-32 h-32" />
               </div>
               <CardContent className="p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
                 <div className="space-y-2">
                   <div className="flex items-center gap-3">
                     <h2 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
                       {app.applicantName}
                     </h2>
                     <Badge 
                       variant={
                         app.status === "approved" ? "default" : 
                         app.status === "rejected" ? "destructive" : "secondary"
                       } 
                       className="text-sm px-3 py-1 uppercase tracking-wide font-semibold shadow-sm"
                     >
                       {app.status || "Pending"}
                     </Badge>
                   </div>
                   
                   <div className="flex flex-wrap gap-4 text-muted-foreground">
                     <div className="flex items-center gap-1.5 bg-muted/50 px-3 py-1 rounded-full text-sm border">
                       <FileText className="w-4 h-4 text-primary/70" /> 
                       <span className="font-mono">{app.acknowlegment || "No ACK"}</span>
                     </div>
                     <div className="flex items-center gap-1.5 bg-muted/50 px-3 py-1 rounded-full text-sm border">
                       <Calendar className="w-4 h-4 text-primary/70" /> 
                       <span>Submitted: {formatDate(app.createdAt)}</span>
                     </div>
                     <div className="flex items-center gap-1.5 bg-muted/50 px-3 py-1 rounded-full text-sm border">
                       <MapPin className="w-4 h-4 text-primary/70" /> 
                       <span>{app.villageName}, {app.postOffice}</span>
                     </div>
                   </div>
                 </div>
               </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="apply" className="w-full space-y-8">
            <div className="flex items-center justify-between border-b pb-0">
               <TabsList className="h-auto p-0 bg-transparent gap-8 rounded-none">
                 <TabsTrigger 
                   value="apply" 
                   className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary px-1 pb-4 pt-2 text-base font-medium transition-all hover:text-primary/80"
                 >
                   <div className="flex items-center gap-2">
                     <PenTool className="w-4 h-4" />
                     Apply Correction
                   </div>
                 </TabsTrigger>
                 <TabsTrigger 
                   value="history" 
                   className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary px-1 pb-4 pt-2 text-base font-medium transition-all hover:text-primary/80"
                 >
                   <div className="flex items-center gap-2">
                     <History className="w-4 h-4" />
                     Request History
                     {requests.length > 0 && (
                       <Badge variant="secondary" className="ml-1 h-5 min-w-[1.25rem] px-1 pointer-events-none">
                         {requests.length}
                       </Badge>
                     )}
                   </div>
                 </TabsTrigger>
               </TabsList>
            </div>

            <TabsContent value="apply" className="mt-0 focus-visible:outline-none">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Left Column: Application Details & Current Info */}
                <div className="lg:col-span-4 space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary" />
                      Original Details
                    </h3>
                  </div>
                  
                  <Card className="border-0 shadow-md bg-muted/20 backdrop-blur-sm">
                    <CardContent className="p-0">
                      <div className="divide-y divide-border/50">
                        {applicationFields.map((field, i) => (
                          <div key={field.value} className={cn(
                            "group flex items-center justify-between p-4 hover:bg-background/80 transition-colors",
                            i === 0 && "rounded-t-lg",
                            i === applicationFields.length - 1 && "rounded-b-lg"
                          )}>
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-background rounded-full shadow-sm text-muted-foreground group-hover:text-primary transition-colors border">
                                <field.icon className="w-4 h-4" />
                              </div>
                              <div className="space-y-0.5">
                                <Label className="text-xs text-muted-foreground font-normal">{field.label}</Label>
                                <div className="font-medium text-sm text-foreground/90 truncate max-w-[180px]" title={field.currentValue}>
                                  {field.currentValue || "N/A"}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Right Column: Interactive Correction Area */}
                <div className="lg:col-span-8 space-y-6">
                  <div className="flex flex-col gap-6">
                    <Card className="overflow-hidden border shadow-sm transition-all hover:shadow-md">
                      <CardHeader className="bg-muted/30 border-b pb-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-lg font-bold text-foreground">Modify Application Information</CardTitle>
                            <CardDescription className="mt-1">
                              Need to change applicant name, address, or other general details? Start here.
                            </CardDescription>
                          </div>
                          <div className="p-2 bg-primary/10 rounded-full text-primary">
                            <FileText className="w-5 h-5" />
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-6">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-background/50 p-4 rounded-lg border border-dashed">
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <Info className="w-4 h-4 text-orange-500" />
                            <span>Select a field to request a correction. Admin approval required.</span>
                          </div>
                          <CorrectionRequestForm
                            warishApplicationId={app.id}
                            targetType="application"
                            availableFields={applicationFields}
                            onRequestSubmitted={handleRequestSubmitted}
                            requesterName={app.applicantName || ""}
                          />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="overflow-hidden border shadow-sm transition-all hover:shadow-md">
                      <CardHeader className="bg-muted/30 border-b pb-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-lg font-bold text-foreground">Modify Warish (Heir) Details</CardTitle>
                            <CardDescription className="mt-1">
                              Select a family member below to correct their specific information.
                            </CardDescription>
                          </div>
                          <div className="p-2 bg-primary/10 rounded-full text-primary">
                            <Users className="w-5 h-5" />
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-0">
                        {details.length > 0 ? (
                          <div className="divide-y">
                            {details.map((detail, index) => (
                              <div key={detail.id || index} className="group p-4 sm:p-6 hover:bg-muted/20 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <div className="flex items-start gap-4">
                                  <div className="mt-1 h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shadow-sm border border-primary/20 group-hover:scale-105 transition-transform">
                                    {detail.name?.charAt(0) || <User className="w-5 h-5" />}
                                  </div>
                                  <div>
                                    <h4 className="font-semibold text-base text-foreground group-hover:text-primary transition-colors">
                                      {detail.name}
                                    </h4>
                                    <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-muted-foreground">
                                      <Badge variant="outline" className="font-normal capitalize bg-background/50">
                                        {detail.relation}
                                      </Badge>
                                      <span>•</span>
                                      <span className="capitalize">{detail.gender}</span>
                                      <span>•</span>
                                      <span className="capitalize">{detail.livingStatus}</span>
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="w-full sm:w-auto pl-14 sm:pl-0">
                                  <CorrectionRequestForm
                                    warishApplicationId={app.id}
                                    warishDetailId={detail.id}
                                    targetType="detail"
                                    availableFields={detailFields(detail)}
                                    onRequestSubmitted={handleRequestSubmitted}
                                    requesterName={app.applicantName || ""}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center py-12 text-center space-y-3 text-muted-foreground bg-muted/5">
                            <Users className="w-12 h-12 text-muted-foreground/30" />
                            <p>No warish details found for this application.</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="history" className="focus-visible:outline-none">
              <Card className="border-0 shadow-lg overflow-hidden">
                <CardHeader className="bg-muted/30 border-b pb-4">
                  <div className="flex items-center gap-2">
                    <History className="w-5 h-5 text-primary" />
                    <div>
                         <CardTitle className="text-lg">Request History</CardTitle>
                         <CardDescription>Track the status of your submitted correction requests</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <CorrectionRequestReview
                    requests={requests}
                    onRequestReviewed={handleRequestReviewed}
                    viewMode="list" 
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}

      {/* Empty State / Initial Instructions */}
      {!app && !loading && !error && (
        <div className="text-center max-w-lg mx-auto py-12 space-y-4 animate-in fade-in duration-700 delay-300">
           <div className="p-4 bg-muted/20 rounded-full w-fit mx-auto mb-4">
             <Search className="w-8 h-8 text-muted-foreground/50" />
           </div>
           <h3 className="text-lg font-medium text-foreground">Ready to search?</h3>
           <p className="text-muted-foreground">
             Enter your application details above to find your record. You&apos;ll be able to review all information and request specific corrections directly.
           </p>
        </div>
      )}
    </div>
  );
}

function Info({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </svg>
  );
}
