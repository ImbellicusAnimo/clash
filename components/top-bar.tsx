import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { SearchCommand } from "@/components/search-command";
import { NotificationsMenu } from "@/components/notifications-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import type { NotificationWithActor } from "@/lib/data/notifications";

export function TopBar({
  notifications,
  unreadCount,
}: {
  notifications: NotificationWithActor[];
  unreadCount: number;
}) {
  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-2 border-b bg-background/80 px-4 backdrop-blur supports-backdrop-filter:bg-background/60">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-1 hidden h-6 sm:block" />
      <div className="flex flex-1 items-center">
        <SearchCommand />
      </div>
      <div className="flex items-center gap-1">
        <NotificationsMenu
          notifications={notifications}
          unreadCount={unreadCount}
        />
        <ThemeToggle />
      </div>
    </header>
  );
}
