"use client";

import { ApplicationForm } from "@/components/samabathy/ApplicationForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SamabyathiApplyPage() {
  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Apply for Samabyathi Scheme</CardTitle>
          <CardDescription>
            Submit an application for financial assistance under the Samabyathi scheme.
            Your application will be reviewed by the administration.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ApplicationForm onSuccess={() => {
            // Success logic if needed, e.g., redirect or show message
          }} />
        </CardContent>
      </Card>
    </div>
  );
}
