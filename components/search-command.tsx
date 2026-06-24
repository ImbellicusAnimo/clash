"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search, Zap, Building2, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { searchAction } from "@/app/actions/search";
import type { SearchResults } from "@/lib/data/search";
import { formatDate } from "@/lib/format";

const EMPTY: SearchResults = { clashes: [], venues: [], users: [] };

export function SearchCommand() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<SearchResults>(EMPTY);
  const [isPending, startTransition] = React.useTransition();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  React.useEffect(() => {
    if (!open) return;
    const q = query.trim();
    const handle = setTimeout(
      () => {
        startTransition(async () => {
          setResults(q ? await searchAction(q) : EMPTY);
        });
      },
      q ? 200 : 0,
    );
    return () => clearTimeout(handle);
  }, [query, open]);

  function go(href: string) {
    setOpen(false);
    setQuery("");
    router.push(href);
  }

  const hasResults =
    results.clashes.length + results.venues.length + results.users.length > 0;

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setOpen(true)}
        className="relative h-9 w-full justify-start gap-2 px-3 text-muted-foreground sm:w-64 md:w-72"
      >
        <Search className="size-4" />
        <span className="truncate">Search…</span>
        <kbd className="pointer-events-none absolute right-2 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium sm:flex">
          ⌘K
        </kbd>
      </Button>

      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title="Search Clash"
        description="Search clashes, venues, and people"
      >
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search clashes, venues, people…"
            value={query}
            onValueChange={setQuery}
          />
          <CommandList>
            <CommandEmpty>
              {query.trim()
                ? isPending
                  ? "Searching…"
                  : "No results found."
                : "Type to search across Clash."}
            </CommandEmpty>

            {results.clashes.length > 0 && (
              <CommandGroup heading="Clashes">
                {results.clashes.map((c) => (
                  <CommandItem
                    key={c.id}
                    value={`clash-${c.id}`}
                    onSelect={() => go(`/clashes/${c.id}`)}
                  >
                    <Zap className="text-muted-foreground" />
                    <span className="flex-1 truncate">{c.title}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(c.dateTime)}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {results.venues.length > 0 && (
              <>
                {results.clashes.length > 0 && <CommandSeparator />}
                <CommandGroup heading="Venues">
                  {results.venues.map((v) => (
                    <CommandItem
                      key={v.id}
                      value={`venue-${v.id}`}
                      onSelect={() => go(`/venues/${v.id}`)}
                    >
                      <Building2 className="text-muted-foreground" />
                      <span className="flex-1 truncate">{v.title}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}

            {results.users.length > 0 && (
              <>
                {hasResults && <CommandSeparator />}
                <CommandGroup heading="People">
                  {results.users.map((u) => (
                    <CommandItem
                      key={u.id}
                      value={`user-${u.id}`}
                      onSelect={() => go(`/users/${u.id}`)}
                    >
                      <UserIcon className="text-muted-foreground" />
                      <span className="flex-1 truncate">{u.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {u.email}
                      </span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  );
}
