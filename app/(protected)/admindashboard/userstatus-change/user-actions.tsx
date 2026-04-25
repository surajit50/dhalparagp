"use client";

import { Button } from "@/components/ui/button";
import { toast } from "sonner";

import {
  handleActivateAll,
  handleDeactivateAll,
  handleToggleUser,
} from "./form-actions";
import { Power, PowerOff, CheckCircle2, XCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function UserActions() {
  return (
    <div className="flex gap-2">
      <TooltipProvider>
        <form
          action={async () => {
            const result = await handleActivateAll();
            if (result.success) {
              toast.success(result.success);
            } else if (result.error) {
              toast.error(result.error);
            }
          }}
        >
          <Tooltip>
            <TooltipTrigger asChild>
              <Button type="submit" variant="ghost" size="icon">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Activate All Users</TooltipContent>
          </Tooltip>
        </form>

        <form
          action={async () => {
            const result = await handleDeactivateAll();
            if (result.success) {
              toast.success(result.success);
            } else if (result.error) {
              toast.error(result.error);
            }
          }}
        >
          <Tooltip>
            <TooltipTrigger asChild>
              <Button type="submit" variant="ghost" size="icon">
                <XCircle className="h-5 w-5 text-red-600" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Deactivate All Users</TooltipContent>
          </Tooltip>
        </form>
      </TooltipProvider>
    </div>
  );
}

export function UserStatusToggle({
  userId,
  currentStatus,
}: {
  userId: string;
  currentStatus: "active" | "inactive";
}) {
  return (
    <TooltipProvider>
      <form
        action={async () => {
          const result = await handleToggleUser(userId, currentStatus);
          if (result.success) {
            toast.success(result.success);
          } else if (result.error) {
            toast.error(result.error);
          }
        }}
      >
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" type="submit" size="icon">
              {currentStatus === "active" ? (
                <PowerOff className="h-4 w-4 text-red-600" />
              ) : (
                <Power className="h-4 w-4 text-green-600" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {currentStatus === "active" ? "Deactivate User" : "Activate User"}
          </TooltipContent>
        </Tooltip>
      </form>
    </TooltipProvider>
  );
}
