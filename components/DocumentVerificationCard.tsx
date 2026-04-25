"use client";

import type { WarishDocument } from "@prisma/client";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CheckCircle, XCircle, Eye } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useTransition } from "react";
import {
  verifyDocument,
  rejectDocument,
} from "@/action/warish-document-actions";

interface DocumentVerificationCardProps {
  document: WarishDocument;
  warishId: string;
}

export const DocumentVerificationCard = ({
  document,
  warishId,
}: DocumentVerificationCardProps) => {
  const [isPending, startTransition] = useTransition();

  const handleVerify = () => {
    startTransition(() => {
      verifyDocument(document.id, warishId);
    });
  };

  const handleReject = () => {
    startTransition(() => {
      rejectDocument(document.id, warishId);
    });
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        {document.cloudinaryUrl ? (
          <Link href={document.cloudinaryUrl} target="_blank">
            <div className="relative h-48 w-full">
              <Image
                src={document.cloudinaryUrl}
                alt={document.documentType}
                layout="fill"
                objectFit="cover"
                className="transition-transform duration-300 hover:scale-105"
              />
            </div>
          </Link>
        ) : (
          <div className="relative h-48 w-full flex items-center justify-center bg-muted">
            <span className="text-muted-foreground">No Preview</span>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col items-start p-4 bg-background">
        <div className="w-full">
          <p className="font-semibold truncate">{document.documentType}</p>
          <Badge
            variant={document.verified ? "success" : "warning"}
            className="mt-1"
          >
            {document.verified ? "Verified" : "Pending"}
          </Badge>
        </div>
        <div className="flex w-full justify-between items-center mt-4 pt-4 border-t">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleVerify}
                  disabled={isPending || document.verified}
                >
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Verify</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleReject}
                  disabled={isPending || !document.verified}
                >
                  <XCircle className="h-5 w-5 text-red-500" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Reject</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                {document.cloudinaryUrl ? (
                  <Link href={document.cloudinaryUrl} target="_blank">
                    <Button variant="ghost" size="icon">
                      <Eye className="h-5 w-5" />
                    </Button>
                  </Link>
                ) : (
                  <Button variant="ghost" size="icon" disabled>
                    <Eye className="h-5 w-5" />
                  </Button>
                )}
              </TooltipTrigger>
              <TooltipContent>
                <p>View</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardFooter>
    </Card>
  );
};
