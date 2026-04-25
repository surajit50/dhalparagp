"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type FinancialYearSelectProps = {
  value: string;
  onChange: (value: string) => void;
};

export default function FinancialYearSelect({
  value,
  onChange,
}: FinancialYearSelectProps) {
  return (
    <div className="flex-grow min-w-[200px]">
      <label
        htmlFor="financial-year"
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        Financial Year
      </label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id="financial-year">
          <SelectValue placeholder="Select Financial Year" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="2024-2025">2024-2025</SelectItem>
          <SelectItem value="2023-2024">2023-2024</SelectItem>
          <SelectItem value="2022-2023">2022-2023</SelectItem>
          <SelectItem value="2021-2022">2021-2022</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
