"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  UserPlus,
  Check,
  X,
  CalendarPlus,
  CheckCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatRelative } from "@/lib/format";
import {
  markAllNotificationsRead,
  markNotificationRead,
} from "@/app/actions/notifications";
import type { NotificationWithActor } from "@/lib/data/notifications";

const ICONS: Record<string, React.ElementType> = {
  join: UserPlus,
  accepted: Check,
  rejected: X,
  venue_clash: CalendarPlus,
};

export function NotificationsMenu({
  notifications,
  unreadCount,
}: {
  notifications: NotificationWithActor[];
  unreadCount: number;
}) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [, startTransition] = React.useTransition();

  function handleClick(n: NotificationWithActor) {
    if (!n.read) startTransition(() => markNotificationRead(n.id));
    if (n.clashId) {
      setOpen(false);
      router.push(`/clashes/${n.clashId}`);
    } else if (n.venueId) {
      setOpen(false);
      router.push(`/venues/${n.venueId}`);
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label="Notifications"
        >
          <Bell className="size-5" />
          {unreadCount > 0 && (
            <span className="absolute right-1.5 top-1.5 flex size-2 rounded-full bg-primary ring-2 ring-background" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="font-medium">Notifications</span>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                {unreadCount} new
              </Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1 px-2 text-xs"
              onClick={() => startTransition(() => markAllNotificationsRead())}
            >
              <CheckCheck className="size-3.5" />
              Mark all read
            </Button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
            <Bell className="size-8 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">
              No notifications yet.
            </p>
          </div>
        ) : (
          <ScrollArea className="h-88">
            <ul className="divide-y">
              {notifications.map((n) => {
                const Icon = ICONS[n.type] ?? Bell;
                return (
                  <li key={n.id}>
                    <button
                      onClick={() => handleClick(n)}
                      className={cn(
                        "flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-accent/50",
                        !n.read && "bg-accent/30",
                      )}
                    >
                      <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                        <Icon className="size-4" />
                      </span>
                      <span className="flex-1 space-y-0.5">
                        <span className="block text-sm leading-snug">
                          {n.message}
                        </span>
                        <span className="block text-xs text-muted-foreground">
                          {formatRelative(n.createdAt)}
                        </span>
                      </span>
                      {!n.read && (
                        <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </ScrollArea>
        )}
      </PopoverContent>
    </Popover>
  );
}
