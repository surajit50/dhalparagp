import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface ProjectInfoCardProps {
  projectInfo: {
    projectName: string;
    projectCode: string | number;
    location: string;
    preparedBy: string;
    date: string;
  };
  setProjectInfo: (info: any) => void;
  workSelected: boolean;
}

export default function ProjectInfoCard({
  projectInfo,
  setProjectInfo,
  workSelected,
}: ProjectInfoCardProps) {
  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <CardTitle>Project Information</CardTitle>
        <CardDescription className="text-blue-100">
          {workSelected
            ? "Project details auto-populated from selected work"
            : "Enter project details"}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Project Name
            </label>
            <Input
              placeholder="e.g., Road Construction"
              value={projectInfo.projectName}
              onChange={(e) =>
                setProjectInfo({
                  ...projectInfo,
                  projectName: e.target.value,
                })
              }
              disabled={workSelected}
              className={`border-slate-300 ${
                workSelected ? "bg-slate-100 cursor-not-allowed" : ""
              }`}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Project Code
            </label>
            <Input
              placeholder="e.g., PROJ-2024-001"
              value={projectInfo.projectCode}
              onChange={(e) =>
                setProjectInfo({
                  ...projectInfo,
                  projectCode: e.target.value,
                })
              }
              disabled={workSelected}
              className={`border-slate-300 ${
                workSelected ? "bg-slate-100 cursor-not-allowed" : ""
              }`}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Location
            </label>
            <Input
              placeholder="e.g., Village Name, District"
              value={projectInfo.location}
              onChange={(e) =>
                setProjectInfo({
                  ...projectInfo,
                  location: e.target.value,
                })
              }
              disabled={workSelected}
              className={`border-slate-300 ${
                workSelected ? "bg-slate-100 cursor-not-allowed" : ""
              }`}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Prepared By
            </label>
            <Input
              placeholder="Your name"
              value={projectInfo.preparedBy}
              onChange={(e) =>
                setProjectInfo({
                  ...projectInfo,
                  preparedBy: e.target.value,
                })
              }
              className="border-slate-300"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Date
            </label>
            <Input
              type="date"
              value={projectInfo.date}
              onChange={(e) =>
                setProjectInfo({
                  ...projectInfo,
                  date: e.target.value,
                })
              }
              className="border-slate-300"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
