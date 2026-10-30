"use server";

import { revalidatePath } from "next/cache";

import { getCurrentUser } from "@/lib/auth/guards";
import { prisma } from "@/lib/db/prisma";

export type AttendanceResult =
  | { attended: boolean }
  | { error: "UNAUTHENTICATED" | "NOT_FOUND" | "UNKNOWN" };

export async function toggleAttendanceAction(
  eventId: string,
): Promise<AttendanceResult> {
  const user = await getCurrentUser();
  if (!user) return { error: "UNAUTHENTICATED" };

  try {
    const favorite = await prisma.favorite.findUnique({
      where: { userId_eventId: { userId: user.id, eventId } },
      select: { id: true, attendedAt: true },
    });
    if (!favorite) return { error: "NOT_FOUND" };

    const attended = !favorite.attendedAt;
    await prisma.favorite.update({
      where: { id: favorite.id },
      data: { attendedAt: attended ? new Date() : null },
    });
    revalidatePath("/favorites");
    return { attended };
  } catch {
    return { error: "UNKNOWN" };
  }
}
