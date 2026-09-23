"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import { DEFAULT_CENTER, DEFAULT_ZOOM } from "./entity-map";

const pickerIcon = L.divIcon({
  className: "",
  html: '<div style="width:18px;height:18px;background:#111827;border:2px solid white;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 1px 3px rgba(0,0,0,0.4)"></div>',
  iconSize: [18, 18],
  iconAnchor: [9, 18],
});

function ClickHandler({
  readOnly,
  onChange,
}: {
  readOnly: boolean;
  onChange: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      if (readOnly) return;
      onChange(
        Math.round(e.latlng.lat * 1e6) / 1e6,
        Math.round(e.latlng.lng * 1e6) / 1e6
      );
    },
  });
  return null;
}

function RecenterOnChange({ lat, lng }: { lat: number | null; lng: number | null }) {
  const map = useMap();

  useEffect(() => {
    if (lat === null || lng === null) return;
    map.setView([lat, lng], map.getZoom() < 10 ? DEFAULT_ZOOM : map.getZoom());
  }, [map, lat, lng]);

  return null;
}

export function LocationPicker({
  lat,
  lng,
  onChange,
  readOnly = false,
  className = "h-80 w-full",
}: {
  lat: number | null;
  lng: number | null;
  onChange: (lat: number, lng: number) => void;
  readOnly?: boolean;
  className?: string;
}) {
  const center: [number, number] = lat !== null && lng !== null ? [lat, lng] : DEFAULT_CENTER;

  return (
    <MapContainer
      center={center}
      zoom={lat !== null && lng !== null ? DEFAULT_ZOOM : DEFAULT_ZOOM - 2}
      className={className}
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ClickHandler readOnly={readOnly} onChange={onChange} />
      <RecenterOnChange lat={lat} lng={lng} />
      {lat !== null && lng !== null && <Marker position={[lat, lng]} icon={pickerIcon} />}
    </MapContainer>
  );
}
