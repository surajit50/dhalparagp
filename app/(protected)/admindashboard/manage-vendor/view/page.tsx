import { db } from "@/lib/db";
import {
  Plus,
  Users,
  Building2,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/data-table";
import { columns } from "./columns";

export default async function VendorViewPage() {
  const agencyDetail = await db.agencyDetails.findMany({});

  const total = agencyDetail.length;
  const gstCount = agencyDetail.filter((a) => a.gst).length;
  const nonGst = total - gstCount;

  return (
    <div className="min-h-screen bg-muted/40">
      <div className="max-w-7xl mx-auto px-4 py-10 space-y-8">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight flex items-center gap-3">
              <Users className="h-7 w-7 text-primary" />
              Vendor Management
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage all registered vendors in one place.
            </p>
          </div>

          <Button asChild className="gap-2 rounded-lg">
            <Link href="/admindashboard/manage-vendor/registration">
              <Plus className="h-4 w-4" />
              Add Vendor
            </Link>
          </Button>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="rounded-xl border bg-background p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Vendors</p>
                <h2 className="text-2xl font-bold mt-1">{total}</h2>
              </div>
              <Building2 className="h-8 w-8 text-muted-foreground" />
            </div>
          </div>

          <div className="rounded-xl border bg-background p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">GST Registered</p>
                <h2 className="text-2xl font-bold mt-1 text-green-600">
                  {gstCount}
                </h2>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
          </div>

          <div className="rounded-xl border bg-background p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Non-GST Vendors</p>
                <h2 className="text-2xl font-bold mt-1 text-red-600">
                  {nonGst}
                </h2>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          </div>
        </div>

        {/* TABLE SECTION */}
        <div className="rounded-xl border bg-background shadow-sm">
          {agencyDetail.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">No Vendors Found</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Start by adding your first vendor.
              </p>

              <Button asChild className="mt-6 gap-2">
                <Link href="/admindashboard/manage-vendor/add">
                  <Plus className="h-4 w-4" />
                  Add Vendor
                </Link>
              </Button>
            </div>
          ) : (
            <div className="p-4">
              <DataTable columns={columns} data={agencyDetail} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
