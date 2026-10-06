import { cn } from "@/lib/utils";

const SIZES = { sm: "size-8 text-xs", md: "size-9 text-sm", lg: "size-11 text-base" } as const;

const initialsOf = (name = "?") =>
  name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "?";

/** Round initials badge used in the account menu and user lists. */
export function UserAvatar({ name, size = "sm", className }: { name?: string; size?: keyof typeof SIZES; className?: string }) {
  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-primary/15 font-medium text-primary",
        SIZES[size],
        className,
      )}
      aria-hidden
    >
      {initialsOf(name)}
    </span>
  );
}
