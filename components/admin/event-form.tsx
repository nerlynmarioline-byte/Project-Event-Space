"use client";

import * as React from "react";
import { useActionState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormField, fieldProps } from "@/components/auth/form-field";
import { PosterUpload } from "@/components/admin/poster-upload";
import {
  EVENT_CATEGORIES,
  EVENT_CITIES,
  EVENT_STATUSES,
} from "@/lib/validation/event";
import type { EventActionState } from "@/lib/actions/event-actions";
import { slugify } from "@/lib/events/slug-client";

export type EventFormValues = Partial<{
  title: string;
  slug: string;
  description: string;
  image: string;
  performer: string;
  category: string;
  location: string;
  city: string;
  address: string;
  latitude: string;
  longitude: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  organizer: string;
  price: string;
  ticketUrl: string;
  status: string;
}>;

type EventFormProps = {
  action: (
    state: EventActionState,
    formData: FormData
  ) => Promise<EventActionState>;
  defaultValues?: EventFormValues;
  submitLabel: string;
};

const STATUS_LABEL: Record<string, string> = {
  DRAFT: "Draft",
  PUBLISHED: "Published",
  CANCELLED: "Cancelled",
  FINISHED: "Finished",
};

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4 border-b border-border pb-8 last:border-0 last:pb-0">
      <div>
        <h2 className="font-medium">{title}</h2>
        {description ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

export function EventForm({ action, defaultValues, submitLabel }: EventFormProps) {
  const [state, formAction, isPending] = useActionState(action, undefined);
  const values = state?.values ?? defaultValues ?? {};
  const errors = state?.fieldErrors ?? {};

  const [slugEdited, setSlugEdited] = React.useState(Boolean(defaultValues?.slug));
  const [slugValue, setSlugValue] = React.useState(values.slug ?? "");
  const [titleValue, setTitleValue] = React.useState(values.title ?? "");

  return (
    <form action={formAction} className="space-y-8" noValidate>
      {state?.error ? (
        <div
          role="alert"
          className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
        >
          {state.error}
        </div>
      ) : null}

      <Section title="Informasi dasar">
        <FormField id="title" label="Nama event" error={errors.title?.[0]}>
          <Input
            {...fieldProps("title", errors.title?.[0])}
            required
            value={titleValue}
            onChange={(e) => {
              setTitleValue(e.target.value);
              if (!slugEdited) setSlugValue(slugify(e.target.value));
            }}
          />
        </FormField>

        <FormField
          id="performer"
          label="Penampil/artis"
          error={errors.performer?.[0]}
          hint="Opsional. Isi nama artis atau lineup agar event mudah dicari dan dikelompokkan di Favorit."
        >
          <Input
            {...fieldProps("performer", errors.performer?.[0], "Contoh: Rossa")}
            defaultValue={values.performer}
          />
        </FormField>

        <FormField
          id="slug"
          label="Slug"
          error={errors.slug?.[0]}
          hint="Dipakai di URL, contoh: /events/nama-slug-ini"
        >
          <Input
            {...fieldProps("slug", errors.slug?.[0], "Dipakai di URL")}
            required
            value={slugValue}
            onChange={(e) => {
              setSlugEdited(true);
              setSlugValue(slugify(e.target.value));
            }}
          />
        </FormField>

        <FormField id="category" label="Kategori" error={errors.category?.[0]}>
          <Select name="category" defaultValue={values.category}>
            <SelectTrigger id="category" aria-invalid={errors.category ? true : undefined}>
              <SelectValue placeholder="Pilih kategori" />
            </SelectTrigger>
            <SelectContent>
              {EVENT_CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>

        <FormField id="description" label="Deskripsi" error={errors.description?.[0]}>
          <Textarea
            {...fieldProps("description", errors.description?.[0])}
            required
            rows={5}
            defaultValue={values.description}
          />
        </FormField>

        <FormField id="image" label="Poster" error={errors.image?.[0]}>
          <PosterUpload id="image" name="image" defaultValue={values.image} error={errors.image?.[0]} />
        </FormField>
      </Section>

      <Section title="Lokasi">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField id="location" label="Nama lokasi/venue" error={errors.location?.[0]}>
            <Input {...fieldProps("location", errors.location?.[0])} required defaultValue={values.location} />
          </FormField>
          <FormField id="city" label="Kota" error={errors.city?.[0]}>
            <Select name="city" defaultValue={values.city}>
              <SelectTrigger id="city" aria-invalid={errors.city ? true : undefined}>
                <SelectValue placeholder="Pilih kota" />
              </SelectTrigger>
              <SelectContent>
                {EVENT_CITIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
        </div>

        <FormField id="address" label="Alamat lengkap" error={errors.address?.[0]}>
          <Textarea {...fieldProps("address", errors.address?.[0])} required rows={2} defaultValue={values.address} />
        </FormField>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField id="latitude" label="Latitude (opsional)" error={errors.latitude?.[0]}>
            <Input
              {...fieldProps("latitude", errors.latitude?.[0])}
              type="number"
              step="any"
              defaultValue={values.latitude}
            />
          </FormField>
          <FormField id="longitude" label="Longitude (opsional)" error={errors.longitude?.[0]}>
            <Input
              {...fieldProps("longitude", errors.longitude?.[0])}
              type="number"
              step="any"
              defaultValue={values.longitude}
            />
          </FormField>
        </div>
      </Section>

      <Section title="Jadwal">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField id="startDate" label="Tanggal mulai" error={errors.startDate?.[0]}>
            <Input
              {...fieldProps("startDate", errors.startDate?.[0])}
              type="date"
              required
              defaultValue={values.startDate}
            />
          </FormField>
          <FormField id="endDate" label="Tanggal selesai" error={errors.endDate?.[0]}>
            <Input
              {...fieldProps("endDate", errors.endDate?.[0])}
              type="date"
              required
              defaultValue={values.endDate}
            />
          </FormField>
          <FormField id="startTime" label="Jam mulai" error={errors.startTime?.[0]}>
            <Input
              {...fieldProps("startTime", errors.startTime?.[0])}
              type="time"
              required
              defaultValue={values.startTime}
            />
          </FormField>
          <FormField id="endTime" label="Jam selesai" error={errors.endTime?.[0]}>
            <Input
              {...fieldProps("endTime", errors.endTime?.[0])}
              type="time"
              required
              defaultValue={values.endTime}
            />
          </FormField>
        </div>
      </Section>

      <Section title="Tiket dan publikasi">
        <FormField id="organizer" label="Organizer" error={errors.organizer?.[0]}>
          <Input {...fieldProps("organizer", errors.organizer?.[0])} required defaultValue={values.organizer} />
        </FormField>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField id="price" label="Harga tiket (Rp, isi 0 jika gratis)" error={errors.price?.[0]}>
            <Input
              {...fieldProps("price", errors.price?.[0])}
              type="number"
              min={0}
              step={1000}
              defaultValue={values.price ?? "0"}
            />
          </FormField>
          <FormField id="ticketUrl" label="Link tiket (opsional)" error={errors.ticketUrl?.[0]}>
            <Input
              {...fieldProps("ticketUrl", errors.ticketUrl?.[0])}
              type="url"
              placeholder="https://..."
              defaultValue={values.ticketUrl}
            />
          </FormField>
        </div>

        <FormField id="status" label="Status" error={errors.status?.[0]}>
          <Select name="status" defaultValue={values.status ?? "DRAFT"}>
            <SelectTrigger id="status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {EVENT_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {STATUS_LABEL[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
      </Section>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
          {submitLabel}
        </Button>
        <Button type="button" variant="outline" asChild>
          <Link href="/admin/events">Batal</Link>
        </Button>
      </div>
    </form>
  );
}
