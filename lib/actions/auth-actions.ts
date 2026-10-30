"use server";

import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { Prisma } from "@prisma/client";

import { signIn, signOut } from "@/auth";
import { prisma } from "@/lib/db/prisma";
import { hashPassword } from "@/lib/auth/password";
import { getSafeRedirectPath } from "@/lib/auth/redirect";
import {
  getClientIp,
  isRateLimited,
  recordFailedAttempt,
  clearAttempts,
} from "@/lib/auth/rate-limit";
import { registerSchema, loginSchema } from "@/lib/validation/auth";

export type ActionState =
  | {
      error?: string;
      fieldErrors?: Record<string, string[] | undefined>;
      values?: { name?: string; email?: string };
    }
  | undefined;

const INVALID_CREDENTIALS = "Email atau password salah";

function textValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

/**
 * Mengembalikan true jika login berhasil. Auth.js bisa melapor gagal lewat
 * AuthError atau lewat URL hasil yang memuat parameter "error", jadi
 * keduanya dicek.
 */
async function attemptSignIn(credentials: Record<string, string>) {
  try {
    const result = await signIn("credentials", {
      ...credentials,
      redirect: false,
    });
    if (
      typeof result === "string" &&
      new URL(result, "http://localhost").searchParams.has("error")
    ) {
      return false;
    }
    return true;
  } catch (error) {
    if (error instanceof AuthError) return false;
    throw error;
  }
}

export async function registerAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const values = {
    name: textValue(formData, "name"),
    email: textValue(formData, "email"),
  };

  const parsed = registerSchema.safeParse({
    ...values,
    password: textValue(formData, "password"),
    confirmPassword: textValue(formData, "confirmPassword"),
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors, values };
  }

  const { name, email, password } = parsed.data;

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return { error: "Email sudah terdaftar", values };
  }

  try {
    await prisma.user.create({
      data: {
        name,
        email,
        password: await hashPassword(password),
        // Role selalu USER. Tidak pernah dibaca dari input form.
        role: "USER",
      },
    });
  } catch (error) {
    // Dua pendaftaran dengan email sama pada waktu bersamaan.
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return { error: "Email sudah terdaftar", values };
    }
    throw error;
  }

  const signedIn = await attemptSignIn({ email, password });
  redirect(signedIn ? "/" : "/login");
}

function rateLimitMessage(retryAfterSeconds?: number) {
  const minutes = Math.max(1, Math.ceil((retryAfterSeconds ?? 60) / 60));
  return `Terlalu banyak percobaan. Coba lagi dalam ${minutes} menit.`;
}

export async function loginAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const values = { email: textValue(formData, "email") };

  const parsed = loginSchema.safeParse({
    ...values,
    password: textValue(formData, "password"),
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors, values };
  }

  const rateLimitKey = `login:${await getClientIp()}:${parsed.data.email}`;
  const limit = isRateLimited(rateLimitKey);
  if (limit.limited) {
    return { error: rateLimitMessage(limit.retryAfterSeconds), values };
  }

  const signedIn = await attemptSignIn(parsed.data);
  if (!signedIn) {
    recordFailedAttempt(rateLimitKey);
    return { error: INVALID_CREDENTIALS, values };
  }
  clearAttempts(rateLimitKey);

  redirect(getSafeRedirectPath(formData.get("callbackUrl")));
}

export async function adminLoginAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const values = { email: textValue(formData, "email") };

  const parsed = loginSchema.safeParse({
    ...values,
    password: textValue(formData, "password"),
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors, values };
  }

  const rateLimitKey = `admin-login:${await getClientIp()}:${parsed.data.email}`;
  const limit = isRateLimited(rateLimitKey);
  if (limit.limited) {
    return { error: rateLimitMessage(limit.retryAfterSeconds), values };
  }

  // portal "admin" ditolak di auth.ts untuk akun non-admin, dengan pesan
  // yang sama seperti password salah.
  const signedIn = await attemptSignIn({ ...parsed.data, portal: "admin" });
  if (!signedIn) {
    recordFailedAttempt(rateLimitKey);
    return { error: INVALID_CREDENTIALS, values };
  }
  clearAttempts(rateLimitKey);

  redirect("/admin/dashboard");
}

export async function logoutAction() {
  await signOut({ redirectTo: "/" });
}

export async function adminLogoutAction() {
  await signOut({ redirectTo: "/admin/login" });
}
