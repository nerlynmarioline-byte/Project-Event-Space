import "server-only";

import { headers } from "next/headers";

/**
 * Rate limit login berbasis memori proses. Cukup untuk satu instance
 * server (dev lokal atau VPS tunggal). Kalau nanti deploy ke banyak
 * instance sekaligus (misalnya serverless di Vercel), ganti penyimpanan
 * ini dengan yang dibagi bersama, seperti Redis/Upstash, karena tiap
 * instance di sini punya hitungannya sendiri-sendiri.
 */

type Bucket = { count: number; resetAt: number };

const WINDOW_MS = 15 * 60 * 1000; // 15 menit
const MAX_ATTEMPTS = 5;

const buckets = new Map<string, Bucket>();

// Bersihkan bucket kedaluwarsa secara berkala supaya Map tidak terus membesar.
setInterval(
  () => {
    const now = Date.now();
    for (const [key, bucket] of buckets) {
      if (bucket.resetAt < now) buckets.delete(key);
    }
  },
  10 * 60 * 1000
).unref?.();

export async function getClientIp(): Promise<string> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return h.get("x-real-ip") ?? "unknown";
}

export function isRateLimited(key: string): {
  limited: boolean;
  retryAfterSeconds?: number;
} {
  const bucket = buckets.get(key);
  if (!bucket) return { limited: false };

  const now = Date.now();
  if (bucket.resetAt < now) {
    buckets.delete(key);
    return { limited: false };
  }

  if (bucket.count >= MAX_ATTEMPTS) {
    return { limited: true, retryAfterSeconds: Math.ceil((bucket.resetAt - now) / 1000) };
  }

  return { limited: false };
}

export function recordFailedAttempt(key: string) {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
  } else {
    bucket.count += 1;
  }
}

export function clearAttempts(key: string) {
  buckets.delete(key);
}
