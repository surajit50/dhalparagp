import { fetchNregaWorks, fetchNregaFinancialYears } from "@/action/nrega/work-actions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";
import { WorksFilterBar } from "@/components/nrega/WorksFilterBar";
import { WorksTable } from "@/components/nrega/WorksTable";

interface PageProps {
  searchParams: Promise<{ page?: string; search?: string; fy?: string; status?: string }>;
}

export default async function WorksListPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = parseInt(params.page || "1");
  const search = params.search || "";
  const fy = params.fy || "";
  const status = params.status || "";

  const [worksResult, financialYears] = await Promise.all([
    fetchNregaWorks(page, 20, search, fy, status),
    fetchNregaFinancialYears(),
  ]);

  const { works, totalCount, hasMore } = worksResult;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">NREGA Works</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {totalCount} total works
          </p>
        </div>
        <Link href="/employeedashboard/nrega/works/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Work
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <WorksFilterBar financialYears={financialYears} />
        </CardContent>
      </Card>

      {/* Works Table */}
      <WorksTable works={works} />

      {/* Pagination */}
      {totalCount > 20 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <p className="text-sm text-muted-foreground">
            Showing {(page - 1) * 20 + 1} - {Math.min(page * 20, totalCount)} of {totalCount}
          </p>
          <div className="flex gap-2">
            {page > 1 && (
              <Button variant="outline" size="sm" asChild>
                <Link href={`?page=${page - 1}&search=${search}&fy=${fy}&status=${status}`}>
                  Previous
                </Link>
              </Button>
            )}
            {hasMore && (
              <Button variant="outline" size="sm" asChild>
                <Link href={`?page=${page + 1}&search=${search}&fy=${fy}&status=${status}`}>
                  Next
                </Link>
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
