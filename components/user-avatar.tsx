import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials, hueFromString } from "@/lib/format";
import { cn } from "@/lib/utils";

export function UserAvatar({
  name,
  avatar,
  className,
}: {
  name: string;
  avatar?: string | null;
  className?: string;
}) {
  const hue = hueFromString(name);
  return (
    <Avatar className={cn("size-9", className)}>
      {avatar ? <AvatarImage src={avatar} alt={name} /> : null}
      <AvatarFallback
        className="font-medium"
        style={{
          backgroundColor: `oklch(0.92 0.05 ${hue})`,
          color: `oklch(0.45 0.13 ${hue})`,
        }}
      >
        {getInitials(name)}
      </AvatarFallback>
    </Avatar>
  );
}
