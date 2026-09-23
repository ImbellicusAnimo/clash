import { notFound } from "next/navigation";
import { getClash, getUser, getVenues } from "@/lib/dal";
import { updateClash } from "@/app/actions/clash";
import { ClashForm } from "@/components/clash-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function EditClashPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [clash, user, venues] = await Promise.all([getClash(id), getUser(), getVenues()]);
  if (!clash || clash.hostId !== user.id) notFound();

  const boundUpdate = updateClash.bind(null, clash.id);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Clash</CardTitle>
      </CardHeader>
      <CardContent>
        <ClashForm
          action={boundUpdate}
          venues={venues}
          defaultValues={{
            title: clash.title,
            description: clash.description,
            startAt: clash.startAt,
            endAt: clash.endAt,
            venueId: clash.venueId,
            lat: clash.lat,
            lng: clash.lng,
          }}
          submitLabel="Save changes"
        />
      </CardContent>
    </Card>
  );
}
