"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileText, IndianRupee, ShieldCheck } from "lucide-react";

const stats = [
  {
    title: "Total Applications",
    value: "1,245",
    icon: FileText,
  },
  {
    title: "Approved",
    value: "980",
    icon: ShieldCheck,
  },
  {
    title: "Users",
    value: "320",
    icon: Users,
  },
  {
    title: "Total Disbursed",
    value: "₹19,60,000",
    icon: IndianRupee,
  },
];

const Page = () => {
  return (
    <div className="p-6 space-y-6">
      {/* Heading */}
      <div>
        <h1 className="text-3xl font-bold">Super Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of system performance and activities
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((item, index) => (
          <Card key={index} className="shadow-sm hover:shadow-md transition">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium">
                {item.title}
              </CardTitle>
              <item.icon className="w-5 h-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{item.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <a href="/vouchers" className="block p-6 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition">
          <div className="flex items-center space-x-3 text-blue-700">
             <FileText className="w-6 h-6" />
             <h3 className="font-semibold text-lg">Manage Vouchers</h3>
          </div>
          <p className="mt-2 text-sm text-blue-600">Create, view, and print credit/debit vouchers.</p>
        </a>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Applications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>Application #WB00123</span>
              <span className="text-green-600">Approved</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Application #WB00124</span>
              <span className="text-yellow-600">Pending</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Application #WB00125</span>
              <span className="text-red-600">Rejected</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Page;
