import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { EVENT_CITIES } from "@/lib/validation/event";

export function Footer() {
  return (
    <footer className="public-footer">
      <div className="public-footer__main">
        <div className="public-footer__about-wrap">
          <p className="public-footer__brand">event<span>space</span></p>
          <p className="public-footer__about">
            Ruang untuk bertemu, belajar, dan merayakan hal baru di Samarinda dan sekitarnya.
          </p>
        </div>

        <div>
          <p className="public-footer__heading">Jelajahi wilayah</p>
          <ul className="public-footer__links">
            {EVENT_CITIES.map((city) => (
              <li key={city}>
                <Link href={`/events?city=${encodeURIComponent(city)}`}>
                  {city}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="public-footer__heading">Tautan</p>
          <ul className="public-footer__links">
            <li>
              <Link href="/events">
                Jelajahi event
              </Link>
            </li>
            <li>
              <Link href="/register">
                Buat akun <ArrowUpRight size={12} />
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="public-footer__bottom">
        <span>&copy; {new Date().getFullYear()} EventSpace &middot; Samarinda, Indonesia</span>
        <span>Dibuat untuk momen yang berarti.</span>
      </div>
    </footer>
  );
}
