"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Monitor, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

const OPTIONS = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
] as const;

export function ThemeOptions() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  // next-themes hydration guard.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  const active = mounted ? theme : undefined;

  return (
    <div className="grid grid-cols-3 gap-2 sm:max-w-md">
      {OPTIONS.map(({ value, label, icon: Icon }) => (
        <button
          key={value}
          type="button"
          onClick={() => setTheme(value)}
          aria-pressed={active === value}
          className={cn(
            "flex flex-col items-center gap-2 rounded-lg border p-4 text-sm transition-colors hover:bg-accent/50",
            active === value
              ? "border-primary bg-primary/5 text-foreground"
              : "border-border text-muted-foreground",
          )}
        >
          <Icon className="size-5" />
          {label}
        </button>
      ))}
    </div>
  );
}
