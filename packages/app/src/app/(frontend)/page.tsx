import Link from "next/link";

import { buttonVariants } from "@devmentor/ui/components/ui/button";
import { Hero } from "@devmentor/ui/frontend/hero";
import { cn } from "@devmentor/ui/lib/utils";

export default function Home() {
  return (
    <main className="flex flex-1 items-center justify-center bg-background">
      <Hero
        eyebrow="DevMentor"
        title="Grow as a developer, one session at a time."
        description="Mentoring, learning paths and feedback for engineers and tech leaders."
      >
        <Link
          href="/admin"
          className={cn(buttonVariants())}
        >
          Go to admin
        </Link>
      </Hero>
    </main>
  );
}
