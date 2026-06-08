"use client";

import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Trash2 } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";
import type { QuotationSchema } from "@/lib/schemas/quotation";

interface ItemsTableSectionProps {
  form: UseFormReturn<QuotationSchema>;
}

export default function ItemsTableSection({ form }: ItemsTableSectionProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-primary border-b pb-2">
        Items / Works Details
      </h3>

      <div className="overflow-x-auto border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-100">
              <TableHead className="w-12">Sl.</TableHead>
              <TableHead>Description of Item/Work</TableHead>
              <TableHead className="w-32">Quantity</TableHead>
              <TableHead className="w-24">Unit</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-semibold">1</TableCell>
              <TableCell>
                <FormField
                  name="workName"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Item/Work name"
                          className="border-0 focus-visible:ring-0"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </TableCell>
              <TableCell>
                <FormField
                  name="quantity"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Qty"
                          className="border-0 focus-visible:ring-0"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </TableCell>
              <TableCell>
                <FormField
                  name="unit"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Unit"
                          className="border-0 focus-visible:ring-0"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-between items-center p-4 bg-slate-50 rounded-lg">
        <p className="text-sm text-slate-600">
          Note: Add more items if required. Current format supports primary item details.
        </p>
        <Button variant="outline" size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Add More
        </Button>
      </div>
    </div>
  );
}
