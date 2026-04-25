"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Filter, Trash2 } from "lucide-react";
import { formatDate } from "@/utils/utils";
import { gpcode } from "@/constants/gpinfor";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import NitActions from "@/components/manage-tender/NitActions";
import ViewAllButton from "@/components/manage-tender/ViewAllButton";
import { deleteNitAction } from "@/action/bookNitNuber";
import { NitDetailsProps } from "@/types/tender-manage";

type RecentTendersTableProps = {
  nits: NitDetailsProps[];
};

export default function RecentTendersTable({ nits }: RecentTendersTableProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "published" | "draft">("all");

  const handleDelete = async (id: string) => {
    try {
      const res = await deleteNitAction(id);
      if (res.success) {
        toast({
          title: "NIT deleted successfully",
        });
        router.refresh();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete NIT",
        variant: "destructive",
      });
    }
  };

  const filteredNits = nits.filter((nit) => {
    const memoDate = typeof nit.memoDate === "string" ? new Date(nit.memoDate) : nit.memoDate;
    const memoYear = memoDate.getFullYear();
    const memoNumberStr = nit.memoNumber.toString();
    const matchesSearch =
      memoNumberStr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      `${memoNumberStr}/${gpcode}/${memoYear}`.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter =
      filterStatus === "all" ||
      (filterStatus === "published" && nit.isPublished) ||
      (filterStatus === "draft" && !nit.isPublished);

    return matchesSearch && matchesFilter;
  });

  return (
    <Card className="shadow-lg">
      <CardHeader className="border-b">
        <CardTitle>Recent Tenders</CardTitle>
        <CardDescription>
          Last 10 created tender notices
        </CardDescription>

        <div className="flex items-center gap-2 pt-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Search tenders..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuCheckboxItem
                checked={filterStatus === "all"}
                onCheckedChange={() => setFilterStatus("all")}
              >
                All
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={filterStatus === "published"}
                onCheckedChange={() => setFilterStatus("published")}
              >
                Published
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={filterStatus === "draft"}
                onCheckedChange={() => setFilterStatus("draft")}
              >
                Draft
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Memo Number</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filteredNits.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center">
                  No NITs found
                </TableCell>
              </TableRow>
            ) : (
              filteredNits.map((nit) => (
                <TableRow key={nit.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">
                        {nit.memoNumber}/{gpcode}/
                        {(typeof nit.memoDate === "string" ? new Date(nit.memoDate) : nit.memoDate).getFullYear()}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatDate(nit.createdAt)}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell>
                    <Badge
                      className={
                        nit.isPublished
                          ? "bg-green-100 text-green-800"
                          : "bg-amber-100 text-amber-800"
                      }
                    >
                      {nit.isPublished ? "Published" : "Draft"}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <NitActions nit={nit} />
                      {/**Delete button show if no work are added in the tender */}
                      {nit.WorksDetail.length === 0 && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(nit.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <div className="border-t p-4">
          <ViewAllButton />
        </div>
      </CardContent>
    </Card>
  );
}

