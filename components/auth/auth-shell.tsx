import Link from "next/link";
import { CalendarDays } from "lucide-react";

type AuthShellProps = {
  title: string;
  description: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  panelTitle?: string;
  panelText?: string;
};

function Brand({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={`flex items-center gap-2 text-lg font-semibold tracking-tight ${className ?? ""}`}
    >
      <CalendarDays className="size-5" aria-hidden="true" />
      EventSpace
    </Link>
  );
}

export function AuthShell({
  title,
  description,
  children,
  footer,
  panelTitle = "Temukan event di Samarinda.",
  panelText = "Konser, workshop, festival, dan komunitas di Samarinda dan sekitarnya, dalam satu tempat.",
}: AuthShellProps) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <aside className="hidden flex-col justify-between bg-primary p-12 text-primary-foreground lg:flex">
        <Brand />
        <div className="max-w-sm space-y-3">
          <p className="text-3xl font-semibold leading-tight tracking-tight">
            {panelTitle}
          </p>
          <p className="text-sm leading-relaxed text-primary-foreground/70">
            {panelText}
          </p>
        </div>
        <p className="text-xs text-primary-foreground/50">
          Samarinda, Kalimantan Timur
        </p>
      </aside>

      <main className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm space-y-8">
          <Brand className="lg:hidden" />
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
          {children}
          {footer ? (
            <div className="text-sm text-muted-foreground">{footer}</div>
          ) : null}
        </div>
      </main>
    </div>
  );
}
