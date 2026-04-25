
"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FundTypeSelectProps {
  value: string;
  onChange: (value: string) => void;
}

export default function FundTypeSelect({ value, onChange }: FundTypeSelectProps) {
  return (
    <div className="flex-grow min-w-[200px]">
      <label
        htmlFor="fund-type"
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        Fund Type
      </label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id="fund-type">
          <SelectValue placeholder="Select Fund Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="All">All</SelectItem>
          <SelectItem value="15th CFC">15th CFC</SelectItem>
          <SelectItem value="5th SFC">5th SFC</SelectItem>
          <SelectItem value="PBG">PBG</SelectItem>
          <SelectItem value="OSR">OSR</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
