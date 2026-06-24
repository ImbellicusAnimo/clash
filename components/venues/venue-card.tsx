import Link from "next/link";
import { CalendarDays, MapPin } from "lucide-react";
import { UserAvatar } from "@/components/user-avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import type { VenueListItem } from "@/lib/data/venues";

export function VenueCard({ venue }: { venue: VenueListItem }) {
  return (
    <Card className="group relative gap-0 overflow-hidden py-0 transition-shadow hover:shadow-md">
      <CardContent className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold leading-tight">
            <Link
              href={`/venues/${venue.id}`}
              className="after:absolute after:inset-0"
            >
              {venue.title}
            </Link>
          </h3>
          <Badge variant="secondary" className="shrink-0 gap-1">
            <CalendarDays className="size-3" />
            {venue.clashCount}
          </Badge>
        </div>

        <p className="line-clamp-2 text-sm text-muted-foreground">
          {venue.description}
        </p>

        <p className="mt-auto flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="size-4 shrink-0" />
          <span>
            {venue.latitude.toFixed(4)}, {venue.longitude.toFixed(4)}
          </span>
        </p>
      </CardContent>

      <CardFooter className="border-t bg-muted/30 px-5 py-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <UserAvatar
            name={venue.creator.name}
            avatar={venue.creator.avatar}
            className="size-6"
          />
          <span className="truncate">
            Added by{" "}
            <span className="font-medium text-foreground">
              {venue.creator.name}
            </span>
          </span>
        </div>
      </CardFooter>
    </Card>
  );
}
