import Link from "next/link";

import { Hero } from "@devmentor/ui/frontend/hero";

export default function Home() {
  return (
    <main className="flex flex-1 items-center justify-center bg-gradient-to-b from-white to-indigo-50">
      <Hero
        eyebrow="DevMentor"
        title="Grow as a developer, one session at a time."
        description="Mentoring, learning paths and feedback for engineers and tech leaders."
      >
        <Link
          href="/admin"
          className="rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-500"
        >
          Go to admin
        </Link>
      </Hero>
    </main>
  );
}
