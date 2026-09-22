import Link from "next/link";
import { Separator } from "@/components/ui/separator";

const navItems = [{ href: "/dashboard", label: "Dashboard" }];

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-1">
      <aside className="w-64 shrink-0 border-r px-4 py-6">
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
      </aside>
      <main className="flex-1 px-8 py-8">{children}</main>
    </div>
  );
}
