"use client";

import dynamic from "next/dynamic";

// Leaflet touches `window`/`document` at import time, so these must never be
// server-rendered. `ssr: false` is only allowed inside a Client Component
// (Next.js throws if used directly in a Server Component's dynamic import),
// which is why this thin wrapper exists — every page importing EntityMap/
// LocationPicker stays a plain Server Component itself.

export type { MapMarker } from "./entity-map";

function MapPlaceholder({ className }: { className?: string }) {
  return (
    <div
      className={`flex items-center justify-center rounded-md border bg-muted text-sm text-muted-foreground ${className ?? "h-96 w-full"}`}
    >
      Loading map…
    </div>
  );
}

export const EntityMap = dynamic(
  () => import("./entity-map").then((mod) => mod.EntityMap),
  {
    ssr: false,
    loading: () => <MapPlaceholder />,
  }
);

export const LocationPicker = dynamic(
  () => import("./location-picker").then((mod) => mod.LocationPicker),
  {
    ssr: false,
    loading: () => <MapPlaceholder className="h-80 w-full" />,
  }
);
