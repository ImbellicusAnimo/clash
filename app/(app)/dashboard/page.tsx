import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getMapMarkers } from "@/lib/dal";
import { EntityMap } from "@/components/map";

export default async function DashboardPage() {
  const markers = await getMapMarkers();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Authenticated app area — sidebar layout starter.
        </p>
      </div>
      <Separator />
      <Card>
        <CardHeader>
          <CardTitle>Discover</CardTitle>
        </CardHeader>
        <CardContent>
          <EntityMap markers={markers} className="h-96 w-full rounded-md" />
        </CardContent>
      </Card>
    </div>
  );
}
