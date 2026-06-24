"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export function SearchInput({ initialQuery }: { initialQuery: string }) {
  const router = useRouter();
  const [value, setValue] = useState(initialQuery);
  const [isPending, startTransition] = useTransition();
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const handle = setTimeout(() => {
      const q = value.trim();
      startTransition(() => {
        router.replace(q ? `/search?q=${encodeURIComponent(q)}` : "/search");
      });
    }, 250);
    return () => clearTimeout(handle);
  }, [value, router]);

  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        autoFocus
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search clashes, venues, and people…"
        className="h-11 pl-9"
        data-pending={isPending ? "" : undefined}
      />
    </div>
  );
}
