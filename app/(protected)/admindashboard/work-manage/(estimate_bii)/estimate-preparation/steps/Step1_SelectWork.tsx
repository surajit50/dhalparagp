import { Building } from "lucide-react";
import { Card } from "@/components/ui/card";
import WorkSelectionCard from "@/components/WorkSelectionCard";
import { StepHeader, StepNav } from "../components";
import { Work, ProjectInfo } from "../types";

interface Step1Props {
  works: Work[];
  selectedWorkId: string;
  loadingWorks: boolean;
  workSelected: boolean;
  projectInfo: ProjectInfo;
  handleWorkSelection: (workId: string) => void;
  isEditing: boolean;
  estimateExists: boolean;
  onNext: () => void;
}

export function Step1_SelectWork({
  works,
  selectedWorkId,
  loadingWorks,
  workSelected,
  projectInfo,
  handleWorkSelection,
  isEditing,
  estimateExists,
  onNext,
}: Step1Props) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <StepHeader
        step={1}
        icon={<Building className="h-5 w-5 text-wb-primary" />}
        title="Select Work"
        description="Choose the work / project you are preparing an estimate for"
      />

      <Card className="p-6 shadow-sm border border-wb-border bg-white">
        <WorkSelectionCard
          works={works}
          selectedWorkId={selectedWorkId}
          loadingWorks={loadingWorks}
          workSelected={workSelected}
          projectInfo={projectInfo}
          handleWorkSelection={handleWorkSelection}
          isEditing={isEditing}
          estimateExists={estimateExists}
        />
      </Card>

      <StepNav
        step={1}
        totalSteps={5}
        canNext={!!workSelected}
        onNext={onNext}
        nextLabel="Continue to Project Details"
      />
    </div>
  );
}
