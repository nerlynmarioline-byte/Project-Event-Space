"use client";

import { useState } from "react";
import { ArrowUpRight, MapPin, Music2 } from "lucide-react";

const concerts = [
  {
    name: "JKT48",
    title: "Idol Live Showcase",
    mood: "Satu panggung, seribu lightstick.",
    style: "jkt48",
    index: "01",
  },
  {
    name: "for Revenge",
    title: "Perayaan Luka",
    mood: "Bernyanyi bersama, melepas semua rasa.",
    style: "revenge",
    index: "02",
  },
  {
    name: "Hindia",
    title: "Suara untuk Bertumbuh",
    mood: "Lagu-lagu yang terasa dekat dengan kita.",
    style: "hindia",
    index: "03",
  },
  {
    name: "Rossa",
    title: "Another Journey",
    mood: "Malam penuh lagu yang selalu dikenang.",
    style: "rossa",
    index: "04",
  },
  {
    name: "Tulus",
    title: "Manusia - Tur Intim",
    mood: "Cerita sederhana dalam suara yang hangat.",
    style: "tulus",
    index: "05",
  },
];

export function ConcertShowcase() {
  const [selected, setSelected] = useState(0);
  const concert = concerts[selected];

  return (
    <div className="concert-showcase">
      <div className="concert-showcase__grid" role="group" aria-label="Pilih konsep konser">
        {concerts.map((item, index) => (
          <button
            key={item.name}
            type="button"
            className={`concert-card concert-card--${item.style}${selected === index ? " is-selected" : ""}`}
            aria-pressed={selected === index}
            onClick={() => setSelected(index)}
          >
            <span className="concert-card__index">{item.index} / KONSEP</span>
            <span className="concert-card__ornament" aria-hidden="true"><Music2 size={20} /></span>
            <span className="concert-card__artist">{item.name}</span>
            <span className="concert-card__title">{item.title}</span>
            <span className="concert-card__select">{selected === index ? "Dipilih" : "Pilih konsep"}<ArrowUpRight size={14} /></span>
          </button>
        ))}
      </div>
      <div className="concert-showcase__detail" aria-live="polite">
        <div className="concert-showcase__detail-icon"><MapPin size={17} /></div>
        <div className="concert-showcase__detail-copy" key={concert.name}>
          <p><span>Konsep konser</span><span className="concert-showcase__separator">/</span><span>Samarinda</span></p>
          <h3>{concert.name} <span>/ {concert.title}</span></h3>
          <p>{concert.mood}</p>
        </div>
        <span className="concert-showcase__notice">Inspirasi visual | Jadwal belum diumumkan</span>
      </div>
    </div>
  );
}
