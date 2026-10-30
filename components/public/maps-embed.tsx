export function MapsEmbed({
  address,
  latitude,
  longitude,
}: {
  address: string;
  latitude?: number | null;
  longitude?: number | null;
}) {
  const query = latitude != null && longitude != null ? `${latitude},${longitude}` : address;
  const src = `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;

  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <iframe
        src={src}
        title="Lokasi event di Google Maps"
        width="100%"
        height="300"
        style={{ border: 0 }}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
}
