import { format, formatDistanceToNow, isPast } from "date-fns";

/** Up-to-two-letter initials derived from a name, for avatar fallbacks. */
export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** Deterministic accent hue (0–360) derived from a string seed. */
export function hueFromString(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % 360;
}

export function formatDateTime(date: Date | string): string {
  return format(new Date(date), "EEE, d MMM yyyy 'at' HH:mm");
}

export function formatDate(date: Date | string): string {
  return format(new Date(date), "d MMM yyyy");
}

export function formatTime(date: Date | string): string {
  return format(new Date(date), "HH:mm");
}

export function formatRelative(date: Date | string): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function isPastDate(date: Date | string): boolean {
  return isPast(new Date(date));
}
