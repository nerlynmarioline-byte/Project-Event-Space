import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { EventForm, type EventFormValues } from "@/components/admin/event-form";
import { updateEventAction } from "@/lib/actions/event-actions";
import { getEventByIdForAdmin } from "@/lib/data/events";
import { toDateInputValue } from "@/lib/events/format";

export const metadata: Metadata = {
  title: "Edit Event",
  robots: { index: false, follow: false },
};

type EditEventPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditEventPage({ params }: EditEventPageProps) {
  const { id } = await params;
  const event = await getEventByIdForAdmin(id);
  if (!event) notFound();

  const defaultValues: EventFormValues = {
    title: event.title,
    slug: event.slug,
    description: event.description,
    image: event.image,
    performer: event.performer ?? "",
    category: event.category,
    location: event.location,
    city: event.city,
    address: event.address,
    latitude: event.latitude?.toString() ?? "",
    longitude: event.longitude?.toString() ?? "",
    startDate: toDateInputValue(event.startDate),
    endDate: toDateInputValue(event.endDate),
    startTime: event.startTime,
    endTime: event.endTime,
    organizer: event.organizer,
    price: event.price.toString(),
    ticketUrl: event.ticketUrl ?? "",
    status: event.status,
  };

  const action = updateEventAction.bind(null, event.id);

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Edit event</h1>
        <p className="text-sm text-muted-foreground">{event.title}</p>
      </div>
      <EventForm action={action} defaultValues={defaultValues} submitLabel="Simpan perubahan" />
    </div>
  );
}
