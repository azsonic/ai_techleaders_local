import type { ComponentProps } from "react";

import { cn } from "../lib/utils";

/**
 * Class string for anything that must look like a link, for example a framework Link:
 * `<Link href="/mentors" className={textLinkClassName}>`. Always underlined and in the primary
 * color (tokens.md: "underlined links"); hover darkens the text, it never removes the underline.
 */
export const textLinkClassName =
  "rounded-control text-primary underline underline-offset-4 hover:text-primary-hover active:text-primary-hover focus-ring";

type TextLinkProps = ComponentProps<"a"> & {
  /** Opens in a new tab and says so to screen readers. Use for a mentor's public-work links. */
  external?: boolean;
};

export function TextLink({
  className,
  external = false,
  children,
  ...props
}: TextLinkProps) {
  return (
    <a
      data-slot="text-link"
      className={cn(textLinkClassName, className)}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      {...props}
    >
      {children}
      {external && (
        <>
          {" "}
          <span className="sr-only">(opens in a new tab)</span>
        </>
      )}
    </a>
  );
}
