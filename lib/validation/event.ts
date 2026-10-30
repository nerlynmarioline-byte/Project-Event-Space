import { z } from "zod";

export const EVENT_CATEGORIES = [
  "Musik",
  "Festival",
  "Workshop",
  "Seminar",
  "Olahraga",
  "Komunitas",
  "Kuliner",
  "Lainnya",
] as const;

export const EVENT_CITIES = [
  "Samarinda",
  "Tenggarong",
  "Balikpapan",
  "Bontang",
  "Kutai Kartanegara",
  "Kutai Timur",
] as const;

export const EVENT_STATUSES = [
  "DRAFT",
  "PUBLISHED",
  "CANCELLED",
  "FINISHED",
] as const;

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const eventSchema = z
  .object({
    title: z.string().trim().min(3, "Judul minimal 3 karakter").max(150),
    slug: z
      .string()
      .trim()
      .toLowerCase()
      .min(3, "Slug minimal 3 karakter")
      .max(150)
      .regex(slugRegex, "Slug hanya huruf kecil, angka, dan tanda hubung"),
    description: z.string().trim().min(20, "Deskripsi minimal 20 karakter"),
    image: z.string().trim().url("Poster wajib berupa URL gambar yang valid"),
    performer: z.string().trim().max(150, "Nama penampil maksimal 150 karakter").optional(),
    category: z.enum(EVENT_CATEGORIES, {
      message: "Pilih kategori",
    }),
    location: z.string().trim().min(3, "Nama lokasi minimal 3 karakter"),
    city: z.enum(EVENT_CITIES, { message: "Pilih kota" }),
    address: z.string().trim().min(5, "Alamat minimal 5 karakter"),
    latitude: z.coerce.number().min(-90).max(90).optional(),
    longitude: z.coerce.number().min(-180).max(180).optional(),
    startDate: z.string().min(1, "Tanggal mulai wajib diisi"),
    endDate: z.string().min(1, "Tanggal selesai wajib diisi"),
    startTime: z.string().regex(timeRegex, "Format jam HH:mm"),
    endTime: z.string().regex(timeRegex, "Format jam HH:mm"),
    organizer: z.string().trim().min(2, "Organizer minimal 2 karakter"),
    price: z.coerce.number().int().min(0, "Harga tidak boleh negatif"),
    ticketUrl: z
      .union([z.string().trim().url("Link tiket harus URL valid"), z.literal("")])
      .optional(),
    status: z.enum(EVENT_STATUSES),
  })
  .refine((data) => new Date(data.endDate) >= new Date(data.startDate), {
    message: "Tanggal selesai tidak boleh sebelum tanggal mulai",
    path: ["endDate"],
  })
  .refine(
    (data) =>
      data.startDate !== data.endDate || data.endTime > data.startTime,
    {
      message: "Jam selesai harus setelah jam mulai",
      path: ["endTime"],
    }
  );

export type EventInput = z.infer<typeof eventSchema>;
