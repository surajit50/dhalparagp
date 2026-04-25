"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Upload, AlertTriangle, CheckCircle, Loader2 } from "lucide-react";
import { publishQuotation } from "@/lib/actions/quotations";

import { toast } from "sonner";
import { useCurrentUser } from "@/hooks/use-current-user";

interface PublishQuotationClientProps {
  quotationId: string;
  isComplete: boolean;
  missingFields: string[];
}

export function PublishQuotationClient({
  quotationId,
  isComplete,
  missingFields,
}: PublishQuotationClientProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const user = useCurrentUser();

  const handlePublish = async () => {
    if (!user) {
      toast.error("You must be logged in to publish quotations");
      return;
    }

    if (!user.id) {
      toast.error("You must be logged in to publish quotations");
      return;
    }

    setIsPublishing(true);
    try {
      const result = await publishQuotation(quotationId, user.id);

      if (result.success) {
        toast.success("Quotation published successfully!");
        setIsOpen(false);
        // Refresh the page to update the data
        window.location.reload();
      } else {
        toast.error(result.error || "Failed to publish quotation");
      }
    } catch (error) {
      console.error("Error publishing quotation:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          disabled={!isComplete}
          className={isComplete ? "bg-green-600 hover:bg-green-700" : ""}
        >
          <Upload className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Publish Quotation
          </DialogTitle>
          <DialogDescription>
            {isComplete
              ? "This quotation is ready to be published. Once published, it will be visible to bidders."
              : "This quotation cannot be published as it has missing required fields."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {isComplete ? (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                All required fields are complete. This quotation is ready to
                publish.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                The following fields are missing or incomplete:
                <div className="mt-2 flex flex-wrap gap-1">
                  {missingFields.map((field) => (
                    <Badge
                      key={field}
                      variant="destructive"
                      className="text-xs"
                    >
                      {field}
                    </Badge>
                  ))}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {isComplete && (
            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-medium mb-2">
                What happens when you publish?
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>
                  • The quotation will be visible to all registered bidders
                </li>
                <li>
                  • Bidders can submit their quotations until the submission
                  deadline
                </li>
                <li>
                  • You will receive notifications when bids are submitted
                </li>
                <li>• The quotation status will change to Published</li>
              </ul>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          {isComplete && (
            <Button
              onClick={handlePublish}
              disabled={isPublishing}
              className="bg-green-600 hover:bg-green-700"
            >
              {isPublishing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Publishing...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Publish Now
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
