import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";
import NextLink from "next/link";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "group/button font-heading inline-flex shrink-0 items-center justify-center border border-transparent bg-clip-padding text-sm font-semibold whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/80",
        outline: "border-border bg-background hover:bg-primary/10 hover:text-primary hover:border-primary/30",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-primary/5 hover:text-primary",
        destructive: "bg-destructive/10 text-destructive hover:bg-destructive/20",
        link: "border-none bg-transparent text-primary underline-offset-4 hover:underline",
        white: "bg-white text-ink hover:bg-white/90 shadow-sm",
      },
      size: {
        default: "h-8 gap-1.5 px-2.5",
        sm: "h-7 gap-1 px-2.5 text-[0.8rem]",
        lg: "h-10 gap-1.5 px-4",
        icon: "size-8",
      },
      shape: {
        rounded: "rounded-lg",
        pill: "rounded-full",
      },
    },
    defaultVariants: { variant: "default", size: "default", shape: "rounded" },
  }
);

type ButtonVariants = VariantProps<typeof buttonVariants>;

type ButtonAsButton = ButtonPrimitive.Props &
  ButtonVariants & {
    href?: undefined;
  };

type ButtonAsLink = Omit<React.ComponentProps<typeof NextLink>, "href"> &
  ButtonVariants & {
    href: string;
    disabled?: boolean;
  };

type ButtonProps = ButtonAsButton | ButtonAsLink;

function Button({ className, variant = "default", size = "default", shape = "rounded", href, ...props }: ButtonProps) {
  const classes = cn(buttonVariants({ variant, size, shape, className }));

  if (href !== undefined) {
    const { disabled, ...linkProps } = props as Omit<ButtonAsLink, "href" | "variant" | "size" | "shape" | "className">;

    if (disabled) {
      return (
        <span data-slot="button" aria-disabled="true" className={cn(classes, "pointer-events-none opacity-50")}>
          {(linkProps as { children?: React.ReactNode }).children}
        </span>
      );
    }

    return (
      <NextLink data-slot="button" href={href} className={classes} {...linkProps} />
    );
  }

  return (
    <ButtonPrimitive
      data-slot="button"
      className={classes}
      {...(props as ButtonPrimitive.Props)}
    />
  );
}

export { Button, buttonVariants };
export type { ButtonProps };
