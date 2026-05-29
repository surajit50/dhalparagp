"use client";

import React, { useState } from "react";
import { TableRow, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Save, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { ccerSchema } from "@/schema/ccer";
import { z } from "zod";
import { saveCcerActual, deleteCcerActual } from "@/action/ccer-actions";
import { toast } from "sonner";

interface CcerRowFormProps {
  index: number;
  initialData: any;
  financialYear: string;
  onUpdate: (index: number, data: any) => void;
  onDelete: (index: number) => void;
  onSaveSuccess: () => void;
}

export function CcerRowForm({
  index,
  initialData,
  financialYear,
  onUpdate,
  onDelete,
  onSaveSuccess,
}: CcerRowFormProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const form = useForm<z.infer<typeof ccerSchema>>({
    resolver: zodResolver(ccerSchema),
    defaultValues: {
      financialYear: financialYear,
      fundName: initialData.fundName || "",
      openingBalance: initialData.openingBalance || 0,
      receipts: initialData.receipts || 0,
      arthoOParikalpana: initialData.arthoOParikalpana || 0,
      krishi: initialData.krishi || 0,
      pranisampadBikash: initialData.pranisampadBikash || 0,
      siksha: initialData.siksha || 0,
      janaswasthya: initialData.janaswasthya || 0,
      nariOSishuUnnoyan: initialData.nariOSishuUnnoyan || 0,
      samajkalyan: initialData.samajkalyan || 0,
      silpa: initialData.silpa || 0,
      parikathamo: initialData.parikathamo || 0,
    },
  });

  // Watch values to update parent state for dynamic totals
  React.useEffect(() => {
    const subscription = form.watch((value) => {
      onUpdate(index, value);
    });
    return () => subscription.unsubscribe();
  }, [form, index, onUpdate]);

  const calculateTotal = (data: any) => {
    return (
      (Number(data.arthoOParikalpana) || 0) +
      (Number(data.krishi) || 0) +
      (Number(data.pranisampadBikash) || 0) +
      (Number(data.siksha) || 0) +
      (Number(data.janaswasthya) || 0) +
      (Number(data.nariOSishuUnnoyan) || 0) +
      (Number(data.samajkalyan) || 0) +
      (Number(data.silpa) || 0) +
      (Number(data.parikathamo) || 0)
    );
  };

  const onSubmit = async (values: z.infer<typeof ccerSchema>) => {
    const res = await saveCcerActual(values);
    if (res.success) {
      toast.success("Saved!");
      onSaveSuccess();
    } else {
      toast.error(res.message);
    }
  };

  const handleDelete = async () => {
    if (initialData.id) {
      setIsDeleting(true);
      const res = await deleteCcerActual(initialData.id);
      setIsDeleting(false);
      if (res.success) {
        toast.success(res.message);
        onDelete(index);
      } else {
        toast.error(res.message);
      }
    } else {
      onDelete(index);
    }
  };

  const currentValues = form.getValues();

  return (
    <Form {...form}>
      {/* We don't render a <form> tag because it's invalid inside a <tbody> */}
      <TableRow className="hover:bg-blue-50/50 group">
        <TableCell className="p-1 border-r border-gray-200 text-center font-medium text-xs text-gray-500">
          {index + 1}
        </TableCell>
        
        <TableCell className="p-1 border-r border-gray-200">
          <FormField control={form.control} name="fundName" render={({ field }) => (
            <FormItem className="space-y-0"><FormControl>
              <Input {...field} className="h-8 text-[11px] font-medium rounded-md border-transparent group-hover:border-gray-200 focus-visible:border-blue-500 focus-visible:ring-1 bg-transparent" placeholder="Fund name..." />
            </FormControl></FormItem>
          )} />
        </TableCell>

        <TableCell className="p-1 border-r border-gray-200 bg-gray-50/50">
          <FormField control={form.control} name="receipts" render={({ field }) => (
            <FormItem className="space-y-0"><FormControl>
              <Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} className="h-8 text-[11px] text-right tabular-nums rounded-md border-transparent group-hover:border-gray-300 focus-visible:border-blue-500 focus-visible:ring-1 bg-transparent" />
            </FormControl></FormItem>
          )} />
        </TableCell>

        {['arthoOParikalpana', 'krishi', 'pranisampadBikash', 'siksha', 'janaswasthya', 'nariOSishuUnnoyan', 'samajkalyan', 'silpa', 'parikathamo'].map((fieldName) => (
          <TableCell key={fieldName} className="p-1 border-r border-gray-200">
            <FormField control={form.control} name={fieldName as any} render={({ field }) => (
              <FormItem className="space-y-0"><FormControl>
                <Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} className="h-8 text-[11px] text-right tabular-nums rounded-md border-transparent group-hover:border-gray-300 focus-visible:border-blue-500 focus-visible:ring-1 bg-transparent" />
              </FormControl></FormItem>
            )} />
          </TableCell>
        ))}

        <TableCell className="p-2 border-r border-gray-200 text-right font-bold text-[11px] tabular-nums bg-green-50/50 text-green-800">
          ₹ {calculateTotal(currentValues).toLocaleString("en-IN")}
        </TableCell>

        <TableCell className="p-1 text-center">
          <div className="flex items-center justify-center gap-1">
            <Button size="icon" variant="ghost" onClick={form.handleSubmit(onSubmit)} disabled={form.formState.isSubmitting} className="h-7 w-7 text-green-600 hover:text-green-700 hover:bg-green-50">
              {form.formState.isSubmitting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-4 w-4" />}
            </Button>
            <Button size="icon" variant="ghost" onClick={handleDelete} disabled={isDeleting || form.formState.isSubmitting} className="h-7 w-7 text-red-500 hover:text-red-700 hover:bg-red-50">
              {isDeleting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            </Button>
          </div>
        </TableCell>
      </TableRow>
    </Form>
  );
}
