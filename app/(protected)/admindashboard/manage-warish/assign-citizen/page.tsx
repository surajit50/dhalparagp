import { db } from "@/lib/db";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FormSubmitButton from "@/components/FormSubmitButton";
import { revalidatePath } from "next/cache";
import { Search, Filter, Download } from "lucide-react";
import { Input } from "@/components/ui/input";

export default async function WarishApplicationTable() {
  const [pending, assigned] = await Promise.all([
    db.warishApplication.findMany({
      where: {
        warishApplicationStatus: "submitted",
        User: { role: "user" }
      },
      include: { User: true },
      orderBy: { createdAt: "desc" },
    }),
    db.warishApplication.findMany({
      where: {
        warishApplicationStatus: "process",
        assingstaffId: { not: null }
      },
      include: { User: true },
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  const staff = await db.user.findMany({
    where: { 
role: "staff",
      userStatus: "active"

     },
    select: { id: true, name: true },
  });

  const staffIds = assigned.map(app => app.assingstaffId).filter(Boolean) as string[];
  const staffMembers = await db.user.findMany({
    where: { role: "staff" },
    select: { id: true, name: true },
  });


  async function assignStaff(formData: FormData) {
    "use server";
    try {
      const applicationId = formData.get("applicationId")?.toString();
      const staffId = formData.get("staffId")?.toString();

      if (!applicationId || !staffId) {
        throw new Error("Missing required fields");
      }

      await db.warishApplication.update({
        where: { id: applicationId },
        data: {
          assingstaffId: staffId,
          warishApplicationStatus: "process",
        },
      });

      revalidatePath("/admindashboard/manage-warish/asingwarishtostaff");
    } catch (error) {
      console.error("Assignment failed:", error);
    }
  }

  return (
    <div className="space-y-4">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">Warish Applications</h1>
          <p className="text-sm text-muted-foreground">
            Manage pending and assigned warish applications
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search applications..."
              className="pl-10 w-[200px]"
            />
          </div>
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </Button>
        </div>
      </div>

      {/* Tabs Section */}
      <Tabs defaultValue="pending">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="pending">
            Pending ({pending.length})
          </TabsTrigger>
          <TabsTrigger value="assigned">
            Assigned ({assigned.length})
          </TabsTrigger>
        </TabsList>

        {/* Pending Applications Tab */}
        <TabsContent value="pending">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>App ID</TableHead>
                  <TableHead>Applicant</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Assign To</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pending.map((application) => (
                  <TableRow key={application.id}>
                    <TableCell>
                      <Badge variant="secondary" className="font-mono">
                        {application.acknowlegment}
                      </Badge>
                    </TableCell>
                    <TableCell>{application.User?.name}</TableCell>
                    <TableCell>
                      {format(application.createdAt, "dd MMM yyyy")}
                    </TableCell>
                    <TableCell>
                      <form action={assignStaff} className="flex gap-2">
                        <input
                          type="hidden"
                          name="applicationId"
                          value={application.id}
                        />
                        <Select name="staffId">
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select staff" />
                          </SelectTrigger>
                          <SelectContent>
                            {staff.map((staffMember) => (
                              <SelectItem
                                key={staffMember.id}
                                value={staffMember.id}
                              >
                                {staffMember.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormSubmitButton>Assign</FormSubmitButton>
                      </form>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {pending.length === 0 && (
              <div className="p-6 text-center text-muted-foreground">
                No pending applications found
              </div>
            )}
          </div>
        </TabsContent>

        {/* Assigned Applications Tab */}
        <TabsContent value="assigned">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>App ID</TableHead>
                  <TableHead>Applicant</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Assigned Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assigned.map((application) => {
                  const staff = staffMembers.find(s => s.id === application.assingstaffId);
                  return (
                    <TableRow key={application.id}>
                      <TableCell>
                        <Badge variant="secondary" className="font-mono">
                          {application.acknowlegment}
                        </Badge>
                      </TableCell>
                      <TableCell>{application.User?.name}</TableCell>
                      <TableCell>
                        {staff?.name || "Unassigned"}
                      </TableCell>
                      <TableCell>
                        {format(application.updatedAt, "dd MMM yyyy")}
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-blue-100 text-blue-800">
                          In Process
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            
            {assigned.length === 0 && (
              <div className="p-6 text-center text-muted-foreground">
                No assigned applications found
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
