import Link from "next/link";
import { getNotifications, getUser, NotificationItem } from "@/lib/dal";
import { markNotificationRead, markAllNotificationsRead } from "@/app/actions/notification";
import { Button } from "@/components/ui/button";
import { cn } from "cn";

function notificationMessage(n: NotificationItem): string {
  switch (n.type) {
    case "join_request":
      return `New join request for "${n.clash?.title ?? "a Clash"}".`;
    case "join_accepted":
      return `Your request to join "${n.clash?.title ?? "a Clash"}" was accepted.`;
    case "join_rejected":
      return `Your request to join "${n.clash?.title ?? "a Clash"}" was declined.`;
    case "new_clash_at_venue":
      return `A new Clash "${n.clash?.title ?? ""}" was created at your venue "${n.clash?.venue?.name ?? ""}".`;
    default:
      return n.type;
  }
}

export default async function NotificationsPage() {
  const user = await getUser();
  const notifications = await getNotifications(user.id);
  const hasUnread = notifications.some((n) => !n.isRead);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Notifications</h1>
        {hasUnread && (
          <form action={markAllNotificationsRead}>
            <Button type="submit" variant="outline" size="sm">
              Mark all as read
            </Button>
          </form>
        )}
      </div>

      <ul className="space-y-2">
        {notifications.map((n) => (
          <li
            key={n.id}
            className={cn(
              "flex items-center justify-between gap-4 rounded-lg border p-3 text-sm",
              !n.isRead && "border-primary/40 bg-muted/40"
            )}
          >
            <div className="flex items-start gap-2">
              {!n.isRead && <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" />}
              <div>
                {n.clash ? (
                  <Link href={`/clashes/${n.clash.id}`} className="font-medium hover:underline">
                    {notificationMessage(n)}
                  </Link>
                ) : (
                  <span className="font-medium">{notificationMessage(n)}</span>
                )}
                <p className="text-muted-foreground">{n.createdAt.toLocaleString()}</p>
              </div>
            </div>
            {!n.isRead && (
              <form action={markNotificationRead.bind(null, n.id)}>
                <Button type="submit" variant="ghost" size="sm">
                  Mark as read
                </Button>
              </form>
            )}
          </li>
        ))}
        {notifications.length === 0 && (
          <li className="text-sm text-muted-foreground">No notifications yet.</li>
        )}
      </ul>
    </div>
  );
}
