import "server-only";

import { prisma } from "@/lib/db/prisma";

export async function getFavoriteEvents(userId: string) {
  const favorites = await prisma.favorite.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { event: true },
  });
  return favorites.map((f) => f.event);
}

export async function getFavoriteEntries(userId: string) {
  const favorites = await prisma.favorite.findMany({
    where: { userId },
    orderBy: { event: { startDate: "desc" } },
    include: { event: true },
  });
  return favorites.map(({ event, attendedAt }) => ({ event, attendedAt }));
}

/** Set id event yang difavoritkan user ini, dipakai untuk menandai kartu event. */
export async function getFavoritedEventIds(userId?: string): Promise<Set<string>> {
  if (!userId) return new Set();
  const rows = await prisma.favorite.findMany({
    where: { userId },
    select: { eventId: true },
  });
  return new Set(rows.map((r) => r.eventId));
}

export async function isFavoritedByUser(userId: string, eventId: string) {
  const row = await prisma.favorite.findUnique({
    where: { userId_eventId: { userId, eventId } },
    select: { id: true },
  });
  return Boolean(row);
}
