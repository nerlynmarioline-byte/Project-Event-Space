"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField, fieldProps } from "@/components/auth/form-field";
import { PasswordInput } from "@/components/auth/password-input";
import type { ActionState } from "@/lib/actions/auth-actions";

type LoginFormProps = {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  callbackUrl?: string;
  submitLabel?: string;
};

export function LoginForm({
  action,
  callbackUrl,
  submitLabel = "Masuk",
}: LoginFormProps) {
  const [state, formAction, isPending] = useActionState(action, undefined);

  const emailError = state?.fieldErrors?.email?.[0];
  const passwordError = state?.fieldErrors?.password?.[0];

  return (
    <form action={formAction} className="space-y-5" noValidate>
      {state?.error ? (
        <div
          role="alert"
          className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
        >
          {state.error}
        </div>
      ) : null}

      {callbackUrl ? (
        <input type="hidden" name="callbackUrl" value={callbackUrl} />
      ) : null}

      <FormField id="email" label="Email" error={emailError}>
        <Input
          {...fieldProps("email", emailError)}
          type="email"
          autoComplete="email"
          inputMode="email"
          required
          defaultValue={state?.values?.email}
          placeholder="nama@email.com"
        />
      </FormField>

      <FormField id="password" label="Password" error={passwordError}>
        <PasswordInput
          {...fieldProps("password", passwordError)}
          autoComplete="current-password"
          required
        />
      </FormField>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? (
          <>
            <Loader2 className="animate-spin" aria-hidden="true" />
            Memproses
          </>
        ) : (
          submitLabel
        )}
      </Button>
    </form>
  );
}
