"use client";

import * as React from "react";
import { useActionState } from "react";
import Image from "next/image";
import { ImagePlus, Loader2, X } from "lucide-react";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { uploadPosterAction } from "@/lib/actions/upload-actions";

type PosterUploadProps = {
  id: string;
  name: string;
  defaultValue?: string;
  error?: string;
};

export function PosterUpload({ id, name, defaultValue, error }: PosterUploadProps) {
  const [state, formAction, isPending] = useActionState(
    uploadPosterAction,
    undefined
  );
  const [url, setUrl] = React.useState(defaultValue ?? "");
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const lastHandled = React.useRef(state);

  React.useEffect(() => {
    if (state === lastHandled.current) return;
    lastHandled.current = state;
    if (state?.url) setUrl(state.url);
    if (state?.error) toast.error(state.error);
  }, [state]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    formAction(formData);
    e.target.value = "";
  }

  return (
    <div className="space-y-2">
      <input type="hidden" name={name} value={url} />
      <div className="flex items-start gap-4">
        <div className="relative flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-md border border-dashed border-border bg-muted">
          {url ? (
            <Image src={url} alt="" fill sizes="96px" className="object-cover" />
          ) : (
            <ImagePlus className="size-5 text-muted-foreground" aria-hidden="true" />
          )}
          {isPending ? (
            <div className="absolute inset-0 flex items-center justify-center bg-background/70">
              <Loader2 className="size-5 animate-spin" aria-hidden="true" />
            </div>
          ) : null}
        </div>
        <div className="flex-1 space-y-2">
          <Input
            id={id}
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://... (tempel URL gambar)"
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? `${id}-error` : `${id}-hint`}
          />
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isPending}
              onClick={() => fileInputRef.current?.click()}
            >
              <ImagePlus className="size-4" aria-hidden="true" />
              Upload ke Cloudinary
            </Button>
            {url ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setUrl("")}
              >
                <X className="size-4" aria-hidden="true" />
                Hapus
              </Button>
            ) : null}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleFileChange}
          />
          {!error ? (
            <p id={`${id}-hint`} className="text-xs text-muted-foreground">
              Tempel URL gambar, atau upload lewat Cloudinary bila sudah dikonfigurasi.
            </p>
          ) : null}
        </div>
      </div>
      {error ? (
        <p id={`${id}-error`} role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
