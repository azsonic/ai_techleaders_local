"use client";

import type { ReactNode } from "react";

import { EmptyState } from "../../backend/feedback/empty-state";
import { ErrorMessage } from "../../backend/feedback/error-message";
import { LoadingMessage } from "../../backend/feedback/loading-message";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { Field, FieldLabel, FieldLegend, FieldSet } from "../ui/field";

export type FilterOption<Value extends string> = {
  value: Value;
  label: string;
};

/*
 * The filtered list pattern: visible filters that one click removes, a result count that is announced, and two
 * different empty states, "nothing here yet" and "no results for these filters" (with a clear action). The server
 * filters; this component shows the result. The options are a fixed list, never derived from the visible items, so
 * the filter does not jump while the list changes. `MentorDirectory` and `FavoriteMentors` are built on it.
 */
export function FilteredList<
  Item extends { id: string },
  Value extends string,
>({
  items,
  renderItem,
  filter,
  selected,
  onSelectedChange,
  noun,
  description,
  loading = false,
  error = false,
  onRetry,
  skeleton,
  loadingLabel,
  errorTitle,
  errorMessage = "Nothing was changed. Try again.",
  noResults,
  nothingYet,
  notice,
  listClassName = "grid gap-between-groups md:grid-cols-2",
}: {
  /** The server's filtered result. `undefined` while loading or after a failure. */
  items: Item[] | undefined;
  renderItem: (item: Item) => ReactNode;
  filter: { legend: string; options: readonly FilterOption<Value>[] };
  selected: Value[];
  onSelectedChange: (selected: Value[]) => void;
  /** Word for one item in the count: "1 mentor", "2 mentors". */
  noun: { singular: string; plural: string };
  /** One short line between the count and the list, for example the order: "Most recent first". */
  description?: string;
  loading?: boolean;
  error?: boolean;
  onRetry?: () => void;
  /** Placeholders with the footprint of an item, shown under `loadingLabel` while loading. Omit `skeleton`, `loadingLabel` and `errorTitle` when the page owns loading and error (for example inside a tab). */
  skeleton?: ReactNode;
  loadingLabel?: string;
  errorTitle?: string;
  /** One sentence under the error title. Say what is safe and what to do. */
  errorMessage?: string;
  /** Filters are set and nothing matches. */
  noResults: { title: string; description: string };
  /** No filter is set and the list is empty. `action` is a create or find action, when the viewer has one. */
  nothingYet: { title: string; description: string; action?: ReactNode };
  /** A message about the whole list (booking closed, a failed action), above the filters. */
  notice?: ReactNode;
  listClassName?: string;
}) {
  const clear = () => onSelectedChange([]);

  return (
    <div className="flex flex-col gap-between-groups">
      {notice}

      <FieldSet>
        <FieldLegend>{filter.legend}</FieldLegend>
        <div className="flex flex-wrap gap-x-between-groups gap-y-within-group">
          {filter.options.map((option) => (
            <Field
              key={option.value}
              orientation="horizontal"
              className="w-fit"
            >
              <Checkbox
                checked={selected.includes(option.value)}
                onCheckedChange={(checked) =>
                  onSelectedChange(
                    checked
                      ? [...selected, option.value]
                      : selected.filter((value) => value !== option.value),
                  )
                }
              />
              <FieldLabel>{option.label}</FieldLabel>
            </Field>
          ))}
        </div>
        {selected.length > 0 && (
          <div>
            <Button variant="link" onClick={clear}>
              Clear filters
            </Button>
          </div>
        )}
      </FieldSet>

      {loading && (
        <div className="flex flex-col gap-within-group">
          <LoadingMessage label={loadingLabel} />
          <div className={listClassName}>{skeleton}</div>
        </div>
      )}

      {!loading && (error || !items) && (
        <ErrorMessage
          title={errorTitle}
          message={errorMessage}
          action={
            onRetry && (
              <Button variant="secondary" size="dense" onClick={onRetry}>
                Try again
              </Button>
            )
          }
        />
      )}

      {!loading &&
        !error &&
        items &&
        items.length === 0 &&
        selected.length > 0 && (
          <EmptyState
            title={noResults.title}
            description={noResults.description}
            action={
              <Button variant="secondary" size="dense" onClick={clear}>
                Clear filters
              </Button>
            }
          />
        )}

      {!loading &&
        !error &&
        items &&
        items.length === 0 &&
        selected.length === 0 && (
          <EmptyState
            title={nothingYet.title}
            description={nothingYet.description}
            action={nothingYet.action}
          />
        )}

      {!loading && !error && items && items.length > 0 && (
        <>
          <p role="status" className="text-interface text-muted-foreground">
            {items.length === 1
              ? `1 ${noun.singular}`
              : `${items.length} ${noun.plural}`}
          </p>
          {description && (
            <p className="text-interface text-muted-foreground">
              {description}
            </p>
          )}
          <ul className={listClassName}>
            {items.map((item) => (
              <li key={item.id}>{renderItem(item)}</li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
