
import type React from "react"
import { type UseFormReturn, useFieldArray } from "react-hook-form"
import { PlusCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { WarishFormValuesType } from "@/schema/warishSchema"
import { WarishFormRow } from "./warish-form-row"
import ViewRelation from "@/components/famili-relationship"

interface WarishTableProps {
  form: UseFormReturn<WarishFormValuesType>
}

export const WarishTable: React.FC<WarishTableProps> = ({ form }) => {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "warishDetails",
  })

  return (
    <div className="space-y-4">
      {/* View Relationship Section */}
      <div className="flex justify-end">
        <div className="flex flex-col items-end gap-2 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-gray-600">
            Click view icon to show relationship data / সম্পর্কের তথ্য দেখতে আইকনে ক্লিক করুন
          </p>
          <ViewRelation />
        </div>
      </div>

      {/* Add Warish Button */}
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
              relation: "",
              livingStatus: "alive",
              maritialStatus: "unmarried",
              children: [],
            })
          }
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Warish / ওয়ারিশ যোগ করুন
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
              <TableHead className="py-3 text-xs font-semibold text-gray-700 min-w-[200px]">
                Warish Name / ওয়ারিশের নাম
              </TableHead>
              <TableHead className="py-3 text-xs font-semibold text-gray-700 w-[100px]">
                Gender / লিঙ্গ
              </TableHead>
              <TableHead className="py-3 text-xs font-semibold text-gray-700 w-[100px]">
                Marital Status / বৈবাহিক অবস্থা
              </TableHead>
              <TableHead className="w-[150px] py-3 text-xs font-semibold text-gray-700">
                Relation / সম্পর্ক
              </TableHead>
              <TableHead className="py-3 text-xs font-semibold text-gray-700 w-[80px]">
                Living Status / জীবিত অবস্থা
              </TableHead>
              <TableHead className="w-[80px] py-3 text-xs font-semibold text-gray-700">
                Actions / কার্যক্রম
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {fields.map((field, index) => (
              <WarishFormRow
                key={field.id}
                form={form}
                fieldArrayName="warishDetails"
                index={index}
                onRemove={(index) => remove(index)}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
