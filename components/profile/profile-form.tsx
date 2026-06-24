"use client";

import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { AlertCircle } from "lucide-react";
import { updateProfile } from "@/app/actions/profile";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { FormState } from "@/lib/form";

type ProfileFormProps = {
  defaultValues: { name: string; email: string; bio: string | null };
};

export function ProfileForm({ defaultValues }: ProfileFormProps) {
  const [state, formAction] = useActionState<FormState, FormData>(
    updateProfile,
    undefined,
  );
  const lastMessage = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (state?.ok && state.message && state.message !== lastMessage.current) {
      lastMessage.current = state.message;
      toast.success(state.message);
    }
  }, [state]);

  return (
    <form action={formAction} className="space-y-5">
      {state?.error && (
        <div className="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          <AlertCircle className="size-4 shrink-0" />
          {state.error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          name="name"
          defaultValue={defaultValues.name}
          aria-invalid={!!state?.fieldErrors?.name}
          required
        />
        {state?.fieldErrors?.name && (
          <p className="text-sm text-destructive">{state.fieldErrors.name}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          defaultValue={defaultValues.email}
          disabled
          readOnly
        />
        <p className="text-xs text-muted-foreground">
          Your email can&apos;t be changed.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">Bio</Label>
        <Textarea
          id="bio"
          name="bio"
          rows={4}
          placeholder="Tell people a little about yourself…"
          defaultValue={defaultValues.bio ?? ""}
          aria-invalid={!!state?.fieldErrors?.bio}
        />
        {state?.fieldErrors?.bio && (
          <p className="text-sm text-destructive">{state.fieldErrors.bio}</p>
        )}
      </div>

      <SubmitButton pendingText="Saving…">Save changes</SubmitButton>
    </form>
  );
}
