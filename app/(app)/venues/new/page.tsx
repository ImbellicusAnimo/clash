import { createVenue } from "@/app/actions/venue";
import { VenueForm } from "@/components/venue-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function NewVenuePage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>New Venue</CardTitle>
      </CardHeader>
      <CardContent>
        <VenueForm action={createVenue} submitLabel="Create Venue" />
      </CardContent>
    </Card>
  );
}
