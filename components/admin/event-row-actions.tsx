"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
  CheckCircle2,
  EyeOff,
  Ban,
} from "lucide-react";
import { toast } from "sonner";
import type { EventStatus } from "@prisma/client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import {
  deleteEventAction,
  publishEventAction,
  unpublishEventAction,
  cancelEventAction,
} from "@/lib/actions/event-actions";

type ActionResult = { success?: true; error?: string } | undefined;

type EventRowActionsProps = {
  eventId: string;
  eventTitle: string;
  slug: string;
  status: EventStatus;
};

export function EventRowActions({
  eventId,
  eventTitle,
  slug,
  status,
}: EventRowActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();
  const [confirmOpen, setConfirmOpen] = React.useState(false);

  function runAction(
    action: () => Promise<ActionResult>,
    successMessage: string
  ) {
    startTransition(async () => {
      const result = await action();
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success(successMessage);
        setConfirmOpen(false);
        router.refresh();
      }
    });
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Menu aksi untuk ${eventTitle}`}
            disabled={isPending}
          >
            <MoreHorizontal className="size-4" aria-hidden="true" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link href={`/events/${slug}`} target="_blank">
              <Eye aria-hidden="true" />
              Lihat
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={`/admin/events/${eventId}/edit`}>
              <Pencil aria-hidden="true" />
              Edit
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {status !== "PUBLISHED" && (
            <DropdownMenuItem
              onSelect={() =>
                runAction(
                  () => publishEventAction(eventId),
                  "Event dipublikasikan"
                )
              }
            >
              <CheckCircle2 aria-hidden="true" />
              Publish
            </DropdownMenuItem>
          )}
          {status === "PUBLISHED" && (
            <DropdownMenuItem
              onSelect={() =>
                runAction(
                  () => unpublishEventAction(eventId),
                  "Publikasi dibatalkan"
                )
              }
            >
              <EyeOff aria-hidden="true" />
              Unpublish
            </DropdownMenuItem>
          )}
          {status !== "CANCELLED" && (
            <DropdownMenuItem
              onSelect={() =>
                runAction(() => cancelEventAction(eventId), "Event dibatalkan")
              }
            >
              <Ban aria-hidden="true" />
              Batalkan event
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onSelect={() => setConfirmOpen(true)}
          >
            <Trash2 aria-hidden="true" />
            Hapus
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={`Hapus "${eventTitle}"?`}
        description="Tindakan ini tidak bisa dibatalkan. Data favorit yang terkait ikut terhapus."
        isPending={isPending}
        onConfirm={() =>
          runAction(() => deleteEventAction(eventId), "Event dihapus")
        }
      />
    </>
  );
}
