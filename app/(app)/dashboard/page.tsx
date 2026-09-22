import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function DashboardPage() {
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
          <CardTitle>Starter card</CardTitle>
        </CardHeader>
        <CardContent>Build your app UI here.</CardContent>
      </Card>
    </div>
  );
}
