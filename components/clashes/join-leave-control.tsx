"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Check, Clock, DoorOpen, LogIn, X } from "lucide-react";
import { joinClash, leaveClash } from "@/app/actions/clashes";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PARTICIPATION_STATUS } from "@/lib/constants";

type JoinLeaveControlProps = {
  clashId: string;
  status: "none" | "pending" | "accepted" | "rejected";
};

export function JoinLeaveControl({ clashId, status }: JoinLeaveControlProps) {
  const [isPending, startTransition] = useTransition();

  function handleJoin() {
    startTransition(async () => {
      const result = await joinClash(clashId);
      if (result.ok) {
        toast.success("Request sent", {
          description: "The host will review your request to join.",
        });
      } else {
        toast.error(result.error ?? "Could not join this clash.");
      }
    });
  }

  function handleLeave(message: string) {
    startTransition(async () => {
      const result = await leaveClash(clashId);
      if (result.ok) {
        toast.success(message);
      } else {
        toast.error(result.error ?? "Could not update your participation.");
      }
    });
  }

  if (status === "none") {
    return (
      <Button onClick={handleJoin} disabled={isPending}>
        <LogIn className="size-4" />
        Request to join
      </Button>
    );
  }

  if (status === "pending") {
    return (
      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="gap-1">
          <Clock className="size-3" />
          Request pending
        </Badge>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleLeave("Request withdrawn.")}
          disabled={isPending}
        >
          Cancel request
        </Button>
      </div>
    );
  }

  if (status === PARTICIPATION_STATUS.ACCEPTED) {
    return (
      <div className="flex items-center gap-2">
        <Badge className="gap-1 bg-emerald-600 text-white hover:bg-emerald-600">
          <Check className="size-3" />
          You&apos;re going
        </Badge>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleLeave("You left this clash.")}
          disabled={isPending}
        >
          <DoorOpen className="size-4" />
          Leave
        </Button>
      </div>
    );
  }

  // rejected
  return (
    <div className="flex items-center gap-2">
      <Badge variant="outline" className="gap-1 text-muted-foreground">
        <X className="size-3" />
        Request declined
      </Badge>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleLeave("Removed — you can request again.")}
        disabled={isPending}
      >
        Dismiss
      </Button>
    </div>
  );
}
