import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium tracking-tight transition-all duration-200 ease-out disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.97] [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "border border-border/60 bg-background_alt/80 text-primary backdrop-blur-sm hover:border-border hover:bg-foreground_alt/80",
        primary:
          "bg-accent text-background shadow-[0_8px_24px_-12px_hsl(76_88%_64%/0.55)] hover:bg-accent/90 hover:shadow-[0_10px_30px_-10px_hsl(76_88%_64%/0.7)]",
        destructive:
          "border border-error/40 bg-error/10 text-error hover:bg-error/20",
        accept:
          "border border-accent/40 bg-accent/15 text-accent hover:bg-accent/25",
        outline:
          "border border-border/70 bg-transparent text-primary hover:border-accent/40 hover:bg-foreground_alt/40 hover:text-primary",
        secondary:
          "border border-border/60 bg-foreground/60 text-primary hover:bg-foreground_alt",
        ghost:
          "border border-transparent text-secondary hover:bg-foreground_alt/60 hover:text-primary",
        link: "text-accent underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-11 rounded-md px-6 text-[15px]",
        icon: "h-9 w-9",
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
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
