"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import Link from "next/link";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
} from "react-leaflet";
import { BERLIN_CENTER, DEFAULT_ZOOM } from "@/lib/constants";
import { formatDateTime } from "@/lib/format";
import type { ClashMarker, VenueMarker } from "@/lib/data/map";
import { cn } from "@/lib/utils";

function pinIcon(variant: "clash" | "venue" | "pick"): L.DivIcon {
  const glyph =
    variant === "venue"
      ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"/><path d="M5 21V7l8-4v18"/><path d="M19 21V11l-6-4"/></svg>`
      : `<svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M13 2 3 14h7l-1 8 10-12h-7z"/></svg>`;
  return L.divIcon({
    className: "clash-marker",
    html: `<span class="clash-marker__pin clash-marker__pin--${variant}">${glyph}</span>`,
    iconSize: [30, 38],
    iconAnchor: [15, 38],
    popupAnchor: [0, -34],
  });
}

const CLASH_ICON = pinIcon("clash");
const VENUE_ICON = pinIcon("venue");
const PICK_ICON = pinIcon("pick");

function ClickHandler({
  onMapClick,
}: {
  onMapClick?: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      onMapClick?.(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export type LeafletMapProps = {
  className?: string;
  center?: { lat: number; lng: number };
  zoom?: number;
  clashes?: ClashMarker[];
  venues?: VenueMarker[];
  point?: { lat: number; lng: number } | null;
  pointVariant?: "clash" | "venue" | "pick";
  onMapClick?: (lat: number, lng: number) => void;
  scrollWheelZoom?: boolean;
  interactive?: boolean;
};

export default function LeafletMap({
  className,
  center = BERLIN_CENTER,
  zoom = DEFAULT_ZOOM,
  clashes = [],
  venues = [],
  point = null,
  pointVariant = "pick",
  onMapClick,
  scrollWheelZoom = true,
  interactive = true,
}: LeafletMapProps) {
  return (
    <MapContainer
      center={[center.lat, center.lng]}
      zoom={zoom}
      scrollWheelZoom={scrollWheelZoom}
      dragging={interactive}
      doubleClickZoom={interactive}
      zoomControl={interactive}
      attributionControl
      className={cn("size-full", className)}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {onMapClick && <ClickHandler onMapClick={onMapClick} />}

      {venues.map((v) => (
        <Marker
          key={`venue-${v.id}`}
          position={[v.latitude, v.longitude]}
          icon={VENUE_ICON}
        >
          <Popup>
            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Venue
              </p>
              <p className="font-semibold">{v.title}</p>
              <p className="text-sm text-muted-foreground">
                {v.clashCount} {v.clashCount === 1 ? "clash" : "clashes"} hosted
              </p>
              <Link
                href={`/venues/${v.id}`}
                className="inline-block pt-1 text-sm font-medium text-primary hover:underline"
              >
                View venue →
              </Link>
            </div>
          </Popup>
        </Marker>
      ))}

      {clashes.map((c) => (
        <Marker
          key={`clash-${c.id}`}
          position={[c.latitude, c.longitude]}
          icon={CLASH_ICON}
        >
          <Popup>
            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Clash
              </p>
              <p className="font-semibold">{c.title}</p>
              <p className="text-sm text-muted-foreground">
                {formatDateTime(c.dateTime)}
              </p>
              {c.venueTitle && (
                <p className="text-sm text-muted-foreground">
                  at {c.venueTitle}
                </p>
              )}
              <p className="text-sm text-muted-foreground">
                {c.participantCount} going
              </p>
              <Link
                href={`/clashes/${c.id}`}
                className="inline-block pt-1 text-sm font-medium text-primary hover:underline"
              >
                View clash →
              </Link>
            </div>
          </Popup>
        </Marker>
      ))}

      {point && (
        <Marker
          position={[point.lat, point.lng]}
          icon={
            pointVariant === "venue"
              ? VENUE_ICON
              : pointVariant === "clash"
                ? CLASH_ICON
                : PICK_ICON
          }
        />
      )}
    </MapContainer>
  );
}
