
"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type MonthSelectProps = {
  value: string;
  onChange: (value: string) => void;
};

export default function MonthSelect({ value, onChange }: MonthSelectProps) {
  return (
    <div className="flex-grow min-w-[200px]">
      <label
        htmlFor="month"
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        Month
      </label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id="month">
          <SelectValue placeholder="Select Month" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="0">All</SelectItem>
          <SelectItem value="1">January</SelectItem>
          <SelectItem value="2">February</SelectItem>
          <SelectItem value="3">March</SelectItem>
          <SelectItem value="4">April</SelectItem>
          <SelectItem value="5">May</SelectItem>
          <SelectItem value="6">June</SelectItem>
          <SelectItem value="7">July</SelectItem>
          <SelectItem value="8">August</SelectItem>
          <SelectItem value="9">September</SelectItem>
          <SelectItem value="10">October</SelectItem>
          <SelectItem value="11">November</SelectItem>
          <SelectItem value="12">December</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
