"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma, EventStatus } from "@prisma/client";

import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/guards";
import { eventSchema } from "@/lib/validation/event";

export type EventActionState =
  | {
      error?: string;
      fieldErrors?: Record<string, string[] | undefined>;
      values?: Record<string, string>;
    }
  | undefined;

function readEventForm(formData: FormData) {
  const get = (k: string) => {
    const v = formData.get(k);
    return typeof v === "string" ? v : "";
  };
  return {
    title: get("title"),
    slug: get("slug"),
    description: get("description"),
    image: get("image"),
    performer: get("performer"),
    category: get("category"),
    location: get("location"),
    city: get("city"),
    address: get("address"),
    latitude: get("latitude") || undefined,
    longitude: get("longitude") || undefined,
    startDate: get("startDate"),
    endDate: get("endDate"),
    startTime: get("startTime"),
    endTime: get("endTime"),
    organizer: get("organizer"),
    price: get("price") || "0",
    ticketUrl: get("ticketUrl"),
    status: get("status") || "DRAFT",
  };
}

function revalidateEventPaths(slug?: string) {
  revalidatePath("/admin/events");
  revalidatePath("/admin/dashboard");
  if (slug) revalidatePath(`/events/${slug}`);
  revalidatePath("/events");
  revalidatePath("/");
  revalidatePath("/favorites");
}

export async function createEventAction(
  _prev: EventActionState,
  formData: FormData
): Promise<EventActionState> {
  const admin = await requireAdmin();

  const raw = readEventForm(formData);
  const parsed = eventSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors,
      values: raw as Record<string, string>,
    };
  }
  const data = parsed.data;

  const slugTaken = await prisma.event.findUnique({
    where: { slug: data.slug },
    select: { id: true },
  });
  if (slugTaken) {
    return {
      fieldErrors: { slug: ["Slug sudah dipakai, gunakan yang lain"] },
      values: raw as Record<string, string>,
    };
  }

  try {
    await prisma.event.create({
      data: {
        title: data.title,
        slug: data.slug,
        description: data.description,
        image: data.image,
        performer: data.performer || null,
        category: data.category,
        location: data.location,
        city: data.city,
        address: data.address,
        latitude: data.latitude ?? null,
        longitude: data.longitude ?? null,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        startTime: data.startTime,
        endTime: data.endTime,
        organizer: data.organizer,
        price: data.price,
        ticketUrl: data.ticketUrl || null,
        status: data.status,
        createdById: admin.id,
      },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return {
        fieldErrors: { slug: ["Slug sudah dipakai, gunakan yang lain"] },
        values: raw as Record<string, string>,
      };
    }
    throw error;
  }

  revalidateEventPaths(data.slug);
  redirect("/admin/events?created=1");
}

export async function updateEventAction(
  eventId: string,
  _prev: EventActionState,
  formData: FormData
): Promise<EventActionState> {
  await requireAdmin();

  const existing = await prisma.event.findUnique({ where: { id: eventId } });
  if (!existing) return { error: "Event tidak ditemukan" };

  const raw = readEventForm(formData);
  const parsed = eventSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors,
      values: raw as Record<string, string>,
    };
  }
  const data = parsed.data;

  if (data.slug !== existing.slug) {
    const slugTaken = await prisma.event.findUnique({
      where: { slug: data.slug },
      select: { id: true },
    });
    if (slugTaken) {
      return {
        fieldErrors: { slug: ["Slug sudah dipakai, gunakan yang lain"] },
        values: raw as Record<string, string>,
      };
    }
  }

  try {
    await prisma.event.update({
      where: { id: eventId },
      data: {
        title: data.title,
        slug: data.slug,
        description: data.description,
        image: data.image,
        performer: data.performer || null,
        category: data.category,
        location: data.location,
        city: data.city,
        address: data.address,
        latitude: data.latitude ?? null,
        longitude: data.longitude ?? null,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        startTime: data.startTime,
        endTime: data.endTime,
        organizer: data.organizer,
        price: data.price,
        ticketUrl: data.ticketUrl || null,
        status: data.status,
      },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return {
        fieldErrors: { slug: ["Slug sudah dipakai, gunakan yang lain"] },
        values: raw as Record<string, string>,
      };
    }
    throw error;
  }

  revalidateEventPaths(data.slug);
  revalidateEventPaths(existing.slug);
  redirect("/admin/events?updated=1");
}

async function setEventStatus(eventId: string, status: EventStatus) {
  await requireAdmin();
  const event = await prisma.event.update({
    where: { id: eventId },
    data: { status },
    select: { slug: true },
  });
  revalidateEventPaths(event.slug);
}

export async function publishEventAction(eventId: string) {
  try {
    await setEventStatus(eventId, "PUBLISHED");
    return { success: true as const };
  } catch {
    return { error: "Gagal mempublikasikan event" };
  }
}

export async function unpublishEventAction(eventId: string) {
  try {
    await setEventStatus(eventId, "DRAFT");
    return { success: true as const };
  } catch {
    return { error: "Gagal membatalkan publikasi event" };
  }
}

export async function cancelEventAction(eventId: string) {
  try {
    await setEventStatus(eventId, "CANCELLED");
    return { success: true as const };
  } catch {
    return { error: "Gagal membatalkan event" };
  }
}

export async function deleteEventAction(eventId: string) {
  try {
    await requireAdmin();
    const event = await prisma.event.delete({
      where: { id: eventId },
      select: { slug: true },
    });
    revalidateEventPaths(event.slug);
    return { success: true as const };
  } catch {
    return { error: "Gagal menghapus event" };
  }
}
