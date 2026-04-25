import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Calculator } from "lucide-react";

interface AbstractEstimateCardProps {
  items: any[];
  contingency: number;
  setContingency: (value: number) => void;
  estimateExists: boolean;
  isEditing: boolean;
  itemTotal: number;
  gst: number;
  costExclLWC: number;
  lwc: number;
  costInclLWC: number;
  finalCost: number;
}

export default function AbstractEstimateCard({
  items,
  contingency,
  setContingency,
  estimateExists,
  isEditing,
  itemTotal,
  gst,
  costExclLWC,
  lwc,
  costInclLWC,
  finalCost,
}: AbstractEstimateCardProps) {
  return (
    <Card className="border-0 shadow-lg sticky top-6">
      <CardHeader className="bg-gradient-to-r from-orange-600 to-orange-700 text-white">
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Abstract Estimate
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-3 text-sm">
        {items.length > 0 ? (
          <>
            <div className="flex justify-between py-2 border-b border-slate-200">
              <span className="text-slate-600">A. Itemwise Total</span>
              <span className="font-semibold text-slate-900">
                ₹{itemTotal.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-200">
              <span className="text-slate-600">B. GST @18%</span>
              <span className="font-semibold text-slate-900">
                ₹{gst.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-200">
              <span className="text-slate-600">C = A + B</span>
              <span className="font-semibold text-slate-900">
                ₹{costExclLWC.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-200">
              <span className="text-slate-600">D. Labour Welfare Cess @1%</span>
              <span className="font-semibold text-slate-900">
                ₹{lwc.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-200">
              <span className="text-slate-600">E = C + D</span>
              <span className="font-semibold text-slate-900">
                ₹{costInclLWC.toFixed(2)}
              </span>
            </div>

            <Separator className="my-3" />

            <div className="flex justify-between items-center">
              <span className="text-slate-600">Contingency (LS)</span>
              <Input
                type="number"
                placeholder="0"
                value={contingency}
                onChange={(e) =>
                  setContingency(Number(e.target.value) || 0)
                }
                className="w-28 text-right border-slate-300 h-8 text-sm"
                step="1000"
                disabled={estimateExists && !isEditing}
              />
            </div>

            <Separator className="my-3" />

            <div className="flex justify-between items-center bg-gradient-to-r from-blue-50 to-blue-100 p-3 rounded-lg">
              <span className="font-bold text-slate-900">
                SAY / Final Cost
              </span>
              <span className="text-2xl font-bold text-blue-600">
                ₹{finalCost.toLocaleString()}
              </span>
            </div>
          </>
        ) : (
          <div className="text-center text-slate-500 py-8">
            <Calculator className="h-8 w-8 mx-auto mb-2 text-slate-400" />
            <p>Add items to view calculations</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
