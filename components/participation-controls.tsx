"use client";

import { useActionState } from "react";
import { SimpleActionState } from "@/lib/definitions";
import { joinClash, leaveClash } from "@/app/actions/participation";
import { Button } from "@/components/ui/button";

export function ParticipationControls({
  clashId,
  status,
}: {
  clashId: string;
  status: "none" | "pending" | "accepted";
}) {
  const [joinState, joinAction, joinPending] = useActionState<SimpleActionState, FormData>(
    () => joinClash(clashId),
    undefined
  );
  const [leaveState, leaveAction, leavePending] = useActionState<SimpleActionState, FormData>(
    () => leaveClash(clashId),
    undefined
  );

  const state = status === "accepted" ? leaveState : joinState;

  return (
    <div className="flex flex-col items-end gap-1">
      {status === "none" && (
        <form action={joinAction}>
          <Button type="submit" disabled={joinPending}>
            {joinPending ? "Requesting..." : "Join"}
          </Button>
        </form>
      )}
      {status === "pending" && (
        <Button type="button" disabled variant="outline">
          Pending approval
        </Button>
      )}
      {status === "accepted" && (
        <form action={leaveAction}>
          <Button type="submit" variant="outline" disabled={leavePending}>
            {leavePending ? "Leaving..." : "Leave"}
          </Button>
        </form>
      )}
      {state?.message && <p className="text-sm text-destructive">{state.message}</p>}
    </div>
  );
}
