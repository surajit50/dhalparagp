"use client";

import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

interface VillagePageHeaderProps {
  title: string;
  description: string;
  icon: LucideIcon;
  iconColor?: string;
  gradientFrom?: string;
  gradientTo?: string;
}

export function VillagePageHeader({
  title,
  description,
  icon: Icon,
  iconColor = "text-white",
  gradientFrom = "from-orange-600",
  gradientTo = "to-orange-600",
}: VillagePageHeaderProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
     
    >
      <div className="flex items-center space-x-5">
        <div className={`p-3 bg-gradient-to-br ${gradientFrom} ${gradientTo} rounded-2xl shadow-lg shadow-orange-200 ring-4 ring-white`}>
          <Icon className={`h-7 w-7 ${iconColor}`} />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight sm:text-4xl">
            {title}
          </h1>
          <p className="text-lg text-gray-500 font-medium">
            {description}
          </p>
        </div>
      </div>
      
      {/* Optional: Add breadcrumbs or secondary action here */}
      <div className="flex items-center space-x-3">
        <div className="hidden sm:block h-12 w-[1px] bg-gray-200 mx-2" />
        <div className="flex flex-col items-end">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Village Module</span>
          <span className="text-sm font-semibold text-orange-600">Enterprise Management</span>
        </div>
      </div>
    </motion.div>
  );
}
