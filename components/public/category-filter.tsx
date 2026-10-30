import Link from "next/link";

import { EVENT_CATEGORIES } from "@/lib/validation/event";
import { cn } from "@/lib/utils";

export function CategoryFilter({ active }: { active?: string }) {
  const items = ["Semua", ...EVENT_CATEGORIES];

  return (
    <div className="flex flex-wrap justify-center gap-2">
      {items.map((item) => {
        const isActive = active ? active === item : item === "Semua";
        const href = item === "Semua" ? "/events" : `/events?category=${encodeURIComponent(item)}`;
        return (
          <Link
            key={item}
            href={href}
            className={cn(
              "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
              isActive
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border hover:bg-secondary"
            )}
          >
            {item}
          </Link>
        );
      })}
    </div>
  );
}
