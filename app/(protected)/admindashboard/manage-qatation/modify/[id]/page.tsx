import { getQuotationById } from "@/lib/actions/quotations";
import EditQuotationForm from "./EditQuotationForm";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface PageProps {
  params: {
    id: string;
  };
}

export default async function ModifyQuotationPage({ params }: PageProps) {
  const result = await getQuotationById(params.id);

  if (!result.success || !result.data) {
    return (
      <div className="min-h-screen bg-muted/40 py-8">
        <div className="container mx-auto px-4 max-w-md">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/admindashboard/manage-qatation/view">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to View
            </Link>
          </Button>

          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {result.error || "Quotation not found or failed to load."}
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return <EditQuotationForm quotation={result.data} />;
}
