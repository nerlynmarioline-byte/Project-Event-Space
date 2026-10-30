import type { Metadata } from "next";
import Link from "next/link";
import { ArrowDownRight, ArrowRight, CalendarDays, MapPin, Sparkles } from "lucide-react";

import { FilterBar } from "@/components/public/filter-bar";
import { EventGrid } from "@/components/public/event-grid";
import { ConcertShowcase } from "@/components/public/concert-showcase";
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
  title: "Temukan Event",
  description: "Ruang untuk bertemu, belajar, dan merayakan hal baru di Samarinda dan sekitarnya.",
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
  const hasActiveFilters = Boolean(
    params.search ||
      params.category ||
      params.city ||
      (params.dateRange && params.dateRange !== "all") ||
      (params.price && params.price !== "all") ||
      (params.status && params.status !== "all") ||
      (params.year && params.year !== "all"),
  );

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
    return `/?${next.toString()}`;
  }

  function buildExploreHref() {
    const next = new URLSearchParams();
    if (filters.search) next.set("search", filters.search);
    if (filters.category) next.set("category", filters.category);
    if (filters.city) next.set("city", filters.city);
    if (filters.dateRange !== "all") next.set("dateRange", filters.dateRange);
    if (filters.price !== "all") next.set("price", filters.price);
    if (filters.status !== "all") next.set("status", filters.status);
    if (filters.sort !== "newest") next.set("sort", filters.sort);
    if (filters.year) next.set("year", String(filters.year));
    const query = next.toString();
    return query ? `/events?${query}` : "/events";
  }

  const heroImage = events[0]?.image;

  return (
    <div className="public-home">
      <section className="home-hero" style={heroImage ? { backgroundImage: `linear-gradient(90deg, rgba(10,10,10,.88) 0%, rgba(20,17,17,.68) 48%, rgba(20,17,17,.16) 100%), url("${heroImage}")` } : undefined}>
        <div className="home-hero__grain" aria-hidden="true" />
        <div className="home-hero__content">
          <p className="eyebrow home-hero__eyebrow"><Sparkles size={14} /> Event lokal, cerita tak terlupakan</p>
          <h1>Temukan ruang<br />untuk <em>ide baru.</em></h1>
          <p className="home-hero__intro">Dari obrolan kecil sampai panggung besar—temukan hal menarik yang sedang terjadi di sekitarmu.</p>
          <div className="home-hero__actions">
            <Link href="#jelajahi" className="button-pill button-pill--light">Jelajahi event <ArrowRight size={16} /></Link>
            <span className="home-hero__location"><MapPin size={15} /> Samarinda & sekitarnya</span>
          </div>
        </div>
        <div className="home-hero__note"><span>01 / 03</span><span className="home-hero__line" /><span>Temukan pengalamanmu</span></div>
        <a className="home-hero__scroll" href="#jelajahi" aria-label="Gulir ke daftar event"><ArrowDownRight size={19} /></a>
      </section>

      <div className="home-content" id="jelajahi">
        <section className="discover-section">
          <div className="section-heading">
            <div>
              <p className="eyebrow"><span className="eyebrow__dot" /> Pilih pengalamanmu</p>
              <h2>Yang sedang <em>berlangsung.</em></h2>
            </div>
            <p className="section-heading__aside">Tempat baru untuk belajar sesuatu,<br className="hidden sm:block" /> bertemu orang baru, dan pulang membawa cerita.</p>
          </div>
          <div className="filter-panel">
            <div className="filter-panel__top"><span><CalendarDays size={16} /> Temukan event pilihanmu</span><span className="filter-panel__hint">Atur pencarian</span></div>
            <FilterBar path="/" values={{ search: params.search, category: params.category, city: params.city, dateRange: params.dateRange, price: params.price, status: params.status, sort: params.sort, year: params.year }} />
          </div>
        </section>

        <section className="events-section">
          <div className="events-section__heading">
            <div><p className="eyebrow">Kurasi untukmu</p><h2>Jadwal pilihan</h2></div>
            <Link href={buildExploreHref()} className="text-link">Lihat semua <ArrowRight size={16} /></Link>
          </div>
          {events.length > 0 || hasActiveFilters ? (
            <EventGrid events={events} emptyMessage="Coba ubah kata kunci atau filter yang kamu pakai." favoritedIds={favoritedIds} />
          ) : (
            <ConcertShowcase />
          )}
          <Pagination page={page} totalPages={totalPages} buildHref={buildHref} />
        </section>
      </div>
    </div>
  );
}
