import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, Clock, MapPin, Ticket, User } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShareButton } from "@/components/public/share-button";
import { FavoriteButton } from "@/components/public/favorite-button";
import { MapsEmbed } from "@/components/public/maps-embed";
import { getCurrentUser } from "@/lib/auth/guards";
import { isFavoritedByUser } from "@/lib/data/favorites";
import { getEventBySlugForPublic } from "@/lib/data/public-events";
import { formatEventDateRange, formatPrice } from "@/lib/events/format";

type EventDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: EventDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEventBySlugForPublic(slug);
  if (!event) return { title: "Event tidak ditemukan" };

  const description = event.description.slice(0, 155);

  return {
    title: event.title,
    description,
    openGraph: {
      title: event.title,
      description,
      images: [{ url: event.image }],
      type: "website",
    },
  };
}

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const { slug } = await params;
  const [event, user] = await Promise.all([
    getEventBySlugForPublic(slug),
    getCurrentUser(),
  ]);
  if (!event) notFound();

  const isFavorited = user ? await isFavoritedByUser(user.id, event.id) : false;

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-10 lg:px-8">
      {event.status === "CANCELLED" ? (
        <div role="alert" className="rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          Event ini telah dibatalkan oleh penyelenggara.
        </div>
      ) : null}
      {event.status === "FINISHED" ? (
        <div className="rounded-md border border-border bg-muted px-4 py-3 text-sm text-muted-foreground">
          Event ini sudah selesai berlangsung.
        </div>
      ) : null}

      <div className="relative aspect-video overflow-hidden rounded-lg bg-muted">
        <Image src={event.image} alt={event.title} fill sizes="(min-width: 1024px) 800px, 100vw" className="object-cover" priority />
      </div>

      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{event.category}</Badge>
          {event.performer ? <Badge variant="outline">Penampil: {event.performer}</Badge> : null}
          {event.status === "CANCELLED" ? <Badge variant="destructive">Dibatalkan</Badge> : null}
          {event.status === "FINISHED" ? <Badge variant="outline">Selesai</Badge> : null}
        </div>

        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{event.title}</h1>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex items-start gap-3 text-sm">
            <CalendarDays className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            <span>{formatEventDateRange(event.startDate, event.endDate)}</span>
          </div>
          <div className="flex items-start gap-3 text-sm">
            <Clock className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            <span>{event.startTime} - {event.endTime} WITA</span>
          </div>
          <div className="flex items-start gap-3 text-sm">
            <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            <span>{event.location}, {event.address}, {event.city}</span>
          </div>
          <div className="flex items-start gap-3 text-sm">
            <User className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            <span>Diselenggarakan oleh {event.organizer}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 border-y border-border py-4">
          <div className="flex items-center gap-2 text-lg font-semibold">
            <Ticket className="size-5" aria-hidden="true" />
            {formatPrice(event.price)}
          </div>
          <div className="ml-auto flex gap-2">
            <FavoriteButton eventId={event.id} initialFavorited={isFavorited} variant="full" />
            <ShareButton title={event.title} />
            {event.ticketUrl && event.status !== "CANCELLED" ? (
              <Button asChild>
                <Link href={event.ticketUrl} target="_blank" rel="noopener noreferrer">
                  Beli tiket
                </Link>
              </Button>
            ) : null}
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="font-medium">Tentang event</h2>
          <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
            {event.description}
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="font-medium">Lokasi</h2>
          <MapsEmbed address={`${event.location}, ${event.address}, ${event.city}`} latitude={event.latitude} longitude={event.longitude} />
        </div>
      </div>
    </div>
  );
}
