import { FileText, Building, MapPin, User } from "lucide-react";
import { Card } from "@/components/ui/card";
import ProjectInfoCard from "@/components/ProjectInfoCard";
import { StepHeader, StepNav, InfoField } from "../components";
import { ProjectInfo } from "../types";

interface Step2Props {
  projectInfo: ProjectInfo;
  setProjectInfo: React.Dispatch<React.SetStateAction<ProjectInfo>>;
  workSelected: boolean;
  onNext: () => void;
  onPrev: () => void;
}

export function Step2_ProjectDetails({
  projectInfo,
  setProjectInfo,
  workSelected,
  onNext,
  onPrev,
}: Step2Props) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <StepHeader
        step={2}
        icon={<FileText className="h-5 w-5 text-emerald-600" />}
        title="Project Details"
        description="Review and fill in project information for this estimate"
      />

      <Card className="p-6 shadow-sm border border-wb-border bg-white">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <InfoField
            icon={<Building className="h-4 w-4" />}
            label="Project Name"
            value={projectInfo.projectName || "Not selected"}
          />
          <InfoField
            icon={<MapPin className="h-4 w-4" />}
            label="Location"
            value={projectInfo.location || "Not specified"}
          />
          <InfoField
            icon={<User className="h-4 w-4" />}
            label="Prepared By"
            value={projectInfo.preparedBy || "—"}
          />
        </div>
        <ProjectInfoCard
          projectInfo={projectInfo}
          setProjectInfo={setProjectInfo}
          workSelected={workSelected}
        />
      </Card>

      <StepNav
        step={2}
        totalSteps={5}
        canNext={true}
        onPrev={onPrev}
        onNext={onNext}
        nextLabel="Continue to Dimensions"
      />
    </div>
  );
}
