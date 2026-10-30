import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { adminLogoutAction } from "@/lib/actions/auth-actions";

type AdminNavbarProps = {
  name: string;
  email: string;
};

export function AdminNavbar({ name, email }: AdminNavbarProps) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-border px-4 lg:px-8">
      <div className="text-sm">
        <p className="font-medium leading-tight">{name}</p>
        <p className="leading-tight text-muted-foreground">{email}</p>
      </div>
      <form action={adminLogoutAction}>
        <Button type="submit" variant="ghost" size="sm">
          <LogOut className="size-4" aria-hidden="true" />
          Keluar
        </Button>
      </form>
    </header>
  );
}
