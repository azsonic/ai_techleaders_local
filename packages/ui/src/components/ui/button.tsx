import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

/*
 * Button. Shape, density and states follow lekcja-06/tokeny.md and the stage 2 decisions in
 * packages/ui/POSTEP.md: opaque hover and pressed fills (R01.5, P11.1), one focus appearance,
 * no movement on press (P11.1), disabled by token fill and never by opacity.
 */
const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-within-group rounded-control border border-transparent text-interface font-emphasis whitespace-nowrap transition-colors select-none focus-ring disabled:pointer-events-none disabled:cursor-not-allowed disabled:border-border disabled:bg-muted disabled:text-muted-foreground aria-disabled:pointer-events-none aria-busy:cursor-progress [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary-hover active:bg-primary-hover",
        secondary:
          "border-border bg-secondary text-secondary-foreground hover:border-foreground active:border-foreground",
        ghost: "text-foreground hover:bg-accent active:bg-accent",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive-hover active:bg-destructive-hover",
        link: "min-h-control-min rounded-none px-0 text-primary underline underline-offset-4 hover:text-primary-hover active:text-primary-hover",
      },
      size: {
        default: "h-control px-control-x",
        dense: "h-control-dense px-control-x-dense",
        xs: "h-control-min px-within-group",
        icon: "size-control",
        "icon-dense": "size-control-dense",
        "icon-xs": "size-control-min",
      },
    },
    compoundVariants: [
      {
        variant: "link",
        size: ["default", "dense", "xs"],
        className: "h-auto px-0",
      },
      {
        variant: "link",
        className: "disabled:border-transparent disabled:bg-transparent",
      },
    ],
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

type ButtonProps = ButtonPrimitive.Props &
  VariantProps<typeof buttonVariants> & {
    /** Blocks repeat activation and announces busy state. The button stays focusable. */
    loading?: boolean;
    /** Replaces the label while loading, for example "Saving…". */
    loadingLabel?: string;
  };

function Button({
  className,
  variant = "default",
  size = "default",
  loading = false,
  loadingLabel,
  onClick,
  children,
  ...props
}: ButtonProps) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      aria-busy={loading || undefined}
      aria-disabled={loading || undefined}
      onClick={loading ? (event) => event.preventDefault() : onClick}
      {...props}
    >
      {loading && loadingLabel ? loadingLabel : children}
    </ButtonPrimitive>
  );
}

export { Button, buttonVariants };
export type { ButtonProps };
