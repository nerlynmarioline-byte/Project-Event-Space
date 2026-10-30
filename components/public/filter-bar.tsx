"use client";

import Link from "next/link";
import { useRef } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowUpRight,
  CalendarDays,
  Dumbbell,
  Music2,
  Search,
  Sparkles,
  Users,
  Utensils,
  Video,
  Wrench,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EVENT_CATEGORIES, EVENT_CITIES } from "@/lib/validation/event";

export type FilterBarValues = {
  search?: string;
  category?: string;
  city?: string;
  dateRange?: string;
  price?: string;
  status?: string;
  sort?: string;
  year?: string;
};

const DATE_OPTIONS = [
  { value: "all", label: "Semua tanggal" },
  { value: "today", label: "Hari ini" },
  { value: "week", label: "Minggu ini" },
  { value: "month", label: "Bulan ini" },
];

const PRICE_OPTIONS = [
  { value: "all", label: "Semua harga" },
  { value: "free", label: "Gratis" },
  { value: "paid", label: "Berbayar" },
];

const STATUS_OPTIONS = [
  { value: "all", label: "Semua status" },
  { value: "upcoming", label: "Akan datang" },
  { value: "finished", label: "Selesai" },
];

const SORT_OPTIONS = [
  { value: "newest", label: "Terbaru" },
  { value: "soonest", label: "Tanggal terdekat" },
  { value: "popular", label: "Event populer" },
];
const YEAR_OPTIONS = [
  { value: "all", label: "Semua tahun" },
  { value: "2020", label: "2020" },
  { value: "2021", label: "2021" },
  { value: "2022", label: "2022" },
  { value: "2023", label: "2023" },
  { value: "2024", label: "2024" },
  { value: "2025", label: "2025" },
  { value: "2026", label: "2026" },
  { value: "2027", label: "2027" },
  { value: "2028", label: "2028" },
];

const CATEGORY_ICONS: Record<string, typeof Music2> = {
  Musik: Music2,
  Festival: Sparkles,
  Workshop: Wrench,
  Seminar: Video,
  Olahraga: Dumbbell,
  Komunitas: Users,
  Kuliner: Utensils,
  Lainnya: CalendarDays,
};

function getFilterHref(
  values: FilterBarValues,
  options: { path: string; category?: string; city?: string },
) {
  const params = new URLSearchParams();

  if (values.search) params.set("search", values.search);
  const city = options.city ?? values.city;
  if (city && city !== "all") params.set("city", city);
  if (values.dateRange && values.dateRange !== "all") {
    params.set("dateRange", values.dateRange);
  }
  if (values.price && values.price !== "all") {
    params.set("price", values.price);
  }
  if (values.status && values.status !== "all") {
    params.set("status", values.status);
  }
  if (values.sort && values.sort !== "newest") {
    params.set("sort", values.sort);
  }
  if (values.year && values.year !== "all") params.set("year", values.year);

  const category = options.category ?? values.category;
  if (category && category !== "all") params.set("category", category);

  const query = params.toString();
  return query ? `${options.path}?${query}` : options.path;
}

export function FilterBar({ values, path = "/events" }: { values: FilterBarValues; path?: "/" | "/events" }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);

  function handleCityChange(city: string) {
    const form = formRef.current;
    if (!form) return;

    const params = new URLSearchParams();
    for (const [key, value] of new FormData(form).entries()) {
      if (key !== "city" && String(value)) params.set(key, String(value));
    }
    params.set("city", city);
    params.delete("page");

    const query = params.toString();
    router.push(query ? `${path}?${query}` : path, { scroll: false });
  }

  return (
    <form ref={formRef} method="GET" action={path} className="filter-form">
      <div className="filter-search">
        <Search
          className="filter-search__icon"
          aria-hidden="true"
        />
        <Input
          type="search"
          name="search"
          defaultValue={values.search}
          placeholder="Cari event atau artis favorit..."
          className="filter-search__input"
        />
        <Button type="submit" size="sm" className="filter-search__button">Cari event <ArrowUpRight size={14} /></Button>
      </div>

      <div className="filter-categories">
        <p>Kategori</p>
        <div>
          <Link
            href={getFilterHref(values, { path, category: "" })}
            aria-pressed={!values.category || values.category === "all"}
            className={!values.category || values.category === "all" ? "filter-chip is-active" : "filter-chip"}
          >
            Semua
          </Link>
          {EVENT_CATEGORIES.map((category) => {
            const isActive = values.category === category;
            const Icon = CATEGORY_ICONS[category] ?? CalendarDays;

            return (
              <Link
                key={category}
                href={getFilterHref(values, { path, category: isActive ? "" : category })}
                aria-pressed={isActive}
                className={
                  isActive
                    ? "filter-chip is-active"
                    : "filter-chip"
                }
              >
                <Icon size={13} aria-hidden="true" />
                {category}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="filter-selects">
        {values.category && values.category !== "all" ? (
          <input type="hidden" name="category" value={values.category} />
        ) : null}
        <Select name="city" defaultValue={values.city || "all"} onValueChange={handleCityChange}>
          <SelectTrigger aria-label="Kota">
            <SelectValue placeholder="Kota" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua kota</SelectItem>
            {EVENT_CITIES.map((city) => (
              <SelectItem key={city} value={city}>
                {city}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select name="dateRange" defaultValue={values.dateRange || "all"}>
          <SelectTrigger aria-label="Tanggal">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DATE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select name="price" defaultValue={values.price || "all"}>
          <SelectTrigger aria-label="Harga">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PRICE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select name="status" defaultValue={values.status || "all"}>
          <SelectTrigger aria-label="Status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select name="sort" defaultValue={values.sort || "newest"}>
          <SelectTrigger aria-label="Urutkan">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select name="year" defaultValue={values.year || "all"}>
          <SelectTrigger aria-label="Tahun">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {YEAR_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="filter-actions">
        <Button type="submit" size="sm">
          Terapkan filter
        </Button>
        <Link
          href="/events"
          className="filter-reset"
        >
          Reset
        </Link>
      </div>
    </form>
  );
}
