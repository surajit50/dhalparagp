"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { MouzaMasterSchema, type MouzaMasterInput } from "@/schema/street-light";
import { mapMouzaToFormInput } from "@/lib/utils/street-light";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface MouzaFormProps {
  defaultValues?: Partial<MouzaMasterInput>;
  mouzaId?: string;
  existing?: NonNullable<Parameters<typeof mapMouzaToFormInput>[0]> & { id: string };
}

export function MouzaForm({ defaultValues, mouzaId, existing }: MouzaFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const isEdit = !!mouzaId;

  const initialDefaults = existing ? mapMouzaToFormInput(existing) : defaultValues;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<MouzaMasterInput>({
    resolver: zodResolver(MouzaMasterSchema),
    defaultValues: initialDefaults,
  });

  const mouzaCode = watch("mouzaCode");
  const sansadCode = watch("sansadCode");

  const handleMouzaCodeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setValue("mouzaCode", e.target.value.toUpperCase(), { shouldDirty: true });
    },
    [setValue]
  );

  const handleSansadCodeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setValue("sansadCode", e.target.value.toUpperCase(), { shouldDirty: true });
    },
    [setValue]
  );

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
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to save");
      }
      toast.success(isEdit ? "Mouza updated successfully" : "Mouza created successfully");
      router.push("/admindashboard/street-lights/mouza");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5 md:col-span-2">
          <Label htmlFor="mouzaName">Mouza Name *</Label>
          <Input id="mouzaName" {...register("mouzaName")} placeholder="e.g. Dhalpara" />
          {errors.mouzaName && (
            <p className="text-xs text-destructive">{errors.mouzaName.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="jlNo">JL No.</Label>
          <Input id="jlNo" {...register("jlNo")} placeholder="e.g. 045" />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="gramSansad">Gram Sansad *</Label>
          <Input
            id="gramSansad"
            {...register("gramSansad")}
            placeholder="e.g. Lalpur Sansad"
          />
          {errors.gramSansad && (
            <p className="text-xs text-destructive">{errors.gramSansad.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="ward">Ward / Area</Label>
          <Input id="ward" {...register("ward")} placeholder="e.g. Ward No. 3" />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="mouzaCode">
            Mouza Code *
            <span className="ml-1 text-xs text-muted-foreground font-normal">
              (used in Light ID — e.g. DHP)
            </span>
          </Label>
          <Input
            id="mouzaCode"
            {...register("mouzaCode", { onChange: handleMouzaCodeChange })}
            placeholder="e.g. DHP"
            maxLength={6}
            className="uppercase font-mono"
          />
          {errors.mouzaCode && (
            <p className="text-xs text-destructive">{errors.mouzaCode.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="sansadCode">
            Sansad Code
            <span className="ml-1 text-xs text-muted-foreground font-normal">
              (used in Light ID — e.g. LAL)
            </span>
          </Label>
          <Input
            id="sansadCode"
            {...register("sansadCode", { onChange: handleSansadCodeChange })}
            placeholder="e.g. LAL"
            maxLength={6}
            className="uppercase font-mono"
          />
          {errors.sansadCode && (
            <p className="text-xs text-destructive">{errors.sansadCode.message}</p>
          )}
        </div>
      </div>

      <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
        <p className="text-sm font-medium text-orange-800 mb-1">
          Generated Light ID format:
        </p>
        <p className="font-mono text-base text-orange-700 font-bold">
          GP-SL-{mouzaCode || "???"}-{sansadCode || "GEN"}-0001
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
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
