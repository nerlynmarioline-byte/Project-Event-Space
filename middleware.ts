import NextAuth from "next-auth";
import { NextResponse } from "next/server";

import { authConfig } from "./auth.config";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth?.user;
  const role = req.auth?.user?.role;
  const path = nextUrl.pathname;

  const isAdminLoginRoute = path === "/admin/login";
  const isAdminRoute = path.startsWith("/admin") && !isAdminLoginRoute;
  const isUserAuthRoute = path === "/login" || path === "/register";
  const isFavoritesRoute = path.startsWith("/favorites");

  // Proteksi area admin. Middleware ini lapisan pertama saja -
  // setiap server action dan route handler admin tetap memvalidasi
  // role sendiri (lihat lib/auth/guards.ts), karena middleware tidak
  // boleh jadi satu-satunya gerbang keamanan.
  if (isAdminRoute) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/admin/login", nextUrl));
    }
    if (role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", nextUrl));
    }
    return NextResponse.next();
  }

  if (isAdminLoginRoute && isLoggedIn && role === "ADMIN") {
    return NextResponse.redirect(new URL("/admin/dashboard", nextUrl));
  }

  if (isFavoritesRoute && !isLoggedIn) {
    const redirectUrl = new URL("/login", nextUrl);
    redirectUrl.searchParams.set("callbackUrl", path);
    return NextResponse.redirect(redirectUrl);
  }

  if (isUserAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL("/", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|webp)$).*)",
  ],
};
