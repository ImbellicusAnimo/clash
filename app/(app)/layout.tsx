import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { getUser } from "@/lib/dal";
import { logout } from "@/app/actions/auth";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/clashes", label: "Clashes" },
  { href: "/venues", label: "Venues" },
];

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();

  return (
    <div className="flex min-h-full flex-1">
      <aside className="flex w-64 shrink-0 flex-col border-r px-4 py-6">
        <div className="mb-6 text-lg font-semibold">Demo Project</div>
        <Separator className="mb-4" />
        <nav className="flex flex-col gap-2 text-sm">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded px-2 py-1.5 hover:bg-muted"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto flex flex-col gap-2 pt-4">
          <Separator />
          <p className="truncate px-2 pt-2 text-sm text-muted-foreground">
            {user.name}
          </p>
          <form action={logout}>
            <Button type="submit" variant="outline" className="w-full">
              Log out
            </Button>
          </form>
        </div>
      </aside>
      <main className="flex-1 px-8 py-8">{children}</main>
    </div>
  );
}
