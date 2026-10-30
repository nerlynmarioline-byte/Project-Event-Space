"use client";

import { useState, useTransition } from "react";
import { Check, Eye } from "lucide-react";
import { toast } from "sonner";

import { toggleAttendanceAction } from "@/lib/actions/attendance-actions";

export function AttendanceButton({
  eventId,
  initialAttended,
}: {
  eventId: string;
  initialAttended: boolean;
}) {
  const [attended, setAttended] = useState(initialAttended);
  const [pending, startTransition] = useTransition();

  function toggle() {
    startTransition(async () => {
      const result = await toggleAttendanceAction(eventId);
      if ("error" in result) {
        toast.error(
          result.error === "UNAUTHENTICATED"
            ? "Silakan masuk kembali."
            : "Status tontonan belum berhasil disimpan.",
        );
        return;
      }
      setAttended(result.attended);
    });
  }

  return (
    <button
      type="button"
      className={attended ? "attendance-button is-attended" : "attendance-button"}
      onClick={toggle}
      disabled={pending}
      aria-pressed={attended}
    >
      {attended ? <Check size={14} /> : <Eye size={14} />}
      {pending ? "Menyimpan..." : attended ? "Sudah ditonton" : "Tandai ditonton"}
    </button>
  );
}
