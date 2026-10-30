import Link from "next/link";
import { ArrowUpRight, CalendarDays, LayoutDashboard } from "lucide-react";

import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { logoutAction } from "@/lib/actions/auth-actions";
import { PublicNav } from "@/components/public/public-nav";

export async function Navbar() {
  const session = await auth();
  const user = session?.user;

  return (
    <header className="public-header">
      <div className="public-header__inner">
        <Link href="/" className="brand-mark" aria-label="EventSpace beranda">
          <span className="brand-mark__icon"><CalendarDays size={17} strokeWidth={1.8} /></span>
          <span>event<span>space</span><small>MEET &middot; MAKE &middot; MOMENT</small></span>
        </Link>

        <PublicNav showFavorites={Boolean(user)} />

        <div className="public-header__actions">
          {user ? (
            <>
              {user.role === "ADMIN" ? (
                <Button asChild variant="ghost" size="sm" className="header-dashboard">
                  <Link href="/admin/dashboard">
                    <LayoutDashboard size={15} aria-hidden="true" />
                    Dashboard
                  </Link>
                </Button>
              ) : null}
              <span className="header-user">Hai, {user.name}</span>
              <form action={logoutAction}>
                <Button type="submit" variant="outline" size="sm" className="header-login">
                  Keluar
                </Button>
              </form>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm" className="header-login">
                <Link href="/login">Masuk</Link>
              </Button>
              <Button asChild size="sm" className="header-cta">
                <Link href="/register">Mulai sekarang <ArrowUpRight size={14} /></Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
