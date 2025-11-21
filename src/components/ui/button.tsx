import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-semibold ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-gradient-pink text-primary-foreground hover:shadow-playful-lg hover:-translate-y-0.5 active:translate-y-0 rounded-[16px] shadow-[0_4px_16px_rgba(236,72,153,0.3)]",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 hover:-translate-y-0.5 active:translate-y-0 rounded-[16px]",
        outline:
          "border-2 border-border bg-background hover:bg-accent hover:border-primary/20 hover:-translate-y-0.5 active:translate-y-0 rounded-[16px]",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:-translate-y-0.5 active:translate-y-0 rounded-[16px]",
        ghost: "hover:bg-accent hover:text-accent-foreground rounded-[12px]",
        link: "text-primary underline-offset-4 hover:underline",
        pill: "bg-gradient-pink text-primary-foreground hover:shadow-playful-lg hover:-translate-y-0.5 active:translate-y-0 rounded-full shadow-[0_4px_16px_rgba(236,72,153,0.3)]",
      },
      size: {
        default: "h-12 px-6 py-3",
        sm: "h-10 px-4 py-2 text-sm",
        lg: "h-14 px-8 py-4 text-base",
        icon: "h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  suppressHydrationWarning?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, suppressHydrationWarning, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        suppressHydrationWarning={suppressHydrationWarning}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
