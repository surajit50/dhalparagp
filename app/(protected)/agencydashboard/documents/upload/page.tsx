import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function UploadDocumentsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Upload Documents</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Upload Center</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Upload contract files, bills, photos, and supporting documents.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

