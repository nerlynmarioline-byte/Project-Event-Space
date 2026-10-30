import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminNavbar } from "@/components/admin/admin-navbar";
import { requireAdminOrRedirect } from "@/lib/auth/guards";

export default async function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Satu-satunya tempat pengecekan role untuk semua halaman admin di bawah
  // route group ini. Mutasi (server actions) tetap memanggil requireAdmin
  // sendiri, karena form bisa dikirim langsung tanpa lewat halaman ini.
  const admin = await requireAdminOrRedirect();

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="flex flex-1 flex-col">
        <AdminNavbar name={admin.name ?? ""} email={admin.email ?? ""} />
        <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
