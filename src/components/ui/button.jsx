import React from "react";
import { cn } from "../../lib/utils";

const Button = React.forwardRef(({ className, variant = "default", size = "default", children, ...props }, ref) => {
  const variants = {
    default:
      "bg-zinc-900 text-white hover:bg-zinc-800 border border-zinc-800",
    outline:
      "bg-transparent text-zinc-700 hover:bg-zinc-100 border border-zinc-200",
    ghost:
      "bg-transparent text-zinc-600 hover:bg-zinc-100 border border-transparent",
    accent:
      "bg-sage-600 text-white hover:bg-sage-500 border border-sage-600",
    danger:
      "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200",
  };

  const sizes = {
    default: "h-9 px-4 text-sm",
    sm: "h-8 px-3 text-xs",
    lg: "h-10 px-6 text-base",
    icon: "h-9 w-9",
  };

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-150 cursor-pointer",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2",
        "disabled:opacity-50 disabled:pointer-events-none",
        variants[variant],
        sizes[size],
        className
      )}
      ref={ref}
      {...props}
    >
      {children}
    </button>
  );
});

Button.displayName = "Button";

export { Button };