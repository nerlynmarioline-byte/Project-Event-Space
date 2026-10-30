
"use client";

import * as React from "react";
import { Slot, Slottable } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  [
    "group relative isolate inline-flex items-center justify-center gap-2",
    "overflow-hidden whitespace-nowrap select-none",
    "rounded-xl text-sm font-medium",
    "transition-all duration-300 ease-out",
    "hover:-translate-y-0.5 hover:shadow-lg",
    "active:translate-y-0 active:scale-[0.97]",
    "disabled:pointer-events-none disabled:opacity-60",
    "focus-visible:outline-none focus-visible:ring-2",
    "focus-visible:ring-ring focus-visible:ring-offset-2",
    "touch-manipulation",
    "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
    "motion-reduce:transform-none motion-reduce:transition-none",
  ].join(" "),
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:border-primary/50 hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground",
        link:
          "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "min-h-10 px-4 py-2",
        sm: "min-h-9 rounded-lg px-3",
        lg: "min-h-11 rounded-xl px-6 py-2.5 sm:px-8",
        icon: "size-10 shrink-0 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  delayMs?: number;
  loadingText?: string;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      delayMs = 2000,
      loadingText = "Memproses...",
      onClick,
      disabled,
      children,
      type,
      ...props
    },
    ref
  ) => {
    const [isWaiting, setIsWaiting] = React.useState(false);

    const timerRef =
      React.useRef<ReturnType<typeof setTimeout> | null>(null);

    const waitingRef = React.useRef(false);

    React.useEffect(() => {
      return () => {
        if (timerRef.current) {
          clearTimeout(timerRef.current);
        }
      };
    }, []);

    const handleClick = (
      event: React.MouseEvent<HTMLButtonElement>
    ) => {
      if (disabled || waitingRef.current) {
        event.preventDefault();
        return;
      }

      // Navigasi Link tetap langsung agar tidak menghambat pengguna.
      if (asChild) {
        onClick?.(event);
        return;
      }

      // Tanpa handler, tidak ada aksi yang perlu ditunda.
      if (!onClick) return;

      // Gunakan delayMs={0} jika tidak membutuhkan jeda.
      if (delayMs <= 0) {
        onClick(event);
        return;
      }

      event.preventDefault();

      waitingRef.current = true;
      setIsWaiting(true);

      timerRef.current = setTimeout(() => {
        waitingRef.current = false;
        timerRef.current = null;
        setIsWaiting(false);

        onClick(event);
      }, delayMs);
    };

    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        ref={ref}
        type={asChild ? undefined : (type ?? "button")}
        className={cn(
          buttonVariants({ variant, size }),
          "before:absolute before:inset-0 before:-z-10",
          "before:translate-x-[-120%] before:skew-x-[-20deg]",
          "before:bg-gradient-to-r before:from-transparent",
          "before:via-white/20 before:to-transparent",
          "before:transition-transform before:duration-700",
          "hover:before:translate-x-[120%]",
          "motion-reduce:before:transition-none",
          className
        )}
        disabled={asChild ? undefined : disabled || isWaiting}
        aria-busy={isWaiting || undefined}
        onClick={handleClick}
        {...props}
      >
        {asChild ? (
          <Slottable>{children}</Slottable>
        ) : (
          <>
            {isWaiting ? (
              <>
                <svg
                  aria-hidden="true"
                  className="size-4 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-90"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  />
                </svg>
                <span className="animate-pulse">{loadingText}</span>
              </>
            ) : (
              <span className="inline-flex items-center justify-center gap-2">
                {children}
              </span>
            )}
          </>
        )}
      </Comp>
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };
