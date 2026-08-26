"use client";

import useSWR from "swr";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Lightbulb, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface MouzaRecord {
  id: string;
  mouzaName: string;
  jlNo?: string;
  gramSansad: string;
  ward?: string;
  mouzaCode: string;
  sansadCode?: string;
  totalLights: number;
  activeLights: number;
  defectiveLights: number;
}

export function MouzaTable() {
  const router = useRouter();
  const { data: mouzas, isLoading, mutate } = useSWR<MouzaRecord[]>("/api/mouza-master", fetcher);
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      const res = await fetch(`/api/mouza-master/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      toast.success("Mouza deleted");
      mutate();
    } catch {
      toast.error("Failed to delete mouza");
    } finally {
      setDeleting(null);
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-lg border border-border/50 bg-card overflow-hidden">
        <div className="p-8 text-center text-muted-foreground animate-pulse">
          Loading mouza data…
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          {mouzas?.length ?? 0} Mouza{mouzas?.length !== 1 ? "s" : ""} registered
        </p>
        <Button
          onClick={() => router.push("/admindashboard/street-lights/mouza/add")}
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Mouza
        </Button>
      </div>

      <div className="rounded-lg border border-border/50 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Mouza Name</TableHead>
              <TableHead>JL No.</TableHead>
              <TableHead>Gram Sansad</TableHead>
              <TableHead>Code</TableHead>
              <TableHead className="text-center">Total</TableHead>
              <TableHead className="text-center">Active</TableHead>
              <TableHead className="text-center">Defective</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mouzas?.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                  No Mouza records found. Add the first one.
                </TableCell>
              </TableRow>
            )}
            {mouzas?.map((m) => (
              <TableRow key={m.id} className="hover:bg-muted/30 transition-colors">
                <TableCell className="font-medium">{m.mouzaName}</TableCell>
                <TableCell className="text-muted-foreground">{m.jlNo ?? "—"}</TableCell>
                <TableCell>{m.gramSansad}</TableCell>
                <TableCell>
                  <span className="font-mono text-xs bg-orange-50 text-orange-700 border border-orange-200 px-2 py-0.5 rounded">
                    {m.mouzaCode}{m.sansadCode ? `-${m.sansadCode}` : ""}
                  </span>
                </TableCell>
                <TableCell className="text-center">
                  <span className="inline-flex items-center gap-1 font-semibold text-foreground">
                    <Lightbulb className="w-3.5 h-3.5 text-orange-400" />
                    {m.totalLights}
                  </span>
                </TableCell>
                <TableCell className="text-center">
                  <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {m.activeLights}
                  </span>
                </TableCell>
                <TableCell className="text-center">
                  <span className="inline-flex items-center gap-1 text-red-700 font-medium">
                    <XCircle className="w-3.5 h-3.5" />
                    {m.defectiveLights}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        router.push(`/admindashboard/street-lights/mouza/${m.id}/edit`)
                      }
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          disabled={deleting === m.id}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete {m.mouzaName}?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will delete the Mouza record. Street light records in this
                            Mouza must be removed first. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-destructive hover:bg-destructive/90"
                            onClick={() => handleDelete(m.id)}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
