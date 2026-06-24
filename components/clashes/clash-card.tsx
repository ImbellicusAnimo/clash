import Link from "next/link";
import { CalendarDays, MapPin, Users } from "lucide-react";
import { UserAvatar } from "@/components/user-avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { formatDateTime, isPastDate } from "@/lib/format";
import type { ClashListItem } from "@/lib/data/clashes";

export function ClashCard({ clash }: { clash: ClashListItem }) {
  const past = isPastDate(clash.dateTime);

  return (
    <Card className="group relative gap-0 overflow-hidden py-0 transition-shadow hover:shadow-md">
      <CardContent className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold leading-tight">
            <Link
              href={`/clashes/${clash.id}`}
              className="after:absolute after:inset-0"
            >
              {clash.title}
            </Link>
          </h3>
          {past && (
            <Badge variant="secondary" className="shrink-0">
              Past
            </Badge>
          )}
        </div>

        <p className="line-clamp-2 text-sm text-muted-foreground">
          {clash.description}
        </p>

        <dl className="mt-auto space-y-1.5 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <CalendarDays className="size-4 shrink-0" />
            <span>{formatDateTime(clash.dateTime)}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="size-4 shrink-0" />
            <span className="truncate">
              {clash.venue ? clash.venue.title : "Custom location"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="size-4 shrink-0" />
            <span>
              {clash.goingCount} {clash.goingCount === 1 ? "person" : "people"}{" "}
              going
            </span>
          </div>
        </dl>
      </CardContent>

      <CardFooter className="border-t bg-muted/30 px-5 py-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <UserAvatar
            name={clash.creator.name}
            avatar={clash.creator.avatar}
            className="size-6"
          />
          <span className="truncate">
            Hosted by{" "}
            <span className="font-medium text-foreground">
              {clash.creator.name}
            </span>
          </span>
        </div>
      </CardFooter>
    </Card>
  );
}
