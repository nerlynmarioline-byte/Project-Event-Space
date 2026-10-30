"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Heart, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { toggleFavoriteAction } from "@/lib/actions/favorite-actions";

type FavoriteButtonProps = {
  eventId: string;
  initialFavorited: boolean;
  variant?: "icon" | "full";
};

export function FavoriteButton({
  eventId,
  initialFavorited,
  variant = "icon",
}: FavoriteButtonProps) {
  const router = useRouter();
  const [favorited, setFavorited] = React.useState(initialFavorited);
  const [isPending, startTransition] = React.useTransition();

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (isPending) return;

    const previous = favorited;
    setFavorited(!previous);

    startTransition(async () => {
      const result = await toggleFavoriteAction(eventId);

      if ("error" in result) {
        setFavorited(previous);
        if (result.error === "UNAUTHENTICATED") {
          router.push("/login");
        } else {
          toast.error("Gagal memperbarui favorit");
        }
        return;
      }

      setFavorited(result.favorited);
      router.refresh();
    });
  }

  const label = favorited ? "Hapus dari favorit" : "Tambah ke favorit";

  if (variant === "full") {
    return (
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        aria-pressed={favorited}
        className="inline-flex h-10 items-center gap-2 rounded-md border border-input px-4 text-sm font-medium transition-colors hover:bg-accent disabled:opacity-50"
      >
        {isPending ? (
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        ) : (
          <Heart className={cn("size-4", favorited && "fill-current text-destructive")} aria-hidden="true" />
        )}
        {label}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      aria-pressed={favorited}
      aria-label={label}
      className="flex size-8 items-center justify-center rounded-full bg-background/90 text-foreground shadow-sm transition-colors hover:bg-background disabled:opacity-50"
    >
      {isPending ? (
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
      ) : (
        <Heart className={cn("size-4", favorited && "fill-current text-destructive")} aria-hidden="true" />
      )}
    </button>
  );
}
