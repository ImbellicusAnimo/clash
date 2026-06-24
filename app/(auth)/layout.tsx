import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { Logo } from "@/components/logo";
import { MapPin, Users, CalendarDays } from "lucide-react";

export default async function AuthLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  return (
    <div className="grid min-h-svh flex-1 lg:grid-cols-2">
      <div className="flex flex-col gap-8 p-6 md:p-10">
        <Logo href="/" />
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-sm">{children}</div>
        </div>
      </div>

      <div className="relative hidden overflow-hidden bg-primary lg:block">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.18),transparent_45%),radial-gradient(circle_at_80%_70%,rgba(255,255,255,0.12),transparent_40%)]" />
        <div className="relative flex h-full flex-col justify-between p-12 text-primary-foreground">
          <div className="max-w-md space-y-4">
            <h2 className="text-3xl font-semibold leading-tight tracking-tight">
              Discover what&apos;s happening in Berlin.
            </h2>
            <p className="text-primary-foreground/80">
              Find clashes on the map, host your own at a venue, and meet the
              people building the city&apos;s communities.
            </p>
          </div>
          <ul className="space-y-4">
            {[
              {
                icon: MapPin,
                text: "Explore clashes and venues on a live map",
              },
              {
                icon: CalendarDays,
                text: "Create and join clashes in seconds",
              },
              {
                icon: Users,
                text: "Manage participants and requests with ease",
              },
            ].map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3">
                <span className="flex size-9 items-center justify-center rounded-lg bg-white/15">
                  <Icon className="size-5" />
                </span>
                <span className="text-primary-foreground/90">{text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
