"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import Link from "next/link";

export default function OrdersClientComponent() {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="flex justify-between items-center mb-6">
      <div className="relative w-72">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search by order no., work name, or supplier..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>
      <Button asChild>
        <Link href="/admindashboard/manage-qatation/orders">
          Create New Order
        </Link>
      </Button>
    </div>
  );
}
