import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

import { authConfig } from "./auth.config";
import { prisma } from "@/lib/db/prisma";
import { DUMMY_PASSWORD_HASH, verifyPassword } from "@/lib/auth/password";
import { loginSchema } from "@/lib/validation/auth";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        portal: { label: "Portal", type: "text" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        const user = await prisma.user.findUnique({ where: { email } });

        // Bandingkan hash walau user tidak ditemukan supaya waktu respons
        // sama dan tidak membocorkan email mana yang terdaftar.
        const isValidPassword = await verifyPassword(
          password,
          user?.password ?? DUMMY_PASSWORD_HASH
        );
        if (!user || !isValidPassword) return null;

        // Pintu login admin hanya menerima akun ADMIN. Ditolak sebelum
        // session dibuat, dengan hasil yang sama seperti password salah.
        if (credentials?.portal === "admin" && user.role !== "ADMIN") {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
});
