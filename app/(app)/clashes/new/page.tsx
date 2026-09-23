import { getVenues } from "@/lib/dal";
import { createClash } from "@/app/actions/clash";
import { ClashForm } from "@/components/clash-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function NewClashPage() {
  const venues = await getVenues();
  return (
    <Card>
      <CardHeader>
        <CardTitle>New Clash</CardTitle>
      </CardHeader>
      <CardContent>
        <ClashForm action={createClash} venues={venues} submitLabel="Create Clash" />
      </CardContent>
    </Card>
  );
}
