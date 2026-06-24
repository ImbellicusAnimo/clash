"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, MapPin } from "lucide-react";
import { createVenue, updateVenue } from "@/app/actions/venues";
import { Map as LocationMap } from "@/components/map/map";
import { SubmitButton } from "@/components/submit-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BERLIN_CENTER } from "@/lib/constants";
import type { FormState } from "@/lib/form";

type VenueFormProps = {
  mode: "create" | "edit";
  defaultValues?: {
    id: string;
    title: string;
    description: string;
    latitude: number;
    longitude: number;
  };
  initialPoint?: { lat: number; lng: number } | null;
};

export function VenueForm({
  mode,
  defaultValues,
  initialPoint,
}: VenueFormProps) {
  const router = useRouter();
  const action = mode === "edit" ? updateVenue : createVenue;
  const [state, formAction] = useActionState<FormState, FormData>(
    action,
    undefined,
  );

  const [point, setPoint] = useState<{ lat: number; lng: number } | null>(
    defaultValues
      ? { lat: defaultValues.latitude, lng: defaultValues.longitude }
      : (initialPoint ?? null),
  );

  return (
    <form action={formAction} className="space-y-6">
      {mode === "edit" && defaultValues && (
        <input type="hidden" name="id" value={defaultValues.id} />
      )}
      <input type="hidden" name="latitude" value={point?.lat ?? ""} />
      <input type="hidden" name="longitude" value={point?.lng ?? ""} />

      {state?.error && (
        <div className="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          <AlertCircle className="size-4 shrink-0" />
          {state.error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Name</Label>
            <Input
              id="title"
              name="title"
              placeholder="Factory Berlin"
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
              rows={6}
              placeholder="What kind of place is this? What's it good for?"
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
        </div>

        <div className="space-y-2">
          <Label>Location</Label>
          <div className="h-72 overflow-hidden rounded-xl border">
            <LocationMap
              center={point ?? BERLIN_CENTER}
              zoom={point ? 14 : 12}
              point={point}
              onMapClick={(lat, lng) => setPoint({ lat, lng })}
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
          {mode === "edit" ? "Save changes" : "Create venue"}
        </SubmitButton>
        <Button type="button" variant="ghost" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
