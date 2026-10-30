"use client";

import * as React from "react";
import { MapPin, Loader2 } from "lucide-react";
import type { Event } from "@prisma/client";

import { EventCard } from "@/components/public/event-card";
import { Button } from "@/components/ui/button";
import { distanceKm } from "@/lib/geo";

type NearbyEventsProps = {
  candidates: Event[];
  favoritedIds?: Set<string>;
};

export function NearbyEvents({ candidates, favoritedIds }: NearbyEventsProps) {
  const [status, setStatus] = React.useState<"idle" | "loading" | "granted" | "denied">("idle");
  const [coords, setCoords] = React.useState<{ lat: number; lng: number } | null>(null);

  function requestLocation() {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setStatus("denied");
      return;
    }
    setStatus("loading");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setStatus("granted");
      },
      () => setStatus("denied"),
      { timeout: 8000 }
    );
  }

  const sorted = React.useMemo(() => {
    if (!coords) {
      return candidates.slice(0, 4).map((event) => ({ event, distance: undefined }));
    }
    return candidates
      .map((event) => ({
        event,
        distance: distanceKm(coords.lat, coords.lng, event.latitude as number, event.longitude as number),
      }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 4);
  }, [candidates, coords]);

  if (candidates.length === 0) return null;

  return (
    <div className="space-y-4">
      {status !== "granted" ? (
        <Button variant="outline" size="sm" onClick={requestLocation} disabled={status === "loading"}>
          {status === "loading" ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <MapPin className="size-4" aria-hidden="true" />
          )}
          {status === "denied" ? "Lokasi tidak tersedia, menampilkan yang terbaru" : "Aktifkan lokasi untuk urutan terdekat"}
        </Button>
      ) : null}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {sorted.map(({ event, distance }) => (
          <EventCard key={event.id} event={event} distanceKm={distance} isFavorited={favoritedIds?.has(event.id)} />
        ))}
      </div>
    </div>
  );
}
