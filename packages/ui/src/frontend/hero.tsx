import type { ReactNode } from "react";

import { cn } from "../lib/utils";

type HeroProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  children?: ReactNode;
  className?: string;
};

export function Hero({ eyebrow, title, description, children, className }: HeroProps) {
  return (
    <section className={cn("mx-auto flex w-full max-w-3xl flex-col items-center gap-6 px-6 py-24 text-center", className)}>
      {eyebrow && (
        <span className="rounded-control bg-muted px-within-group py-inline text-interface font-emphasis text-muted-foreground">{eyebrow}</span>
      )}
      <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">{title}</h1>
      {description && <p className="max-w-xl text-lg leading-8 text-muted-foreground">{description}</p>}
      {children && <div className="flex flex-wrap justify-center gap-3">{children}</div>}
    </section>
  );
}
