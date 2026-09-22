import {
  fetchNregaWorks,
  fetchNregaFinancialYears,
  fetchNregaGramSansads,
} from "@/action/nrega/work-actions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";
import { WorksFilterBar } from "@/components/nrega/WorksFilterBar";
import { WorksTable } from "@/components/nrega/WorksTable";
import { nregaWorkToCsvRow } from "@/lib/utils/nrega";

const PAGE_SIZE = 20;

interface PageProps {
  searchParams: Promise<{ page?: string; search?: string; fy?: string; status?: string; gs?: string }>;
}

function buildPageUrl(
  pageNum: number,
  search: string,
  fy: string,
  status: string,
  gs: string
): string {
  const qs = new URLSearchParams();
  if (pageNum > 1) qs.set("page", String(pageNum));
  if (search) qs.set("search", search);
  if (fy) qs.set("fy", fy);
  if (status) qs.set("status", status);
  if (gs) qs.set("gs", gs);
  const qsStr = qs.toString();
  return qsStr ? `?${qsStr}` : "";
}

export default async function WorksListPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const parsedPage = Number.parseInt(params.page || "1", 10);
  const page = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;
  const search = params.search || "";
  const fy = params.fy || "";
  const status = params.status || "";
  const gs = params.gs || "";

  const [worksResult, financialYears, gramSansads] = await Promise.all([
    fetchNregaWorks(page, PAGE_SIZE, search, fy, status, gs),
    fetchNregaFinancialYears(),
    fetchNregaGramSansads(),
  ]);

  const { works, totalCount, hasMore } = worksResult;

  // Build CSV rows once at server render; pass to client WorksFilterBar (which handles onClick download)
  const csvRows = works.map(nregaWorkToCsvRow);
  const csvFilename = `nrega-works-${new Date().toISOString().slice(0, 10)}`;

  const startIdx = totalCount === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const endIdx = Math.min(page * PAGE_SIZE, totalCount);
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">NREGA Works</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {totalCount.toLocaleString("en-IN")} total work{totalCount !== 1 ? "s" : ""}
            {page > 1 && (
              <span className="ml-2 text-xs">
                · Page {page} of {totalPages}
              </span>
            )}
          </p>
        </div>
        <Link href="/employeedashboard/nrega/works/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Work
          </Button>
        </Link>
      </div>

      {/* Filters + CSV Export (export button lives inside WorksFilterBar — it is a Client Component) */}
      <Card className="border-muted/60">
        <CardContent className="p-4">
          <WorksFilterBar
            financialYears={financialYears}
            gramSansads={gramSansads}
          
            csvFilename={csvFilename}
          />
        </CardContent>
      </Card>

      {/* Works Table */}
      <WorksTable works={works} />

      {/* Pagination */}
      {totalCount > PAGE_SIZE && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 pb-1">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-medium text-foreground">{startIdx}</span>
            {" – "}
            <span className="font-medium text-foreground">{endIdx}</span>
            {" of "}
            <span className="font-medium text-foreground">
              {totalCount.toLocaleString("en-IN")}
            </span>
          </p>
          <div className="flex items-center gap-2">
            {page > 1 && (
              <Button variant="outline" size="sm" asChild>
                <Link href={buildPageUrl(page - 1, search, fy, status, gs)}>
                  ‹ Previous
                </Link>
              </Button>
            )}
            <span className="text-xs text-muted-foreground px-2 tabular-nums min-w-[60px] text-center">
              Page {page} / {totalPages}
            </span>
            {hasMore && (
              <Button variant="outline" size="sm" asChild>
                <Link href={buildPageUrl(page + 1, search, fy, status, gs)}>
                  Next ›
                </Link>
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}