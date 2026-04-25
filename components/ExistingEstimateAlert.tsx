import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, Edit3, Eye, RefreshCw } from "lucide-react";

interface ExistingEstimateAlertProps {
  estimateExists: boolean;
  initialLoad: boolean;
  selectedWorkId: string;
  isEditing: boolean;
  existingEstimate: any;
  setIsEditing: (value: boolean) => void;
  setItems: (items: any[]) => void;
  setProjectInfo: (info: any) => void;
  setContingency: (value: number) => void;
  resetForm: () => void;
  fetchExistingEstimate: (workId: string) => void;
  setShowPreview: (value: boolean) => void;
}

export default function ExistingEstimateAlert({
  estimateExists,
  initialLoad,
  selectedWorkId,
  isEditing,
  existingEstimate,
  setIsEditing,
  setItems,
  setProjectInfo,
  setContingency,
  resetForm,
  fetchExistingEstimate,
  setShowPreview,
}: ExistingEstimateAlertProps) {
  if (!estimateExists || initialLoad || !selectedWorkId) return null;

  return (
    <Alert className="border-orange-300 bg-orange-50">
      <AlertCircle className="h-4 w-4 text-orange-600" />
      <AlertDescription className="text-orange-800 ml-2">
        <strong>Estimate Already Exists:</strong> Only one estimate per work is allowed. You can edit or view the existing estimate. To create a new one, delete the existing estimate first.
        {!isEditing && (
          <div className="mt-3 flex gap-2">
            <Button
              onClick={() => {
                setIsEditing(true);
                setItems(existingEstimate.items || []);
                setProjectInfo(existingEstimate.projectInfo || {
                  projectName: "",
                  projectCode: "",
                  location: "",
                  preparedBy: "",
                  date: new Date().toISOString().split("T")[0],
                });
                setContingency(existingEstimate.contingency || 0);
              }}
              size="sm"
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              <Edit3 className="h-4 w-4 mr-1" />
              Edit Estimate
            </Button>
            <Button
              onClick={() => {
                setItems(existingEstimate.items || []);
                setProjectInfo(existingEstimate.projectInfo || {
                  projectName: "",
                  projectCode: "",
                  location: "",
                  preparedBy: "",
                  date: new Date().toISOString().split("T")[0],
                });
                setContingency(existingEstimate.contingency || 0);
                setShowPreview(true);
              }}
              size="sm"
              variant="outline"
              className="border-orange-300"
            >
              <Eye className="h-4 w-4 mr-1" />
              View Estimate
            </Button>
          </div>
        )}
        {isEditing && (
          <div className="mt-3 flex gap-2">
            <Button
              onClick={() => {
                resetForm();
                fetchExistingEstimate(selectedWorkId);
              }}
              size="sm"
              variant="outline"
              className="border-orange-300"
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Cancel Editing
            </Button>
          </div>
        )}
      </AlertDescription>
    </Alert>
  );
}
