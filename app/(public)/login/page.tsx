"use client";

import { useActionState } from "react";
import Link from "next/link";
import { login } from "@/app/actions/auth";
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

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, undefined);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Log in</CardTitle>
        <CardDescription>Welcome back to Demo Project.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={action} className="flex flex-col gap-4">
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
              <p className="text-sm text-destructive">{state.errors.password[0]}</p>
            )}
          </div>
          {state?.message && (
            <p className="text-sm text-destructive">{state.message}</p>
          )}
          <Button type="submit" disabled={pending}>
            {pending ? "Logging in..." : "Log in"}
          </Button>
        </form>
        <p className="mt-4 text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="underline">
            Sign up
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
