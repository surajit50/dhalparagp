"use client";

import React, { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import FormList from "@/components/FormList";

interface Form {
  id: string;
  name: string;
  category: string;
  downloadUrl: string;
  downloadCount: number;
}

interface FormsClientProps {
  initialForms: Form[];
}

export default function FormsClient({ initialForms }: FormsClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const filteredForms = initialForms.filter((form) => {
    const matchesSearch =
      searchQuery === "" ||
      form.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || form.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <>
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Search forms..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select
          value={selectedCategory}
          onValueChange={(value) => setSelectedCategory(value)}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="certificates">Certificates</SelectItem>
            <SelectItem value="taxes">Taxes</SelectItem>
            <SelectItem value="permissions">Permissions</SelectItem>
            <SelectItem value="utilities">Utilities</SelectItem>
            <SelectItem value="general">General</SelectItem>
            <SelectItem value="welfare">Welfare</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <FormList forms={filteredForms} />
    </>
  );
}
