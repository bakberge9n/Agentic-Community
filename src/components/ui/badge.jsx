import React from "react";
import { cn } from "../../lib/utils";

const Badge = React.forwardRef(({ className, variant = "default", children, ...props }, ref) => {
  const variants = {
    default: "bg-zinc-100 text-zinc-700",
    active: "bg-emerald-50 text-emerald-700",
    idle: "bg-zinc-100 text-zinc-500",
    warning: "bg-amber-50 text-amber-700",
    error: "bg-red-50 text-red-700",
    outline: "bg-transparent text-zinc-600 border border-zinc-200",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variants[variant],
        className
      )}
      ref={ref}
      {...props}
    >
      {children}
    </span>
  );
});

Badge.displayName = "Badge";

export { Badge };