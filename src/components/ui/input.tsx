import { type InputHTMLAttributes, type TextareaHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

const fieldClass =
  "w-full rounded-xl border border-fg/12 bg-surface px-4 py-2.5 text-sm text-fg placeholder:text-fg/30 outline-none transition-[border-color,box-shadow,background-color] duration-150 focus:border-teal focus:bg-fg/8 focus:shadow-[0_0_0_3px_rgba(0,230,255,0.12)] disabled:opacity-50";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...props }, ref) {
    return <input ref={ref} className={cn(fieldClass, "h-11", className)} {...props} />;
  },
);

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(function Textarea({ className, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      className={cn(fieldClass, "min-h-28 resize-y", className)}
      {...props}
    />
  );
});
