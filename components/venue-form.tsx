"use client";

import { useActionState } from "react";
import { VenueFormState } from "@/lib/definitions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

type VenueFormAction = (state: VenueFormState, formData: FormData) => Promise<VenueFormState>;

export function VenueForm({
  action,
  defaultValues,
  submitLabel = "Save",
}: {
  action: VenueFormAction;
  defaultValues?: {
    name: string;
    city: string;
    address: string | null;
    lat: number;
    lng: number;
  };
  submitLabel?: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" defaultValue={defaultValues?.name} required />
        {state?.errors?.name && (
          <p className="text-sm text-destructive">{state.errors.name[0]}</p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="city">City</Label>
        <Input id="city" name="city" defaultValue={defaultValues?.city} required />
        {state?.errors?.city && (
          <p className="text-sm text-destructive">{state.errors.city[0]}</p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="address">Address (optional)</Label>
        <Input id="address" name="address" defaultValue={defaultValues?.address ?? ""} />
        {state?.errors?.address && (
          <p className="text-sm text-destructive">{state.errors.address[0]}</p>
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
            defaultValue={defaultValues?.lat}
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
            defaultValue={defaultValues?.lng}
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
