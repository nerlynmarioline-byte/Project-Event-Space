import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SearchBar({
  defaultValue,
  size = "default",
}: {
  defaultValue?: string;
  size?: "default" | "lg";
}) {
  const isLg = size === "lg";
  return (
    <form action="/events" method="GET" className="flex w-full items-center gap-2">
      <div className="relative flex-1">
        <Search
          className={cn(
            "pointer-events-none absolute top-1/2 -translate-y-1/2 text-muted-foreground",
            isLg ? "left-5 size-5" : "left-3 size-4"
          )}
          aria-hidden="true"
        />
        <Input
          type="search"
          name="search"
          defaultValue={defaultValue}
          placeholder="Cari event, konser, workshop, komunitas..."
          aria-label="Cari event"
          className={cn(isLg ? "h-14 rounded-full pl-12 text-base" : "pl-9")}
        />
      </div>
      <Button type="submit" size={isLg ? "lg" : "default"} className={isLg ? "h-14 rounded-full px-8" : undefined}>
        Jelajahi Event
      </Button>
    </form>
  );
}
