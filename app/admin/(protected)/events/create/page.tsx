
import type { Metadata } from "next";

import { EventForm } from "@/components/admin/event-form";
import { createEventAction } from "@/lib/actions/event-actions";

export const metadata: Metadata = {
  title: "Tambah Event | EventSpace",
  robots: { index: false, follow: false },
};

export default function CreateEventPage() {
  return (
    <main className="w-full max-w-2xl space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Tambah Event
        </h1>

        <p className="text-sm leading-6 text-muted-foreground sm:text-base">
          Lengkapi detail event yang akan ditampilkan di EventSpace.
        </p>
      </header>

      <EventForm
        action={createEventAction}
        submitLabel="Simpan Event"
      />
    </main>
  );
}
