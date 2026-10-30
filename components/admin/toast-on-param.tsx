"use client";

import * as React from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { toast } from "sonner";

type ToastOnParamProps = {
  param: string;
  message: string;
};

/**
 * Menampilkan toast sukses sekali saja setelah redirect (misalnya dari
 * create/update event), lalu membersihkan query param dari URL.
 */
export function ToastOnParam({ param, message }: ToastOnParamProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const shown = React.useRef(false);

  React.useEffect(() => {
    if (shown.current) return;
    if (searchParams.get(param) !== "1") return;

    shown.current = true;
    toast.success(message);

    const next = new URLSearchParams(searchParams.toString());
    next.delete(param);
    const query = next.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  return null;
}
