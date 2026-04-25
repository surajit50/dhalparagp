import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { BookOpen } from "lucide-react";
import WorkSearchAndSelect from "@/components/WorkSearchAndSelect";
import { motion } from "framer-motion";

interface WorkSelectionProps {
  works: any[];
  selectedWorkId: string;
  onSelect: (id: string) => void;
}

export const WorkSelection: React.FC<WorkSelectionProps> = ({
  works,
  selectedWorkId,
  onSelect,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.05 }}
    >
      <Card className="border-slate-200 shadow-sm hover:shadow-md transition-all bg-white rounded-xl">
        <CardHeader className="pb-4 border-b border-slate-50">
          <CardTitle className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xl font-bold text-slate-800">Select Work</span>
              <CardDescription className="mt-1 text-slate-500">
                Choose a work to create measurement entries
              </CardDescription>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <WorkSearchAndSelect
            works={works}
            selectedWorkId={selectedWorkId}
            onSelect={onSelect}
          />
        </CardContent>
      </Card>
    </motion.div>
  );
};
