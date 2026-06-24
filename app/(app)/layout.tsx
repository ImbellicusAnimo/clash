import type { ReactNode } from "react";
import { requireUser } from "@/lib/auth";
import { getNotifications, getUnreadCount } from "@/lib/data/notifications";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { TopBar } from "@/components/top-bar";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const user = await requireUser();
  const [notifications, unreadCount] = await Promise.all([
    getNotifications(user.id),
    getUnreadCount(user.id),
  ]);

  return (
    <SidebarProvider>
      <AppSidebar user={user} />
      <SidebarInset>
        <TopBar notifications={notifications} unreadCount={unreadCount} />
        <div className="flex flex-1 flex-col">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
