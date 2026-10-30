import "server-only";

import { Prisma, EventStatus } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";

export const ADMIN_PAGE_SIZE = 10;

type GetAdminEventsParams = {
  page?: number;
  search?: string;
  status?: EventStatus | "ALL";
};

export async function getAdminEvents({
  page = 1,
  search,
  status,
}: GetAdminEventsParams = {}) {
  const where: Prisma.EventWhereInput = {
    ...(search
      ? { title: { contains: search, mode: "insensitive" as const } }
      : {}),
    ...(status && status !== "ALL" ? { status } : {}),
  };

  const safePage = Math.max(1, page);

  const [events, totalCount] = await Promise.all([
    prisma.event.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (safePage - 1) * ADMIN_PAGE_SIZE,
      take: ADMIN_PAGE_SIZE,
    }),
    prisma.event.count({ where }),
  ]);

  return {
    events,
    totalCount,
    totalPages: Math.max(1, Math.ceil(totalCount / ADMIN_PAGE_SIZE)),
    page: safePage,
  };
}

export async function getRecentEvents(limit = 5) {
  return prisma.event.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function getEventStats() {
  const grouped = await prisma.event.groupBy({
    by: ["status"],
    _count: { _all: true },
  });

  const counts: Record<EventStatus, number> = {
    DRAFT: 0,
    PUBLISHED: 0,
    CANCELLED: 0,
    FINISHED: 0,
  };
  for (const row of grouped) counts[row.status] = row._count._all;

  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  return { total, ...counts };
}

export async function getEventByIdForAdmin(id: string) {
  return prisma.event.findUnique({ where: { id } });
}
