import type { Metadata } from "next";

import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";
import { adminLoginAction } from "@/lib/actions/auth-actions";

export const metadata: Metadata = {
  title: "Login Admin",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <AuthShell
      title="Login admin"
      description="Halaman ini khusus admin EventSpace."
      panelTitle="Kelola event Samarinda."
      panelText="Tambah, ubah, dan publikasikan event dari satu dashboard."
    >
      <LoginForm action={adminLoginAction} submitLabel="Masuk sebagai admin" />
    </AuthShell>
  );
}
