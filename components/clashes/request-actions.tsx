"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Check, X } from "lucide-react";
import { acceptRequest, rejectRequest } from "@/app/actions/clashes";
import { Button } from "@/components/ui/button";

export function RequestActions({
  participationId,
}: {
  participationId: string;
}) {
  const [isPending, startTransition] = useTransition();

  function review(kind: "accept" | "reject") {
    startTransition(async () => {
      const result =
        kind === "accept"
          ? await acceptRequest(participationId)
          : await rejectRequest(participationId);
      if (result.ok) {
        toast.success(
          kind === "accept" ? "Request accepted." : "Request declined.",
        );
      } else {
        toast.error(result.error ?? "Could not update the request.");
      }
    });
  }

  return (
    <div className="flex items-center gap-2">
      <Button size="sm" onClick={() => review("accept")} disabled={isPending}>
        <Check className="size-4" />
        Accept
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={() => review("reject")}
        disabled={isPending}
      >
        <X className="size-4" />
        Decline
      </Button>
    </div>
  );
}
