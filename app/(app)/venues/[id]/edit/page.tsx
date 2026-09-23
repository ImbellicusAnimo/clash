import { notFound } from "next/navigation";
import { getVenue, getUser } from "@/lib/dal";
import { updateVenue } from "@/app/actions/venue";
import { VenueForm } from "@/components/venue-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function EditVenuePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [venue, user] = await Promise.all([getVenue(id), getUser()]);
  if (!venue || venue.ownerId !== user.id) notFound();

  const boundUpdate = updateVenue.bind(null, venue.id);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Venue</CardTitle>
      </CardHeader>
      <CardContent>
        <VenueForm
          action={boundUpdate}
          defaultValues={{
            name: venue.name,
            city: venue.city,
            address: venue.address,
            lat: venue.lat,
            lng: venue.lng,
          }}
          submitLabel="Save changes"
        />
      </CardContent>
    </Card>
  );
}
