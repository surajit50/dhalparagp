"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import useSWR from "swr";
import { Loader2 } from "lucide-react";
import { MouzaMasterSchema, type MouzaMasterInput } from "@/schema/street-light";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface MouzaFormProps {
  defaultValues?: Partial<MouzaMasterInput>;
  mouzaId?: string; // if editing
}

export function MouzaForm({ defaultValues, mouzaId }: MouzaFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const isEdit = !!mouzaId;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<MouzaMasterInput>({
    resolver: zodResolver(MouzaMasterSchema),
    defaultValues,
  });

  // Auto-uppercase mouzaCode and sansadCode
  const mouzaCodeVal = watch("mouzaCode");
  const sansadCodeVal = watch("sansadCode");

  useEffect(() => {
    if (mouzaCodeVal) setValue("mouzaCode", mouzaCodeVal.toUpperCase());
  }, [mouzaCodeVal, setValue]);

  useEffect(() => {
    if (sansadCodeVal) setValue("sansadCode", sansadCodeVal.toUpperCase());
  }, [sansadCodeVal, setValue]);

  const onSubmit = async (data: MouzaMasterInput) => {
    setLoading(true);
    try {
      const url = isEdit ? `/api/mouza-master/${mouzaId}` : "/api/mouza-master";
      const method = isEdit ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to save");
      }
      toast.success(isEdit ? "Mouza updated successfully" : "Mouza created successfully");
      router.push("/admindashboard/street-lights/mouza");
      router.refresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Mouza Name */}
        <div className="space-y-1.5 md:col-span-2">
          <Label htmlFor="mouzaName">Mouza Name *</Label>
          <Input id="mouzaName" {...register("mouzaName")} placeholder="e.g. Dhalpara" />
          {errors.mouzaName && (
            <p className="text-xs text-destructive">{errors.mouzaName.message}</p>
          )}
        </div>

        {/* JL No */}
        <div className="space-y-1.5">
          <Label htmlFor="jlNo">JL No.</Label>
          <Input id="jlNo" {...register("jlNo")} placeholder="e.g. 045" />
        </div>

        {/* Gram Sansad */}
        <div className="space-y-1.5">
          <Label htmlFor="gramSansad">Gram Sansad *</Label>
          <Input id="gramSansad" {...register("gramSansad")} placeholder="e.g. Lalpur Sansad" />
          {errors.gramSansad && (
            <p className="text-xs text-destructive">{errors.gramSansad.message}</p>
          )}
        </div>

        {/* Ward */}
        <div className="space-y-1.5">
          <Label htmlFor="ward">Ward / Area</Label>
          <Input id="ward" {...register("ward")} placeholder="e.g. Ward No. 3" />
        </div>

        {/* Mouza Code */}
        <div className="space-y-1.5">
          <Label htmlFor="mouzaCode">
            Mouza Code *
            <span className="ml-1 text-xs text-muted-foreground font-normal">
              (used in Light ID — e.g. DHP)
            </span>
          </Label>
          <Input
            id="mouzaCode"
            {...register("mouzaCode")}
            placeholder="e.g. DHP"
            maxLength={6}
            className="uppercase font-mono"
          />
          {errors.mouzaCode && (
            <p className="text-xs text-destructive">{errors.mouzaCode.message}</p>
          )}
        </div>

        {/* Sansad Code */}
        <div className="space-y-1.5">
          <Label htmlFor="sansadCode">
            Sansad Code
            <span className="ml-1 text-xs text-muted-foreground font-normal">
              (used in Light ID — e.g. LAL)
            </span>
          </Label>
          <Input
            id="sansadCode"
            {...register("sansadCode")}
            placeholder="e.g. LAL"
            maxLength={6}
            className="uppercase font-mono"
          />
          {errors.sansadCode && (
            <p className="text-xs text-destructive">{errors.sansadCode.message}</p>
          )}
        </div>
      </div>

      {/* Light ID Preview */}
      <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
        <p className="text-sm font-medium text-orange-800 mb-1">
          Generated Light ID format:
        </p>
        <p className="font-mono text-base text-orange-700 font-bold">
          GP-SL-{watch("mouzaCode") || "???"}-{watch("sansadCode") || "GEN"}-0001
        </p>
        <p className="text-xs text-orange-600 mt-1">
          Serial number auto-increments per Mouza when lights are added.
        </p>
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={loading} className="gap-2">
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {isEdit ? "Update Mouza" : "Create Mouza"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
