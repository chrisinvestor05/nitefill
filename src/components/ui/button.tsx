import { cva, type VariantProps } from "class-variance-authority";
import { type ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 font-semibold transition-[transform,opacity,filter,background-color,border-color] duration-150 ease-out disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal",
  {
    variants: {
      variant: {
        orange:
          "bg-orange text-fg shadow-[0_12px_32px_-12px_color-mix(in_oklab,var(--color-orange)_55%,transparent)] hover:brightness-110",
        teal: "bg-teal text-navy hover:brightness-110",
        ghost:
          "border border-fg/20 bg-fg/5 text-fg hover:bg-fg/10 hover:border-fg/30",
        quiet: "bg-fg/10 text-fg hover:bg-fg/15",
        danger: "bg-danger text-fg hover:brightness-110",
      },
      size: {
        sm: "h-9 rounded-lg px-3.5 text-sm",
        md: "h-11 rounded-xl px-5 text-sm",
        lg: "h-12 rounded-full px-6 text-sm",
        xl: "h-12 rounded-xl px-8 text-base",
      },
    },
    defaultVariants: { variant: "orange", size: "md" },
  },
);

export const Button = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants>
>(function Button({ className, variant, size, type = "button", ...props }, ref) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
});
