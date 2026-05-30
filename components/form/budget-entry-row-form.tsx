"use client";

import React, { useState } from "react";
import { TableRow, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Save, Trash2, Pencil } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { budgetEntrySchema } from "@/schema/budget-entry";
import { z } from "zod";
import { saveBudgetEntry, deleteBudgetEntry } from "@/action/budget-entry-actions";
import { toast } from "sonner";
import { FUND_FULL_NAMES, STATUTORY_FUNDS } from "@/constants/funds";

interface BudgetEntryRowFormProps {
  index: number;
  initialData: any;
  financialYear: string;
  budgetType: "CURRENT_YEAR" | "NEXT_YEAR";
  onUpdate: (index: number, data: any) => void;
  onDelete: (index: number) => void;
  onSaveSuccess: () => void;
  isReadOnly?: boolean;
}

export function BudgetEntryRowForm({
  index,
  initialData,
  financialYear,
  budgetType,
  onUpdate,
  onDelete,
  onSaveSuccess,
  isReadOnly = false,
}: BudgetEntryRowFormProps) {
  const isNextYear = budgetType === "NEXT_YEAR";
  const osrCategory = STATUTORY_FUNDS.find(c => c.category.startsWith("(B)"));
  const isOsrCategory = osrCategory ? osrCategory.funds.includes(initialData.fundName) : false;
  const canEdit = !isNextYear || isOsrCategory;
  const isOwnFund = initialData.fundName === "Own Fund";
  const isOtherOsr = isOsrCategory && !isOwnFund;

  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(!initialData.id && canEdit);

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

  const form = useForm<z.infer<typeof budgetEntrySchema>>({
    resolver: zodResolver(budgetEntrySchema),
    defaultValues: {
      financialYear: financialYear,
      budgetType: budgetType,
      fundName: initialData.fundName || "",
      receipts: (!isOsrCategory && initialData.fundName !== "Own Fund") 
        ? calculateTotal(initialData) 
        : (initialData.receipts || 0),
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

  // Reset editing state if initialData.id changes (e.g. after successful save)
  React.useEffect(() => {
    setIsEditing(!initialData.id && canEdit);
  }, [initialData.id, canEdit]);

  // Watch values to update parent state for dynamic totals and auto-calc receipts
  React.useEffect(() => {
    const subscription = form.watch(() => {
      let currentVals = form.getValues();
      if (!isOtherOsr && !isOwnFund) {
        const newTotal = calculateTotal(currentVals);
        if (currentVals.receipts !== newTotal) {
          form.setValue('receipts', newTotal, { shouldValidate: true, shouldDirty: true });
          currentVals = form.getValues();
        }
      }
      onUpdate(index, currentVals);
    });
    return () => subscription.unsubscribe();
  }, [form, index, onUpdate, isOtherOsr, isOwnFund]);



  const onSubmit = async (values: z.infer<typeof budgetEntrySchema>) => {
    if (!canEdit) return;
    const res = await saveBudgetEntry(values);
    if (res.success) {
      toast.success("Saved!");
      setIsEditing(false);
      onSaveSuccess();
    } else {
      toast.error(res.message);
    }
  };

  const handleDelete = async () => {
    if (!canEdit) return;
    if (initialData.id) {
      setIsDeleting(true);
      const res = await deleteBudgetEntry(initialData.id);
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

  const getInputClassName = (isRightAlign = true, isDisabled = false) => {
    const finalIsDisabled = isDisabled || isReadOnly || !canEdit;
    return `h-8 text-[11px] ${isRightAlign ? "text-right tabular-nums" : "font-medium"} rounded-md border-transparent ${
      finalIsDisabled ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-transparent"
    } ${
      isEditing && !finalIsDisabled
        ? "group-hover:border-gray-300 focus-visible:border-blue-500 focus-visible:ring-1" 
        : "focus-visible:ring-0 cursor-default"
    }`;
  };

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
              <Input {...field} value={FUND_FULL_NAMES[field.value] || field.value} readOnly className={getInputClassName(false, true)} placeholder="Fund name..." />
            </FormControl></FormItem>
          )} />
        </TableCell>

        <TableCell className="p-1 border-r border-gray-200 bg-gray-50/50">
          <FormField control={form.control} name="receipts" render={({ field }) => (
            <FormItem className="space-y-0"><FormControl>
              <Input
                type="number"
                {...field}
                onChange={e => field.onChange(Number(e.target.value))}
                readOnly={!isEditing || !canEdit || isReadOnly || (!isOtherOsr && !isOwnFund)}
                className={getInputClassName(true, !isEditing || !canEdit || isReadOnly || (!isOtherOsr && !isOwnFund))}
              />
            </FormControl></FormItem>
          )} />
        </TableCell>

        {['arthoOParikalpana', 'krishi', 'pranisampadBikash', 'siksha', 'janaswasthya', 'nariOSishuUnnoyan', 'samajkalyan', 'silpa', 'parikathamo'].map((fieldName) => (
          <TableCell key={fieldName} className="p-1 border-r border-gray-200">
            {isOtherOsr ? (
              <div className="h-8 bg-gray-200/50 rounded-md flex items-center justify-center pattern-cross text-[10px] text-gray-400 border border-gray-200">-</div>
            ) : (
              <FormField control={form.control} name={fieldName as any} render={({ field }) => (
                <FormItem className="space-y-0"><FormControl>
                  <Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} readOnly={!isEditing || !canEdit || isReadOnly} className={getInputClassName(true, !isEditing || !canEdit || isReadOnly)} />
                </FormControl></FormItem>
              )} />
            )}
          </TableCell>
        ))}

        <TableCell className="p-1 border-r border-gray-200 text-right font-bold text-[11px] tabular-nums bg-green-50/50 text-green-800">
          {isOtherOsr ? (
            <div className="h-8 bg-gray-200/50 rounded-md flex items-center justify-center pattern-cross text-[10px] text-gray-400 border border-gray-200">-</div>
          ) : (
            `₹ ${calculateTotal(currentValues).toLocaleString("en-IN")}`
          )}
        </TableCell>

        {!isReadOnly && (
          <TableCell className="p-1 text-center">
            {canEdit && (
              <div className="flex items-center justify-center gap-1">
                {!isEditing ? (
                  <Button type="button" size="icon" variant="ghost" onClick={(e) => { e.preventDefault(); setIsEditing(true); }} className="h-7 w-7 text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                    <Pencil className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button type="button" size="icon" variant="ghost" onClick={form.handleSubmit(onSubmit)} disabled={form.formState.isSubmitting} className="h-7 w-7 text-green-600 hover:text-green-700 hover:bg-green-50">
                    {form.formState.isSubmitting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-4 w-4" />}
                  </Button>
                )}
                <Button type="button" size="icon" variant="ghost" onClick={handleDelete} disabled={isDeleting || form.formState.isSubmitting} className="h-7 w-7 text-red-500 hover:text-red-700 hover:bg-red-50">
                  {isDeleting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                </Button>
              </div>
            )}
          </TableCell>
        )}
      </TableRow>
    </Form>
  );
}
