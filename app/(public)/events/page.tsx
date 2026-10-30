import type { Metadata } from "next";

import { FilterBar } from "@/components/public/filter-bar";
import { CityEventSections } from "@/components/public/city-event-sections";
import { Pagination } from "@/components/shared/pagination";
import { getCurrentUser } from "@/lib/auth/guards";
import { getFavoritedEventIds } from "@/lib/data/favorites";
import {
  getPublicEvents,
  type DateRangeFilter,
  type PriceFilter,
  type StatusFilter,
  type SortOption,
} from "@/lib/data/public-events";

export const metadata: Metadata = {
  title: "Jelajahi Event",
  description: "Cari event berdasarkan kategori, kota, tanggal, dan harga di Samarinda dan sekitarnya.",
};

type EventsPageProps = {
  searchParams: Promise<{
    page?: string;
    search?: string;
    category?: string;
    city?: string;
    dateRange?: string;
    price?: string;
    status?: string;
    sort?: string;
    year?: string;
  }>;
};

export default async function EventsPage({ searchParams }: EventsPageProps) {
  const params = await searchParams;
  const page = Number(params.page) || 1;

  const filters = {
    page,
    search: params.search?.trim() || undefined,
    category: params.category && params.category !== "all" ? params.category : undefined,
    city: params.city && params.city !== "all" ? params.city : undefined,
    dateRange: (params.dateRange as DateRangeFilter) || "all",
    price: (params.price as PriceFilter) || "all",
    status: (params.status as StatusFilter) || "all",
    sort: (params.sort as SortOption) || "newest",
    year: Number(params.year) || undefined,
  };

  const [{ events, totalPages }, user] = await Promise.all([
    getPublicEvents(filters),
    getCurrentUser(),
  ]);
  const favoritedIds = await getFavoritedEventIds(user?.id);

  function buildHref(targetPage: number) {
    const next = new URLSearchParams();
    if (filters.search) next.set("search", filters.search);
    if (filters.category) next.set("category", filters.category);
    if (filters.city) next.set("city", filters.city);
    if (filters.dateRange !== "all") next.set("dateRange", filters.dateRange);
    if (filters.price !== "all") next.set("price", filters.price);
    if (filters.status !== "all") next.set("status", filters.status);
    if (filters.sort !== "newest") next.set("sort", filters.sort);
    if (filters.year) next.set("year", String(filters.year));
    next.set("page", String(targetPage));
    return `/events?${next.toString()}`;
  }

  return (
    <div className="events-archive">
      <div className="events-archive__header">
        <p className="eyebrow"><span className="eyebrow__dot" /> Agenda lokal</p>
        <h1>Semua hal menarik,<br /><em>di satu tempat.</em></h1>
        <p>Temukan event di Samarinda dan wilayah sekitarnya.</p>
      </div>

      <FilterBar
        values={{
          search: params.search,
          category: params.category,
          city: params.city,
          dateRange: params.dateRange,
          price: params.price,
          status: params.status,
          sort: params.sort,
          year: params.year,
        }}
      />

      <section className="events-archive__results">
        <div className="events-section__heading">
          <div><p className="eyebrow">Jelajahi agenda</p><h2>Pilihan event</h2></div>
          <span className="events-archive__count">Halaman {page}{totalPages > 1 ? ` dari ${totalPages}` : ""}</span>
        </div>
        <CityEventSections
          events={events}
          favoritedIds={favoritedIds}
        />
      </section>

      <Pagination page={page} totalPages={totalPages} buildHref={buildHref} />
    </div>
  );
}
