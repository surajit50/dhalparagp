"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

interface CancelledTendersPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

export function CancelledTendersPagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
}: CancelledTendersPaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("cancelledPage", String(page));
    router.push(`?${params.toString()}`);
  };

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // NIC style page numbers (max 5)
  const getPages = () => {
    const pages = [];
    const start = Math.max(1, currentPage - 2);
    const end = Math.min(totalPages, currentPage + 2);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-3 px-3 py-2 border-t bg-slate-50 rounded-b-md">

      {/* Govt Info */}
      <p className="text-xs text-muted-foreground">
        Showing <span className="font-semibold text-foreground">{startItem}</span>
        {" - "}
        <span className="font-semibold text-foreground">{endItem}</span>
        {" of "}
        <span className="font-semibold text-foreground">{totalItems}</span>
        {" cancelled tenders"}
      </p>

      {/* Pagination Controls */}
      <div className="flex items-center gap-1">

        <Button
          size="sm"
          variant="outline"
          disabled={currentPage === 1}
          onClick={() => handlePageChange(currentPage - 1)}
          className="h-8 px-2"
        >
          <ChevronLeft size={14} />
        </Button>

        {getPages().map((page) => (
          <Button
            key={page}
            size="sm"
            variant={page === currentPage ? "default" : "outline"}
            onClick={() => handlePageChange(page)}
            className="h-8 min-w-[34px] px-2 text-xs"
          >
            {page}
          </Button>
        ))}

        <Button
          size="sm"
          variant="outline"
          disabled={currentPage === totalPages}
          onClick={() => handlePageChange(currentPage + 1)}
          className="h-8 px-2"
        >
          <ChevronRight size={14} />
        </Button>

      </div>
    </div>
  );
}
