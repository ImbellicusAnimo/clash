"use client";

import { useActionState, useState } from "react";
import { ClashFormState } from "@/lib/definitions";
import { VenueOption } from "@/lib/dal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

type ClashFormAction = (state: ClashFormState, formData: FormData) => Promise<ClashFormState>;

function toDatetimeLocalValue(date?: Date | null): string {
  if (!date) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function ClashForm({
  action,
  venues,
  defaultValues,
  submitLabel = "Save",
}: {
  action: ClashFormAction;
  venues: VenueOption[];
  defaultValues?: {
    title: string;
    description: string | null;
    startAt: Date;
    endAt: Date | null;
    venueId: string | null;
    lat: number;
    lng: number;
  };
  submitLabel?: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const [venueId, setVenueId] = useState<string>(defaultValues?.venueId ?? "none");
  const initialVenue = venues.find((v) => v.id === defaultValues?.venueId);
  const [lat, setLat] = useState<string>(String(defaultValues?.lat ?? initialVenue?.lat ?? ""));
  const [lng, setLng] = useState<string>(String(defaultValues?.lng ?? initialVenue?.lng ?? ""));

  function handleVenueChange(next: string) {
    setVenueId(next);
    const venue = venues.find((v) => v.id === next);
    if (venue) {
      setLat(String(venue.lat));
      setLng(String(venue.lng));
    }
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" defaultValue={defaultValues?.title} required />
        {state?.errors?.title && (
          <p className="text-sm text-destructive">{state.errors.title[0]}</p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          defaultValue={defaultValues?.description ?? ""}
        />
        {state?.errors?.description && (
          <p className="text-sm text-destructive">{state.errors.description[0]}</p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="startAt">Start</Label>
        <Input
          id="startAt"
          name="startAt"
          type="datetime-local"
          defaultValue={toDatetimeLocalValue(defaultValues?.startAt)}
          required
        />
        {state?.errors?.startAt && (
          <p className="text-sm text-destructive">{state.errors.startAt[0]}</p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="endAt">End (optional)</Label>
        <Input
          id="endAt"
          name="endAt"
          type="datetime-local"
          defaultValue={toDatetimeLocalValue(defaultValues?.endAt)}
        />
        {state?.errors?.endAt && (
          <p className="text-sm text-destructive">{state.errors.endAt[0]}</p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="venueId">Venue (optional)</Label>
        <Select name="venueId" value={venueId} onValueChange={handleVenueChange}>
          <SelectTrigger id="venueId">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No venue</SelectItem>
            {venues.map((v) => (
              <SelectItem key={v.id} value={v.id}>
                {v.name} ({v.city})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {state?.errors?.venueId && (
          <p className="text-sm text-destructive">{state.errors.venueId[0]}</p>
        )}
      </div>

      <div className="flex gap-4">
        <div className="flex flex-1 flex-col gap-2">
          <Label htmlFor="lat">Latitude</Label>
          <Input
            id="lat"
            name="lat"
            type="number"
            step="any"
            value={lat}
            onChange={(e) => setLat(e.target.value)}
            readOnly={venueId !== "none"}
            required
          />
          {state?.errors?.lat && (
            <p className="text-sm text-destructive">{state.errors.lat[0]}</p>
          )}
        </div>
        <div className="flex flex-1 flex-col gap-2">
          <Label htmlFor="lng">Longitude</Label>
          <Input
            id="lng"
            name="lng"
            type="number"
            step="any"
            value={lng}
            onChange={(e) => setLng(e.target.value)}
            readOnly={venueId !== "none"}
            required
          />
          {state?.errors?.lng && (
            <p className="text-sm text-destructive">{state.errors.lng[0]}</p>
          )}
        </div>
      </div>

      {state?.message && <p className="text-sm text-destructive">{state.message}</p>}

      <Button type="submit" disabled={pending}>
        {pending ? "Saving..." : submitLabel}
      </Button>
    </form>
  );
}
