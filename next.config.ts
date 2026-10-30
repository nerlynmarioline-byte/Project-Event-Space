import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Hostname dibuka lebar karena admin (role tepercaya, bukan input publik)
    // boleh menempel URL poster dari mana saja, bukan cuma Cloudinary.
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
};

export default nextConfig;
