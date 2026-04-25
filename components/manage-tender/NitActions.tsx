"use client";

import { useRouter } from "next/navigation";
import { Eye, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NITCopy } from "@/components/PrintTemplet/PrintNIt-copy";

type NitActionsProps = {
  nit: any;
};

export default function NitActions({ nit }: NitActionsProps) {
  const router = useRouter();

  return (
    <div className="flex items-center justify-end space-x-1">
      {!nit.isPublished && (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
          title="Edit"
          onClick={() =>
            router.push(`/admindashboard/manage-tender/add/${nit.id}`)
          }
        >
          <Pencil className="h-4 w-4" />
        </Button>
      )}

      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0 text-gray-600 hover:text-gray-800 hover:bg-gray-50"
        title="View"
        onClick={() =>
          router.push(`/admindashboard/manage-tender/view/${nit.id}`)
        }
      >
        <Eye className="h-4 w-4" />
      </Button>

      <NITCopy nitdetails={nit} />
    </div>
  );
}
