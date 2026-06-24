import type { Metadata } from "next";
import { getMapMarkers } from "@/lib/data/map";
import { ExploreMap } from "@/components/map/explore-map";

export const metadata: Metadata = {
  title: "Map",
};

export default async function MapPage() {
  const { clashes, venues } = await getMapMarkers();

  return (
    <div className="flex-1">
      <ExploreMap clashes={clashes} venues={venues} />
    </div>
  );
}
