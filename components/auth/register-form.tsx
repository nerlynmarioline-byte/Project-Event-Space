"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField, fieldProps } from "@/components/auth/form-field";
import { PasswordInput } from "@/components/auth/password-input";
import { registerAction } from "@/lib/actions/auth-actions";

export function RegisterForm() {
  const [state, formAction, isPending] = useActionState(
    registerAction,
    undefined
  );

  const nameError = state?.fieldErrors?.name?.[0];
  const emailError = state?.fieldErrors?.email?.[0];
  const passwordError = state?.fieldErrors?.password?.[0];
  const confirmPasswordError = state?.fieldErrors?.confirmPassword?.[0];

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

      <FormField id="name" label="Nama lengkap" error={nameError}>
        <Input
          {...fieldProps("name", nameError)}
          type="text"
          autoComplete="name"
          required
          defaultValue={state?.values?.name}
        />
      </FormField>

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

      <FormField
        id="password"
        label="Password"
        error={passwordError}
        hint="Minimal 8 karakter."
      >
        <PasswordInput
          {...fieldProps("password", passwordError, "Minimal 8 karakter.")}
          autoComplete="new-password"
          required
        />
      </FormField>

      <FormField
        id="confirmPassword"
        label="Konfirmasi password"
        error={confirmPasswordError}
      >
        <PasswordInput
          {...fieldProps("confirmPassword", confirmPasswordError)}
          autoComplete="new-password"
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
          "Buat akun"
        )}
      </Button>
    </form>
  );
}
