import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Clock } from "lucide-react";
import { motion } from "framer-motion";

interface MeasurementProgressProps {
  mbEntriesLength: number;
  measurableItemsLength: number;
  completionPercentage: number;
  selectedWorkId: string;
}

export const MeasurementProgress: React.FC<MeasurementProgressProps> = ({
  mbEntriesLength,
  measurableItemsLength,
  completionPercentage,
  selectedWorkId,
}) => {
  if (!selectedWorkId) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      <Card className="bg-white border border-slate-200 shadow-sm rounded-xl">
        <CardContent className="pt-6">
          <div className="space-y-5">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-orange-50 rounded-xl">
                  <Clock className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-bold text-[15px] text-slate-800">
                    Measurement Progress
                  </h3>
                  <p className="text-xs font-medium text-slate-500 mt-0.5">
                    {mbEntriesLength} of {measurableItemsLength} items measured
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-orange-600">
                  {completionPercentage}%
                </span>
              </div>
            </div>
            <Progress value={completionPercentage} className="h-2.5 bg-slate-100 rounded-full overflow-hidden [&>div]:bg-orange-600 [&>div]:transition-all" />
            <div className="flex justify-between text-xs font-semibold text-slate-500">
              <span className="flex items-center gap-1.5 uppercase tracking-wider">
                <div className="w-2.5 h-2.5 rounded-full bg-orange-600 shadow-sm"></div>
                Measured: {mbEntriesLength}
              </span>
              <span className="flex items-center gap-1.5 uppercase tracking-wider">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-200 shadow-sm"></div>
                Remaining: {measurableItemsLength - mbEntriesLength}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
