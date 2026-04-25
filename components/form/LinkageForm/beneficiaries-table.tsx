import type React from "react";
import { type UseFormReturn, useFieldArray } from "react-hook-form";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { LinkageFormValuesType } from "./constants";
import { BeneficiaryFormRow } from "./beneficiary-form-row";

interface BeneficiariesTableProps {
  form: UseFormReturn<LinkageFormValuesType>;
}

export const BeneficiariesTable: React.FC<BeneficiariesTableProps> = ({
  form,
}) => {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "beneficiaries",
  });

  return (
    <div className="space-y-4">
      {/* Add Beneficiary Button */}
      <div className="flex justify-end">
        <Button
          type="button"
          variant="default"
          size="sm"
          className="h-9 text-sm bg-primary hover:bg-primary/90"
          onClick={() =>
            append({
              name: "",
              gender: "male",
              relation: "Head",
              livingStatus: "alive",

              children: [],
            } as any)
          }
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Beneficiary / সুবিধাভোগী যোগ করুন
        </Button>
      </div>

      {/* Table Section */}
      <div className="rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="w-[40px] py-3 text-xs font-semibold text-gray-700">
                Sl No / ক্রমিক
              </TableHead>
              <TableHead className="py-3 text-xs font-semibold text-gray-700 min-w-[180px]">
                Name / নাম
              </TableHead>
              <TableHead className="py-3 text-xs font-semibold text-gray-700 w-[100px]">
                Gender / লিঙ্গ
              </TableHead>
              <TableHead className="w-[150px] py-3 text-xs font-semibold text-gray-700">
                Relation / সম্পর্ক
              </TableHead>

              <TableHead className="py-3 text-xs font-semibold text-gray-700 w-[100px]">
                Living Status / জীবিত অবস্থা
              </TableHead>
              <TableHead className="w-[80px] py-3 text-xs font-semibold text-gray-700">
                Actions / কার্যক্রম
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {fields.map((field, index) => (
              <BeneficiaryFormRow
                key={field.id}
                form={form}
                fieldArrayName="beneficiaries"
                index={index}
                depth={0}
                parentName={undefined}
                onRemove={(index) => remove(index)}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
