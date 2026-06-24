"use client";

import { useActionState } from "react";
import Link from "next/link";
import { register } from "@/app/actions/auth";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle } from "lucide-react";

export function RegisterForm() {
  const [state, formAction] = useActionState(register, undefined);

  return (
    <form action={formAction} className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          Create your account
        </h1>
        <p className="text-sm text-muted-foreground">
          Join Clash and start discovering Berlin.
        </p>
      </div>

      {state?.error && (
        <div className="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          <AlertCircle className="size-4 shrink-0" />
          {state.error}
        </div>
      )}

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            name="name"
            autoComplete="name"
            placeholder="Your name"
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
            autoComplete="email"
            placeholder="you@example.com"
            aria-invalid={!!state?.fieldErrors?.email}
            required
          />
          {state?.fieldErrors?.email && (
            <p className="text-sm text-destructive">
              {state.fieldErrors.email}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            placeholder="Choose a password"
            aria-invalid={!!state?.fieldErrors?.password}
            required
          />
          {state?.fieldErrors?.password && (
            <p className="text-sm text-destructive">
              {state.fieldErrors.password}
            </p>
          )}
        </div>
      </div>

      <SubmitButton className="w-full" pendingText="Creating account…">
        Sign up
      </SubmitButton>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          Log in
        </Link>
      </p>
    </form>
  );
}
