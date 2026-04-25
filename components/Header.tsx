import { FileText } from "lucide-react";

export default function Header() {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-4xl font-bold text-slate-900 flex items-center gap-3">
          <FileText className="h-10 w-10 text-blue-600" />
          Estimate Preparation
        </h1>
        <p className="text-slate-600 mt-2">
          Create detailed & abstract estimates in PWD/Panchayat format
        </p>
      </div>
    </div>
  );
}
