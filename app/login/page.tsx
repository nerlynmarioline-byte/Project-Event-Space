import type { Metadata } from "next";
import Link from "next/link";

import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";
import { loginAction } from "@/lib/actions/auth-actions";
import { getSafeRedirectPath } from "@/lib/auth/redirect";

export const metadata: Metadata = { title: "Masuk" };

type LoginPageProps = {
  searchParams: Promise<{ callbackUrl?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { callbackUrl } = await searchParams;

  return (
    <AuthShell
      title="Masuk ke EventSpace"
      description="Simpan event favorit dan temukan event yang cocok."
      footer={
        <>
          Belum punya akun?{" "}
          <Link
            href="/register"
            className="font-medium text-foreground underline underline-offset-4"
          >
            Daftar
          </Link>
        </>
      }
    >
      <LoginForm
        action={loginAction}
        callbackUrl={callbackUrl ? getSafeRedirectPath(callbackUrl) : undefined}
      />
    </AuthShell>
  );
}
