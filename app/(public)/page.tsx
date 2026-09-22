import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function LandingPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Welcome to Demo Project</CardTitle>
        <CardDescription>
          A minimal Next.js + shadcn/ui starter for the workshop.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button asChild>
          <Link href="/dashboard">Go to the app</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
