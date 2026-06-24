import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import { PageContainer, PageHeader } from "@/components/page";
import { UserAvatar } from "@/components/user-avatar";
import { AvatarCropper } from "@/components/profile/avatar-cropper";
import { ProfileForm } from "@/components/profile/profile-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Profile",
};

export default async function ProfilePage() {
  const user = await requireUser();

  return (
    <PageContainer className="max-w-3xl space-y-6">
      <PageHeader
        title="Profile"
        description="Manage how you appear across Clash."
      />

      <Card>
        <CardHeader>
          <CardTitle>Photo</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-5">
          <UserAvatar
            name={user.name}
            avatar={user.avatar}
            className="size-20 text-xl"
          />
          <div className="space-y-2">
            <AvatarCropper hasAvatar={!!user.avatar} />
            <p className="text-xs text-muted-foreground">
              Joined {formatDate(user.createdAt)}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent>
          <ProfileForm
            defaultValues={{
              name: user.name,
              email: user.email,
              bio: user.bio,
            }}
          />
        </CardContent>
      </Card>
    </PageContainer>
  );
}
