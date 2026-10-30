"use server";

import { requireAdmin } from "@/lib/auth/guards";
import { isCloudinaryConfigured, uploadEventImage } from "@/lib/cloudinary";

const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export type UploadState = { url?: string; error?: string } | undefined;

export async function uploadPosterAction(
  _prev: UploadState,
  formData: FormData
): Promise<UploadState> {
  await requireAdmin();

  if (!isCloudinaryConfigured()) {
    return {
      error:
        "Cloudinary belum dikonfigurasi di .env. Tempel URL gambar secara manual dulu.",
    };
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Pilih file gambar terlebih dahulu" };
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { error: "Format harus JPG, PNG, atau WebP" };
  }
  if (file.size > MAX_SIZE) {
    return { error: "Ukuran gambar maksimal 5MB" };
  }

  try {
    const url = await uploadEventImage(file);
    return { url };
  } catch {
    return { error: "Upload gagal. Coba lagi atau tempel URL gambar manual." };
  }
}
