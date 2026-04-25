"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { FileText, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/use-toast";

interface GenerateNoticeButtonProps {
  tenderId: string;
  tenderDescription: string;
  generateCorrigendumNotice: (formData: FormData) => Promise<{ success: boolean; error?: string; message?: string }>;
}

export function GenerateNoticeButton({
  tenderId,
  tenderDescription,
  generateCorrigendumNotice,
}: GenerateNoticeButtonProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [showDialog, setShowDialog] = useState(false);

  const handleGenerate = () => {
    setShowDialog(true);
  };

  const confirmGenerate = () => {
    setShowDialog(false);
    startTransition(async () => {
      const formData = new FormData();
      formData.append("id", tenderId);

      const result = await generateCorrigendumNotice(formData);

      if (result.success) {
        toast({
          title: "Success",
          description: result.message || "Corrigendum notice generated successfully",
          variant: "default",
        });
        router.refresh();
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to generate corrigendum notice",
          variant: "destructive",
        });
      }
    });
  };

  return (
    <>
      <Button
        type="button"
        variant="default"
        size="sm"
        onClick={handleGenerate}
        disabled={isPending}
        className="w-full sm:w-auto"
      >
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <FileText className="mr-2 h-4 w-4" />
            Generate Notice
          </>
        )}
      </Button>

      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Generate Corrigendum Notice
            </AlertDialogTitle>
            <AlertDialogDescription className="pt-2">
              Are you sure you want to generate a corrigendum notice for this cancelled tender?
              <div className="mt-3 p-3 bg-slate-50 rounded-md">
                <p className="text-sm font-medium text-slate-700">
                  Work Description:
                </p>
                <p className="text-sm text-slate-600 mt-1 line-clamp-2">
                  {tenderDescription}
                </p>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                This action will generate a corrigendum notice document for the cancelled tender.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmGenerate}
              disabled={isPending}
              className="bg-primary hover:bg-primary/90"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin inline" />
                  Generating...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4 inline" />
                  Generate Notice
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

