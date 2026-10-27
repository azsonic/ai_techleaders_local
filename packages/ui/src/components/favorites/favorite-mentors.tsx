"use client";

import { useEffect, useRef, useState } from "react";

import type { ApiErrorBody, ApiResult } from "@devmentor/core";

import { TextLink } from "../../frontend/text-link";
import { FilteredList } from "../lists/filtered-list";
import { MentorCard, MentorCardSkeleton } from "../mentors/mentor-card";
import { STACKS, type Stack } from "../mentors/pricing";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Button } from "../ui/button";
import { useToast } from "../ui/toast";

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
  const toast = useToast();
  const [removing, setRemoving] = useState<string[]>([]);
  const [failure, setFailure] = useState<ApiErrorBody | null>(null);
  const areaRef = useRef<HTMLDivElement>(null);
  const focusTarget = useRef<{ index: number; count: number } | null>(null);
  const [removed, setRemoved] = useState(0);

  // Once the list has shrunk after a removal, focus the card that took its place, else the list area.
  // `removed` re-runs this when the list was already updated before `onRemove` resolved.
  useEffect(() => {
    const target = focusTarget.current;
    if (!target || !mentors || mentors.length >= target.count) return;
    const area = areaRef.current as HTMLDivElement;
    const links = area.querySelectorAll<HTMLElement>("h2 a");
    (links[Math.min(target.index, links.length - 1)] ?? area).focus();
    focusTarget.current = null;
  }, [mentors, removed]);

  const remove = async (mentor: FavoriteMentor, index: number) => {
    setRemoving((current) => [...current, mentor.id]);
    setFailure(null);
    const result = await onRemove(mentor.id);
    setRemoving((current) => current.filter((id) => id !== mentor.id));
    if (result.ok) {
      focusTarget.current = {
        index,
        count: (mentors as FavoriteMentor[]).length,
      };
      setRemoved((count) => count + 1);
      toast.add({
        title: `${mentor.displayName} removed from favorites`,
        description: "You can save this mentor again from their profile.",
      });
    } else {
      setFailure(result.error);
    }
  };

  return (
    <div ref={areaRef} tabIndex={-1} className="focus-ring">
      <FilteredList
        items={mentors}
        renderItem={(mentor) => (
          <MentorCard
            variant="saved"
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
                onClick={() =>
                  remove(mentor, (mentors as FavoriteMentor[]).indexOf(mentor))
                }
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
                {failure.code === "network_error"
                  ? "The server did not answer. Check your connection and try again."
                  : failure.message}{" "}
                They are still in your favorites.
              </AlertDescription>
            </Alert>
          )
        }
      />
    </div>
  );
}
