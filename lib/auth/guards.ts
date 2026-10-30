import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";

/**
 * Lapisan otorisasi di server.
 *
 * Middleware hanya lapisan pertama dan membaca role dari JWT. Fungsi di
 * file ini adalah lapisan yang menentukan: setiap server action, route
 * handler, dan halaman admin WAJIB memanggilnya. Untuk role ADMIN,
 * pengecekan dilakukan langsung ke database, jadi admin yang dicabut
 * aksesnya langsung kehilangan izin walau JWT-nya belum kedaluwarsa.
 */

export class UnauthorizedError extends Error {
  constructor(message = "Silakan login terlebih dahulu") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends Error {
  constructor(message = "Anda tidak punya akses ke resource ini") {
    super(message);
    this.name = "ForbiddenError";
  }
}

export const getCurrentUser = cache(async () => {
  const session = await auth();
  return session?.user ?? null;
});

async function isAdminInDatabase(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  return user?.role === "ADMIN";
}

/** Untuk server action dan route handler. Melempar error jika tidak lolos. */
export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) throw new UnauthorizedError();
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (!(await isAdminInDatabase(user.id))) throw new ForbiddenError();
  return user;
}

/** Untuk halaman dan layout. Mengarahkan pengguna jika tidak lolos. */
export async function requireUserOrRedirect() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireAdminOrRedirect() {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");
  if (!(await isAdminInDatabase(user.id))) redirect("/");
  return user;
}
