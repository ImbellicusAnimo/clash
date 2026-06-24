"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { AlertCircle, MapPin } from "lucide-react";
import { createClash, updateClash } from "@/app/actions/clashes";
import { Map as LocationMap } from "@/components/map/map";
import { SubmitButton } from "@/components/submit-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BERLIN_CENTER } from "@/lib/constants";
import type { VenueOption } from "@/lib/data/clashes";
import type { FormState } from "@/lib/form";

const NO_VENUE = "none";

type ClashFormProps = {
  mode: "create" | "edit";
  venues: VenueOption[];
  defaultValues?: {
    id: string;
    title: string;
    description: string;
    dateTime: Date;
    latitude: number;
    longitude: number;
    venueId: string | null;
  };
  initialPoint?: { lat: number; lng: number } | null;
  initialVenueId?: string | null;
};

function toLocalInput(date: Date): string {
  return format(date, "yyyy-MM-dd'T'HH:mm");
}

export function ClashForm({
  mode,
  venues,
  defaultValues,
  initialPoint,
  initialVenueId,
}: ClashFormProps) {
  const router = useRouter();
  const action = mode === "edit" ? updateClash : createClash;
  const [state, formAction] = useActionState<FormState, FormData>(
    action,
    undefined,
  );

  const initialVenue =
    initialVenueId != null
      ? venues.find((v) => v.id === initialVenueId)
      : undefined;

  const [point, setPoint] = useState<{ lat: number; lng: number } | null>(
    defaultValues
      ? { lat: defaultValues.latitude, lng: defaultValues.longitude }
      : (initialPoint ??
          (initialVenue
            ? { lat: initialVenue.latitude, lng: initialVenue.longitude }
            : null)),
  );
  const [venueId, setVenueId] = useState<string>(
    defaultValues?.venueId ?? initialVenueId ?? NO_VENUE,
  );

  function handleVenueChange(value: string) {
    setVenueId(value);
    if (value !== NO_VENUE) {
      const venue = venues.find((v) => v.id === value);
      if (venue) setPoint({ lat: venue.latitude, lng: venue.longitude });
    }
  }

  function handleMapClick(lat: number, lng: number) {
    setPoint({ lat, lng });
  }

  return (
    <form action={formAction} className="space-y-6">
      {mode === "edit" && defaultValues && (
        <input type="hidden" name="id" value={defaultValues.id} />
      )}
      <input type="hidden" name="latitude" value={point?.lat ?? ""} />
      <input type="hidden" name="longitude" value={point?.lng ?? ""} />
      <input
        type="hidden"
        name="venueId"
        value={venueId === NO_VENUE ? "" : venueId}
      />

      {state?.error && (
        <div className="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          <AlertCircle className="size-4 shrink-0" />
          {state.error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              placeholder="Sunday morning run in Tiergarten"
              defaultValue={defaultValues?.title}
              aria-invalid={!!state?.fieldErrors?.title}
              required
            />
            {state?.fieldErrors?.title && (
              <p className="text-sm text-destructive">
                {state.fieldErrors.title}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              rows={5}
              placeholder="What's the plan? Who should come along?"
              defaultValue={defaultValues?.description}
              aria-invalid={!!state?.fieldErrors?.description}
              required
            />
            {state?.fieldErrors?.description && (
              <p className="text-sm text-destructive">
                {state.fieldErrors.description}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="dateTime">Date &amp; time</Label>
            <Input
              id="dateTime"
              name="dateTime"
              type="datetime-local"
              defaultValue={
                defaultValues ? toLocalInput(defaultValues.dateTime) : undefined
              }
              aria-invalid={!!state?.fieldErrors?.dateTime}
              required
            />
            {state?.fieldErrors?.dateTime && (
              <p className="text-sm text-destructive">
                {state.fieldErrors.dateTime}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="venue">Venue (optional)</Label>
            <Select value={venueId} onValueChange={handleVenueChange}>
              <SelectTrigger id="venue" className="w-full">
                <SelectValue placeholder="No venue — custom location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NO_VENUE}>
                  No venue — custom location
                </SelectItem>
                {venues.map((v) => (
                  <SelectItem key={v.id} value={v.id}>
                    {v.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Picking a venue sets the location for you.
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Location</Label>
          <div className="h-72 overflow-hidden rounded-xl border">
            <LocationMap
              center={point ?? BERLIN_CENTER}
              zoom={point ? 14 : 12}
              point={point}
              onMapClick={handleMapClick}
            />
          </div>
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin className="size-3.5" />
            {point
              ? `${point.lat.toFixed(5)}, ${point.lng.toFixed(5)} — tap the map to adjust`
              : "Tap the map to drop a pin"}
          </p>
          {state?.fieldErrors?.latitude && (
            <p className="text-sm text-destructive">Choose a location.</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <SubmitButton
          disabled={!point}
          pendingText={mode === "edit" ? "Saving…" : "Creating…"}
        >
          {mode === "edit" ? "Save changes" : "Create clash"}
        </SubmitButton>
        <Button type="button" variant="ghost" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
