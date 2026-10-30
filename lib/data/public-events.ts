import "server-only";

import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";

export const PUBLIC_PAGE_SIZE = 12;

export type DateRangeFilter = "all" | "today" | "week" | "month";
export type PriceFilter = "all" | "free" | "paid";
export type StatusFilter = "all" | "upcoming" | "finished";
export type SortOption = "newest" | "soonest" | "popular";

export type PublicEventFilters = {
  page?: number;
  search?: string;
  category?: string;
  city?: string;
  dateRange?: DateRangeFilter;
  price?: PriceFilter;
  status?: StatusFilter;
  sort?: SortOption;
  year?: number;
};

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function dateRangeToWhere(range?: DateRangeFilter): Prisma.EventWhereInput {
  if (!range || range === "all") return {};
  const now = startOfDay(new Date());
  const end = new Date(now);
  if (range === "today") end.setDate(end.getDate() + 1);
  if (range === "week") end.setDate(end.getDate() + 7);
  if (range === "month") end.setMonth(end.getMonth() + 1);
  return { startDate: { gte: now, lt: end } };
}

/** Query dasar yang dipakai semua listing publik: tidak pernah DRAFT. */
function baseWhere(status?: StatusFilter): Prisma.EventWhereInput {
  const now = new Date();
  if (status === "upcoming") {
    return { status: { in: ["PUBLISHED"] }, endDate: { gte: startOfDay(now) } };
  }
  if (status === "finished") {
    return { status: { in: ["FINISHED", "PUBLISHED"] }, endDate: { lt: startOfDay(now) } };
  }
  return { status: { in: ["PUBLISHED", "FINISHED"] } };
}

export async function getPublicEvents(filters: PublicEventFilters) {
  const page = Math.max(1, filters.page ?? 1);
  const yearStart = filters.year ? new Date(Date.UTC(filters.year, 0, 1)) : undefined;
  const yearEnd = filters.year ? new Date(Date.UTC(filters.year + 1, 0, 1)) : undefined;

  const where: Prisma.EventWhereInput = {
    AND: [
      baseWhere(filters.status),
      dateRangeToWhere(filters.dateRange),
      ...(yearStart && yearEnd
        ? [{ startDate: { gte: yearStart, lt: yearEnd } }]
        : []),
    ],
    ...(filters.search
      ? {
          OR: [
            { title: { contains: filters.search, mode: "insensitive" as const } },
            { performer: { contains: filters.search, mode: "insensitive" as const } },
            { description: { contains: filters.search, mode: "insensitive" as const } },
            { organizer: { contains: filters.search, mode: "insensitive" as const } },
            { location: { contains: filters.search, mode: "insensitive" as const } },
            { city: { contains: filters.search, mode: "insensitive" as const } },
          ],
        }
      : {}),
    ...(filters.category ? { category: filters.category } : {}),
    ...(filters.city ? { city: filters.city } : {}),
    ...(filters.price === "free" ? { price: 0 } : {}),
    ...(filters.price === "paid" ? { price: { gt: 0 } } : {}),
  };

  const orderBy: Prisma.EventOrderByWithRelationInput =
    filters.sort === "soonest"
      ? { startDate: "asc" }
      : filters.sort === "popular"
        ? { favorites: { _count: "desc" } }
        : { createdAt: "desc" };

  const [events, totalCount] = await Promise.all([
    prisma.event.findMany({
      where,
      orderBy,
      skip: (page - 1) * PUBLIC_PAGE_SIZE,
      take: PUBLIC_PAGE_SIZE,
    }),
    prisma.event.count({ where }),
  ]);

  return {
    events,
    totalCount,
    totalPages: Math.max(1, Math.ceil(totalCount / PUBLIC_PAGE_SIZE)),
    page,
  };
}

export async function getEventBySlugForPublic(slug: string) {
  const event = await prisma.event.findUnique({ where: { slug } });
  if (!event || event.status === "DRAFT") return null;
  return event;
}

/** Kandidat untuk section "Event Terdekat": event akan datang dengan koordinat. */
export async function getGeoCandidateEvents(limit = 24) {
  return prisma.event.findMany({
    where: {
      ...baseWhere("upcoming"),
      latitude: { not: null },
      longitude: { not: null },
    },
    orderBy: { startDate: "asc" },
    take: limit,
  });
}

export async function getThisWeekEvents(limit = 6) {
  return prisma.event.findMany({
    where: { ...baseWhere("upcoming"), ...dateRangeToWhere("week") },
    orderBy: { startDate: "asc" },
    take: limit,
  });
}

export async function getUpcomingEvents(limit = 8) {
  return prisma.event.findMany({
    where: baseWhere("upcoming"),
    orderBy: { startDate: "asc" },
    take: limit,
  });
}

export async function getDistinctPublicCities() {
  const rows = await prisma.event.findMany({
    where: baseWhere(),
    distinct: ["city"],
    select: { city: true },
  });
  return rows.map((r) => r.city);
}
