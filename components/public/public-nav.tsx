"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Heart } from "lucide-react";

export function PublicNav({ showFavorites }: { showFavorites: boolean }) {
  const pathname = usePathname();
  const navRef = useRef<HTMLElement>(null);
  const activeLinkRef = useRef<HTMLAnchorElement>(null);
  const [indicator, setIndicator] = useState({ left: 0, width: 0, visible: false });
  const isHome = pathname === "/";
  const isExplore = pathname === "/events" || pathname.startsWith("/events/");
  const isFavorites = pathname === "/favorites" || pathname.startsWith("/favorites/");

  useEffect(() => {
    const nav = navRef.current;
    const activeLink = activeLinkRef.current;
    if (!nav || !activeLink) return;

    const updateIndicator = () => {
      const navRect = nav.getBoundingClientRect();
      const linkRect = activeLink.getBoundingClientRect();
      setIndicator({ left: linkRect.left - navRect.left, width: linkRect.width, visible: true });
    };

    updateIndicator();
    window.addEventListener("resize", updateIndicator);
    return () => window.removeEventListener("resize", updateIndicator);
  }, [pathname, showFavorites]);

  return (
    <nav ref={navRef} className="public-nav" aria-label="Navigasi utama">
      <Link ref={isHome ? activeLinkRef : undefined} href="/" className={isHome ? "is-active" : undefined} aria-current={isHome ? "page" : undefined}>
        Beranda
      </Link>
      <Link ref={isExplore ? activeLinkRef : undefined} href="/events" className={isExplore ? "is-active" : undefined} aria-current={isExplore ? "page" : undefined}>
        Jelajahi
      </Link>
      {showFavorites ? (
        <Link ref={isFavorites ? activeLinkRef : undefined} href="/favorites" className={isFavorites ? "is-active" : undefined} aria-current={isFavorites ? "page" : undefined}>
          <Heart size={14} /> Favorit
        </Link>
      ) : null}
      <span
        className={`public-nav__indicator${indicator.visible ? " is-visible" : ""}`}
        style={{ width: indicator.width, transform: `translateX(${indicator.left}px)` }}
        aria-hidden="true"
      />
    </nav>
  );
}
