import Link from "next/link";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="border-b">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-lg font-semibold">
            Demo Project
          </Link>
          <nav className="flex items-center gap-4 text-sm text-muted-foreground">
            <Link href="/">Home</Link>
            <Link href="/dashboard">App</Link>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <div className="mx-auto max-w-5xl px-6 py-12">{children}</div>
      </main>
      <footer className="border-t">
        <div className="mx-auto max-w-5xl px-6 py-6 text-sm text-muted-foreground">
          © {new Date().getFullYear()} Demo Project
        </div>
      </footer>
    </div>
  );
}
