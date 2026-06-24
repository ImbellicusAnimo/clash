import type { Metadata } from "next";
import Link from "next/link";
import { LogOut } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { logout } from "@/app/actions/auth";
import { PageContainer, PageHeader } from "@/components/page";
import { ThemeOptions } from "@/components/settings/theme-options";
import { UserAvatar } from "@/components/user-avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Settings",
};

export default async function SettingsPage() {
  const user = await requireUser();

  return (
    <PageContainer className="max-w-3xl space-y-6">
      <PageHeader
        title="Settings"
        description="Manage your appearance and account."
      />

      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>
            Choose how Clash looks on this device.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ThemeOptions />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>Your Clash identity.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <UserAvatar
              name={user.name}
              avatar={user.avatar}
              className="size-12"
            />
            <div>
              <p className="font-medium">{user.name}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
            <Button asChild variant="outline" size="sm" className="ml-auto">
              <Link href="/profile">Edit profile</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Session</CardTitle>
          <CardDescription>Sign out of Clash on this device.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={logout}>
            <Button type="submit" variant="destructive">
              <LogOut className="size-4" />
              Log out
            </Button>
          </form>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
