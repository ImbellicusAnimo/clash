"use client";

import { useState } from "react";
import Link from "next/link";
import { CalendarPlus, MapPin, Plus, Sparkles } from "lucide-react";
import { Map } from "@/components/map/map";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ClashMarker, VenueMarker } from "@/lib/data/map";

type ExploreMapProps = {
  clashes: ClashMarker[];
  venues: VenueMarker[];
};

export function ExploreMap({ clashes, venues }: ExploreMapProps) {
  const [point, setPoint] = useState<{ lat: number; lng: number } | null>(null);
  const [open, setOpen] = useState(false);

  function handleMapClick(lat: number, lng: number) {
    setPoint({ lat, lng });
    setOpen(true);
  }

  const coordQuery = point
    ? `?lat=${point.lat.toFixed(6)}&lng=${point.lng.toFixed(6)}`
    : "";

  return (
    <div className="relative size-full">
      <Map
        clashes={clashes}
        venues={venues}
        point={point}
        onMapClick={handleMapClick}
      />

      {/* Legend */}
      <div className="pointer-events-none absolute left-4 top-4 z-1000 flex flex-col gap-2 rounded-xl border bg-background/85 p-3 text-sm shadow-lg backdrop-blur supports-backdrop-filter:bg-background/65">
        <div className="flex items-center gap-2">
          <span className="flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Sparkles className="size-3" />
          </span>
          <span>Clashes</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex size-5 items-center justify-center rounded-full bg-chart-2 text-white">
            <MapPin className="size-3" />
          </span>
          <span>Venues</span>
        </div>
      </div>

      {/* Hint */}
      <div className="pointer-events-none absolute bottom-4 left-1/2 z-1000 -translate-x-1/2 rounded-full border bg-background/85 px-4 py-2 text-center text-xs text-muted-foreground shadow-lg backdrop-blur supports-backdrop-filter:bg-background/65">
        Tap anywhere on the map to create a clash or venue
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create something here</DialogTitle>
            <DialogDescription>
              {point
                ? `Dropped a pin at ${point.lat.toFixed(4)}, ${point.lng.toFixed(4)}. What would you like to add?`
                : "Choose what to create at this location."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 sm:grid-cols-2">
            <Button
              asChild
              variant="outline"
              className="h-auto flex-col items-start gap-1 p-4 text-left"
            >
              <Link href={`/clashes/new${coordQuery}`}>
                <span className="flex items-center gap-2 font-medium">
                  <CalendarPlus className="size-4 text-primary" />
                  New clash
                </span>
                <span className="text-xs font-normal text-muted-foreground">
                  Host a meetup at this spot
                </span>
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-auto flex-col items-start gap-1 p-4 text-left"
            >
              <Link href={`/venues/new${coordQuery}`}>
                <span className="flex items-center gap-2 font-medium">
                  <Plus className="size-4 text-chart-2" />
                  New venue
                </span>
                <span className="text-xs font-normal text-muted-foreground">
                  Add a place clashes can use
                </span>
              </Link>
            </Button>
          </div>
          <DialogFooter className="sm:justify-start">
            <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
