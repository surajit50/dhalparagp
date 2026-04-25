import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ComplaintForm } from "@/components/form/complaint-form";

export default function RecordComplaintPage() {
  return (
    <div className="flex flex-col p-6 space-y-6">
      <h1 className="text-3xl font-bold">Record a Complaint</h1>
      <Card>
        <CardHeader>
          <CardTitle>Complaint Details</CardTitle>
        </CardHeader>
        <CardContent>
          <ComplaintForm />
        </CardContent>
      </Card>
    </div>
  );
}
