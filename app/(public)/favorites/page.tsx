import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CalendarDays, Heart, MapPin, Music2 } from "lucide-react";

import { AttendanceButton } from "@/components/public/attendance-button";
import { requireUserOrRedirect } from "@/lib/auth/guards";
import { getFavoriteEntries } from "@/lib/data/favorites";
import { formatEventDateRange } from "@/lib/events/format";

export const metadata: Metadata = {
  title: "Favorit Saya",
  robots: { index: false, follow: false },
};

export default async function FavoritesPage() {
  const user = await requireUserOrRedirect();
  const entries = await getFavoriteEntries(user.id);
  const byPerformer = new Map<string, typeof entries>();

  for (const entry of entries) {
    const label = entry.event.performer?.trim() || entry.event.title;
    const key = label.toLocaleLowerCase("id-ID");
    const existing = byPerformer.get(key);
    if (existing) existing.push(entry);
    else byPerformer.set(key, [entry]);
  }

  const groups = [...byPerformer.values()].sort((a, b) =>
    b[0].event.startDate.getTime() - a[0].event.startDate.getTime(),
  );
  const watchedCount = entries.filter((entry) => entry.attendedAt).length;

  return (
    <div className="favorites-page">
      <section className="favorites-hero">
        <div>
          <p className="eyebrow"><Heart size={13} /> Koleksi pribadimu</p>
          <h1>Konser yang<br /><em>selalu diingat.</em></h1>
          <p>Simpan konser favorit, tandai yang sudah kamu tonton, lalu lihat lagi ceritanya dari tahun ke tahun.</p>
        </div>
        <div className="favorites-stats" aria-label="Ringkasan favorit">
          <div><strong>{entries.length}</strong><span>event disimpan</span></div>
          <div><strong>{watchedCount}</strong><span>pernah ditonton</span></div>
          <div><strong>{groups.length}</strong><span>artis / koleksi</span></div>
        </div>
      </section>

      {entries.length === 0 ? (
        <section className="favorites-empty">
          <span className="favorites-empty__icon"><Music2 size={21} /></span>
          <h2>Mulai kumpulkan momen konsermu</h2>
          <p>Simpan konser lewat ikon hati. Saat kamu menontonnya, tandai sebagai sudah ditonton. Konser dari artis yang sama akan tersusun dalam satu riwayat tahunan.</p>
          <Link href="/events" className="button-pill button-pill--dark">Cari event <ArrowRight size={15} /></Link>
        </section>
      ) : (
        <div className="favorites-groups">
          {groups.map((group) => {
            const isArtistGroup = Boolean(group[0].event.performer?.trim());
            const performer = group[0].event.performer?.trim() || group[0].event.title;
            const attended = group.filter((entry) => entry.attendedAt).length;
            const years = [...new Set(group.map((entry) => entry.event.startDate.getUTCFullYear()))]
              .sort((a, b) => b - a);

            return (
              <section className="favorite-artist" key={performer.toLocaleLowerCase("id-ID")}>
                <div className="favorite-artist__heading">
                  <div className="favorite-artist__mark"><Music2 size={18} /></div>
                  <div className="favorite-artist__title">
                    <p className="eyebrow">{isArtistGroup ? "Artis favorit" : "Event favorit"}</p>
                    <h2>{performer}</h2>
                  </div>
                  <div className="favorite-artist__summary">
                    <span>{group.length} event tersimpan</span>
                    <span>{attended} ditandai ditonton</span>
                  </div>
                </div>
                <div className="favorite-artist__years" aria-label={`Tahun konser ${performer}`}>
                  {years.map((year) => <span key={year}>{year}</span>)}
                </div>
                <div className="favorite-timeline">
                  {group.map(({ event, attendedAt }) => (
                    <article className="favorite-memory" key={event.id}>
                      <div className="favorite-memory__year">{event.startDate.getUTCFullYear()}</div>
                      <div className="favorite-memory__content">
                        <div className="favorite-memory__title-row">
                          <Link href={`/events/${event.slug}`}><h3>{event.title}</h3></Link>
                          <span className={attendedAt ? "favorite-memory__status is-watched" : "favorite-memory__status"}>
                            {attendedAt ? "Sudah ditonton" : "Rencana nonton"}
                          </span>
                        </div>
                        <p className="favorite-memory__details">
                          <span><CalendarDays size={13} /> {formatEventDateRange(event.startDate, event.endDate)}</span>
                          <span><MapPin size={13} /> {event.city} · {event.location}</span>
                          <span>{event.startTime}</span>
                        </p>
                      </div>
                      <AttendanceButton eventId={event.id} initialAttended={Boolean(attendedAt)} />
                    </article>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
