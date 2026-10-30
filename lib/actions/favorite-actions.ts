"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/guards";

export type ToggleFavoriteResult =
  | { favorited: boolean }
  | { error: "UNAUTHENTICATED" | "NOT_FOUND" | "UNKNOWN" };

export async function toggleFavoriteAction(
  eventId: string
): Promise<ToggleFavoriteResult> {
  const user = await getCurrentUser();
  if (!user) return { error: "UNAUTHENTICATED" };

  try {
    const existing = await prisma.favorite.findUnique({
      where: { userId_eventId: { userId: user.id, eventId } },
    });

    if (existing) {
      await prisma.favorite.delete({ where: { id: existing.id } });
      revalidatePath("/favorites");
      return { favorited: false };
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { status: true },
    });
    if (!event || event.status === "DRAFT") return { error: "NOT_FOUND" };

    await prisma.favorite.create({ data: { userId: user.id, eventId } });
    revalidatePath("/favorites");
    return { favorited: true };
  } catch {
    return { error: "UNKNOWN" };
  }
}
