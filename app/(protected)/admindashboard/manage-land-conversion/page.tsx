"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  FileText,
  FileSearch,
  Map,
  CheckSquare,
  FileBadge,
  Printer,
  AlertTriangle,
  Activity,
  ArrowRight,
  TrendingUp,
  Clock,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import LandConversionLayout from "./components/LandConversionLayout";
import { getLandConversionDashboardStats } from "@/action/land-conversion-actions";
import { Loader2 } from "lucide-react";

interface Stats {
  total: number;
  pendingVerification: number;
  pendingInspection: number;
  pendingApproval: number;
  approved: number;
  rejected: number;
}

const MODULES = [
  {
    title: "New Application",
    description: "Submit and track land conversion applications",
    icon: FileText,
    href: "/admindashboard/manage-land-conversion/application",
    color: "from-blue-500 to-indigo-600",
    bgLight: "bg-blue-50",
    textColor: "text-blue-700",
  },
  {
    title: "Document Verify",
    description: "Verify uploaded documents and land records",
    icon: FileSearch,
    href: "/admindashboard/manage-land-conversion/verify",
    color: "from-amber-500 to-orange-500",
    bgLight: "bg-orange-50",
    textColor: "text-orange-700",
  },
  {
    title: "Site Inspection",
    description: "Schedule and manage field inspections",
    icon: Map,
    href: "/admindashboard/manage-land-conversion/inspection",
    color: "from-emerald-500 to-teal-600",
    bgLight: "bg-emerald-50",
    textColor: "text-emerald-700",
  },
  {
    title: "Final Approval",
    description: "Approve or reject inspected applications",
    icon: CheckSquare,
    href: "/admindashboard/manage-land-conversion/approve",
    color: "from-purple-500 to-violet-600",
    bgLight: "bg-purple-50",
    textColor: "text-purple-700",
  },
  {
    title: "Issue NOC",
    description: "Generate and issue No Objection Certificates",
    icon: FileBadge,
    href: "/admindashboard/manage-land-conversion/issue",
    color: "from-pink-500 to-rose-600",
    bgLight: "bg-pink-50",
    textColor: "text-pink-700",
  },
  {
    title: "Print & Delivery",
    description: "Print certificates for physical delivery",
    icon: Printer,
    href: "/admindashboard/manage-land-conversion/print",
    color: "from-gray-600 to-slate-700",
    bgLight: "bg-gray-100",
    textColor: "text-gray-800",
  },
  {
    title: "Compliance Check",
    description: "Track NOC conditions and field violations",
    icon: AlertTriangle,
    href: "/admindashboard/manage-land-conversion/compliance",
    color: "from-red-500 to-red-700",
    bgLight: "bg-red-50",
    textColor: "text-red-700",
  },
];

export default function ManageLandConversionDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await getLandConversionDashboardStats();
        if (res.success && res.data) {
          setStats(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  return (
    <LandConversionLayout
      title="Land Conversion Dashboard"
      description="Centralized portal for managing all land conversion processes, from application to NOC issuance."
      icon={Activity}
    >
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* --- STATS OVERVIEW --- */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            Application Overview
          </h3>
          
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                <p className="text-sm font-medium text-gray-500 mb-1">Total</p>
                <p className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{stats?.total || 0}</p>
              </div>
              
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>
                <p className="text-sm font-medium text-gray-500 mb-1">Pending Verify</p>
                <div className="flex items-end gap-2">
                  <p className="text-2xl font-bold text-gray-900 group-hover:text-amber-600 transition-colors">{stats?.pendingVerification || 0}</p>
                  <Clock className="h-4 w-4 text-amber-500 mb-1 opacity-50" />
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
                <p className="text-sm font-medium text-gray-500 mb-1">For Inspection</p>
                <div className="flex items-end gap-2">
                  <p className="text-2xl font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">{stats?.pendingInspection || 0}</p>
                  <Map className="h-4 w-4 text-emerald-500 mb-1 opacity-50" />
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-purple-500"></div>
                <p className="text-sm font-medium text-gray-500 mb-1">For Approval</p>
                <div className="flex items-end gap-2">
                  <p className="text-2xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors">{stats?.pendingApproval || 0}</p>
                  <CheckSquare className="h-4 w-4 text-purple-500 mb-1 opacity-50" />
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-pink-500"></div>
                <p className="text-sm font-medium text-gray-500 mb-1">Approved</p>
                <div className="flex items-end gap-2">
                  <p className="text-2xl font-bold text-gray-900 group-hover:text-pink-600 transition-colors">{stats?.approved || 0}</p>
                  <ShieldCheck className="h-4 w-4 text-pink-500 mb-1 opacity-50" />
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
                <p className="text-sm font-medium text-gray-500 mb-1">Rejected</p>
                <div className="flex items-end gap-2">
                  <p className="text-2xl font-bold text-gray-900 group-hover:text-red-600 transition-colors">{stats?.rejected || 0}</p>
                  <XCircle className="h-4 w-4 text-red-500 mb-1 opacity-50" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* --- MODULE GRID --- */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Activity className="h-5 w-5 text-indigo-600" />
            Process Workflow
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {MODULES.map((mod, idx) => (
              <Link 
                href={mod.href} 
                key={mod.title}
                className="group relative bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden"
              >
                {/* Decorative background glow on hover */}
                <div className={`absolute -right-12 -top-12 w-32 h-32 rounded-full bg-gradient-to-br ${mod.color} opacity-0 group-hover:opacity-10 blur-2xl transition-opacity duration-500`}></div>
                
                <div>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${mod.color} shadow-inner mb-4 transform group-hover:scale-110 transition-transform duration-300`}>
                    <mod.icon className="h-6 w-6 text-white" />
                  </div>
                  <h4 className="text-lg font-bold text-gray-900 mb-2">{mod.title}</h4>
                  <p className="text-sm text-gray-500 leading-relaxed mb-4">{mod.description}</p>
                </div>
                
                <div className="flex items-center text-sm font-semibold opacity-80 group-hover:opacity-100 transition-opacity">
                  <span className={`bg-clip-text text-transparent bg-gradient-to-r ${mod.color}`}>
                    Open Module
                  </span>
                  <ArrowRight className={`ml-1 h-4 w-4 ${mod.textColor} transform group-hover:translate-x-1 transition-transform`} />
                </div>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </LandConversionLayout>
  );
}
