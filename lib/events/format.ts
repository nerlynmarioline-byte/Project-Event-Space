// date disimpan sebagai UTC-midnight untuk tanggal murni (tanpa jam),
// jadi diambil lewat toISOString supaya tidak bergeser sehari akibat
// timezone server.
export function toDateInputValue(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export const eventDateFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

export const eventDateShortFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});

export const priceFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

export function formatPrice(price: number) {
  return price === 0 ? "Gratis" : priceFormatter.format(price);
}

export function formatEventDateRange(startDate: Date, endDate: Date) {
  const start = eventDateFormatter.format(startDate);
  if (startDate.getTime() === endDate.getTime()) return start;
  return `${eventDateShortFormatter.format(startDate)} - ${eventDateFormatter.format(endDate)}`;
}
