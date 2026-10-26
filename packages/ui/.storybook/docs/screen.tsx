import type { ReactNode } from "react";

/**
 * Documentation helper: the page chrome around a screen story (product name, one main landmark, content width).
 * The real application shell is not part of the design system yet, so this stays minimal and is not exported.
 */
export const ScreenFrame = ({
  children,
  width = "browse",
}: {
  children: ReactNode;
  width?: "browse" | "prose";
}) => (
  <div className="min-h-dvh bg-background text-foreground">
    <header className="border-b border-border bg-card px-page-inline py-within-group">
      <p className="mx-auto max-w-content text-interface font-emphasis">
        DevMentor
      </p>
    </header>
    <main
      className={`mx-auto flex flex-col gap-section px-page-inline py-section ${width === "browse" ? "max-w-content" : "max-w-prose"}`}
    >
      {children}
    </main>
  </div>
);
