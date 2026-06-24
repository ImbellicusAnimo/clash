"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import type { LeafletMapProps } from "./leaflet-map";

const LeafletMap = dynamic(() => import("./leaflet-map"), {
  ssr: false,
  loading: () => <Skeleton className="size-full rounded-none" />,
});

export function Map(props: LeafletMapProps) {
  return <LeafletMap {...props} />;
}
