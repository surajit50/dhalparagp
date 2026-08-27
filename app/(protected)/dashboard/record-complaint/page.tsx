import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ComplaintForm } from "@/components/form/complaint-form";

export default function RecordComplaintPage() {
  return (
    <div className="flex flex-col p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Register a Complaint</h1>
        <p className="text-sm text-muted-foreground mt-1">
          File a general complaint or report a street light issue
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Complaint Details</CardTitle>
          <CardDescription>
            Select the complaint category and fill in the required information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ComplaintForm />
        </CardContent>
      </Card>
    </div>
  );
}
