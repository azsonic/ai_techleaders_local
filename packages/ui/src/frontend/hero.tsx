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
        <span className="rounded-full bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-700">{eyebrow}</span>
      )}
      <h1 className="text-4xl font-semibold tracking-tight text-zinc-900 sm:text-5xl">{title}</h1>
      {description && <p className="max-w-xl text-lg leading-8 text-zinc-600">{description}</p>}
      {children && <div className="flex flex-wrap justify-center gap-3">{children}</div>}
    </section>
  );
}
