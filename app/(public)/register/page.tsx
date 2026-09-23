"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signup } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function RegisterPage() {
  const [state, action, pending] = useActionState(signup, undefined);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create an account</CardTitle>
        <CardDescription>
          Sign up to start hosting and joining Clashes.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={action} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" type="text" required />
            {state?.errors?.name && (
              <p className="text-sm text-destructive">{state.errors.name[0]}</p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="username">Username</Label>
            <Input id="username" name="username" type="text" required />
            {state?.errors?.username && (
              <p className="text-sm text-destructive">{state.errors.username[0]}</p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" required />
            {state?.errors?.password && (
              <ul className="text-sm text-destructive">
                {state.errors.password.map((err) => (
                  <li key={err}>{err}</li>
                ))}
              </ul>
            )}
          </div>
          {state?.message && (
            <p className="text-sm text-destructive">{state.message}</p>
          )}
          <Button type="submit" disabled={pending}>
            {pending ? "Creating account..." : "Sign up"}
          </Button>
        </form>
        <p className="mt-4 text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="underline">
            Log in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
