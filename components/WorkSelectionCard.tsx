import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader } from "lucide-react";
import WorkSearchAndSelect from "./WorkSearchAndSelect";

interface WorkSelectionCardProps {
  works: any[];
  selectedWorkId: string;
  loadingWorks: boolean;
  workSelected: boolean;
  projectInfo: any;
  handleWorkSelection: (workId: string) => void;
  isEditing: boolean;
  estimateExists: boolean;
}

export default function WorkSelectionCard({
  works,
  selectedWorkId,
  loadingWorks,
  workSelected,
  projectInfo,
  handleWorkSelection,
  isEditing,
  estimateExists,
}: WorkSelectionCardProps) {
  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white">
        <CardTitle>Select Work</CardTitle>
        <CardDescription className="text-indigo-100">
          Choose a work to auto-populate project details
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        {loadingWorks ? (
          <div className="flex items-center justify-center py-8">
            <Loader className="h-6 w-6 animate-spin text-blue-600 mr-2" />
            <span className="text-slate-600">Loading works...</span>
          </div>
        ) : works.length === 0 ? (
          <Alert className="border-yellow-300 bg-yellow-50">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800 ml-2">
              No works available. Please create a work first.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Select a Work
              </label>
              {isEditing && estimateExists ? (
                <div className="p-3 border rounded bg-slate-100 text-slate-500 text-sm">
                   Selection disabled while editing existing estimate
                </div>
              ) : (
                <WorkSearchAndSelect
                  works={works}
                  selectedWorkId={selectedWorkId}
                  onSelect={handleWorkSelection}
                />
              )}
            </div>

            {workSelected && (
              <div className="bg-green-50 border border-green-300 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-green-900 mb-2">
                      ✓ Work Selected Successfully
                    </p>
                    <div className="space-y-1 text-xs text-green-800">
                      <p>
                        <strong>Project:</strong> {projectInfo.projectName}
                      </p>
                      <p>
                        <strong>Code:</strong> {projectInfo.projectCode}
                      </p>
                      {projectInfo.location && (
                        <p>
                          <strong>Location:</strong> {projectInfo.location}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
