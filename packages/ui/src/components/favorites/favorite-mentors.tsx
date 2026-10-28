"use client";

import type { ApiResult } from "@devmentor/core";

import { useItemRemoval } from "../../hooks/use-item-removal";
import { TextLink } from "../../frontend/text-link";
import { FilteredList } from "../lists/filtered-list";
import { MentorCard, MentorCardSkeleton } from "../mentors/mentor-card";
import { STACKS, type Stack } from "../mentors/pricing";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Button } from "../ui/button";

export type FavoriteMentor = {
  id: string;
  displayName: string;
  /** One line about the mentor's work, at most 200 characters. Omitted when the mentor has none. */
  headline?: string;
  stacks: Stack[];
  href: string;
};

/*
 * The mentee's favorite mentors, built on the filtered list pattern. Removing is undoable (the mentor can be saved
 * again), so there is no confirmation dialog: only the acted-on card is pending, the card goes after the server
 * answered, a toast says who was removed, and focus moves on to the next card. A failure stays visible as an alert.
 * `onRemove` resolves (never rejects) with the API envelope.
 */
export function FavoriteMentors({
  mentors,
  selected,
  onSelectedChange,
  loading = false,
  error = false,
  onRetry,
  onRemove,
}: {
  mentors: FavoriteMentor[] | undefined;
  selected: Stack[];
  onSelectedChange: (selected: Stack[]) => void;
  loading?: boolean;
  error?: boolean;
  onRetry?: () => void;
  onRemove: (id: string) => Promise<ApiResult<unknown>>;
}) {
  const { areaProps, removing, failure, remove } = useItemRemoval({
    items: mentors,
    onRemove,
    toast: (mentor) => ({
      title: `${mentor.displayName} removed from favorites`,
      description: "You can save this mentor again from their profile.",
    }),
  });

  return (
    <div {...areaProps}>
      <FilteredList
        items={mentors}
        renderItem={(mentor) => (
          <MentorCard
            variant="listed"
            displayName={mentor.displayName}
            headline={mentor.headline}
            stacks={mentor.stacks}
            href={mentor.href}
            actions={
              <Button
                variant="secondary"
                size="dense"
                loading={removing.includes(mentor.id)}
                loadingLabel="Removing…"
                onClick={() => remove(mentor)}
              >
                Remove from favorites
                <span className="sr-only">: {mentor.displayName}</span>
              </Button>
            }
          />
        )}
        filter={{ legend: "Stack", options: STACKS }}
        selected={selected}
        onSelectedChange={onSelectedChange}
        noun={{ singular: "mentor", plural: "mentors" }}
        loading={loading}
        error={error}
        onRetry={onRetry}
        skeleton={
          <>
            <MentorCardSkeleton />
            <MentorCardSkeleton />
          </>
        }
        loadingLabel="Loading your favorite mentors…"
        errorTitle="Your favorite mentors did not load"
        noResults={{
          title: "No favorite mentors for these filters",
          description: "Remove a filter to see more of your favorite mentors.",
        }}
        nothingYet={{
          title: "You have not saved any mentors yet",
          description:
            "Save a mentor from the directory and they will appear here.",
          action: <TextLink href="/mentors">Find a mentor</TextLink>,
        }}
        notice={
          failure && (
            <Alert variant="destructive">
              <AlertTitle>The mentor was not removed</AlertTitle>
              <AlertDescription>
                {failure} They are still in your favorites.
              </AlertDescription>
            </Alert>
          )
        }
      />
    </div>
  );
}
