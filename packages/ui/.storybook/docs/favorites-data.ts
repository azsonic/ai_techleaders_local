/** Example data for the Favorites stories: fictional mentors in the shape the favorites list takes. */
import type { FavoriteMentor } from "@devmentor/ui/components/favorites/favorite-mentors";

export const FAVORITES: FavoriteMentor[] = [
  {
    id: "anna",
    displayName: "Anna Kowalska",
    headline: "Senior frontend engineer, nine years with React and TypeScript",
    stacks: ["typescript", "react"],
    href: "/mentors/anna-kowalska",
  },
  {
    id: "piotr",
    displayName: "Piotr Nowak",
    headline: "Machine learning engineer building agent workflows",
    stacks: ["python", "ai-agents"],
    href: "/mentors/piotr-nowak",
  },
  {
    id: "marta",
    displayName: "Marta Zielińska",
    headline: "Tech lead for design systems and accessibility",
    stacks: ["react"],
    href: "/mentors/marta-zielinska",
  },
  {
    id: "jan",
    displayName: "Jan Kowalski",
    headline: "Backend developer, Node.js services and TypeScript tooling",
    stacks: ["typescript"],
    href: "/mentors/jan-kowalski",
  },
];

const STACK_CYCLE = [
  ["typescript"],
  ["react", "typescript"],
  ["python"],
  ["ai-agents", "python"],
] as const;

/** Thirty favorites, to see how the list and the count behave. */
export const MANY_FAVORITES: FavoriteMentor[] = Array.from(
  { length: 30 },
  (_, index) => ({
    id: `m${index}`,
    displayName: `Mentor ${index + 1} Example`,
    headline: `Example headline ${index + 1}`,
    stacks: [...STACK_CYCLE[index % STACK_CYCLE.length]],
    href: `/mentors/mentor-${index + 1}`,
  }),
);
