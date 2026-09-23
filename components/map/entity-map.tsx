"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import Link from "next/link";

// Default center: Dachau (per explicit request — the app otherwise defaults
// conceptually to Berlin, but the map view itself starts here).
export const DEFAULT_CENTER: [number, number] = [48.2603, 11.4342];
export const DEFAULT_ZOOM = 12;

export type MapMarker = {
  id: string;
  kind: "venue" | "clash";
  label: string;
  lat: number;
  lng: number;
};

// Plain CSS divIcons instead of Leaflet's default image markers — the
// default marker images don't resolve correctly through bundlers without
// extra webpack/asset config, and divIcons keep the two kinds visually
// distinct without needing marker image assets at all.
const venueIcon = L.divIcon({
  className: "",
  html: '<div style="width:20px;height:20px;background:#0891b2;border:2px solid white;border-radius:4px;box-shadow:0 1px 3px rgba(0,0,0,0.4)"></div>',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

const clashIcon = L.divIcon({
  className: "",
  html: '<div style="width:14px;height:14px;background:#dc2626;border:2px solid white;border-radius:50%;box-shadow:0 1px 3px rgba(0,0,0,0.4)"></div>',
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

function FitToMarkers({ markers }: { markers: MapMarker[] }) {
  const map = useMap();

  useEffect(() => {
    if (markers.length === 0) return;
    if (markers.length === 1) {
      map.setView([markers[0].lat, markers[0].lng], DEFAULT_ZOOM);
      return;
    }
    const bounds = L.latLngBounds(markers.map((m) => [m.lat, m.lng] as [number, number]));
    map.fitBounds(bounds, { padding: [32, 32] });
  }, [map, markers]);

  return null;
}

export function EntityMap({
  markers,
  className = "h-96 w-full",
}: {
  markers: MapMarker[];
  className?: string;
}) {
  return (
    <MapContainer
      center={DEFAULT_CENTER}
      zoom={DEFAULT_ZOOM}
      className={className}
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitToMarkers markers={markers} />
      {markers.map((marker) => (
        <Marker
          key={`${marker.kind}-${marker.id}`}
          position={[marker.lat, marker.lng]}
          icon={marker.kind === "venue" ? venueIcon : clashIcon}
          zIndexOffset={marker.kind === "clash" ? 100 : 0}
        >
          <Popup>
            <Link
              href={marker.kind === "venue" ? `/venues/${marker.id}` : `/clashes/${marker.id}`}
              className="font-medium hover:underline"
            >
              {marker.label}
            </Link>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
