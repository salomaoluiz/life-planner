import {
  ActivityActionFilter,
  ActivityFilters,
  ActivityModule,
} from "@domain/entities/activity/ActivityEntity";

export interface ActivityFilterState {
  action: "all" | ActivityActionFilter;
  actorId: string;
  ownerId: string;
  period: ActivityPeriod;
  q: string;
}

export type ActivityPeriod = "6m" | "7d" | "30d" | "today";

export const ALL = "all";
export const DEFAULT_PERIOD: ActivityPeriod = "30d";
export const PERIODS: ActivityPeriod[] = ["today", "7d", "30d", "6m"];
export const ACTION_FILTERS: ActivityActionFilter[] = [
  "CREATE",
  "UPDATE",
  "DELETE",
  "BATCH",
];

const PERIOD_DAYS: Record<ActivityPeriod, number> = {
  "6m": 183,
  "7d": 6,
  "30d": 29,
  today: 0,
};

export const INITIAL_FILTERS: ActivityFilterState = {
  action: ALL,
  actorId: ALL,
  ownerId: ALL,
  period: DEFAULT_PERIOD,
  q: "",
};

// Number of filter groups that differ from the default (the badge of the filter button).
export function activeFilterCount(state: ActivityFilterState): number {
  return [
    state.period !== DEFAULT_PERIOD,
    state.action !== ALL,
    state.ownerId !== ALL,
    state.actorId !== ALL,
  ].filter(Boolean).length;
}

export function filterKey(filters: ActivityFilters): string {
  return JSON.stringify([
    filters.module,
    filters.action,
    filters.actorId,
    filters.ownerId,
    filters.q,
    filters.from?.slice(0, 10),
  ]);
}

// Spec 127 FR 9: the user's local day boundaries as ISO instants (the API clamps to the retention window).
export function periodRange(
  period: ActivityPeriod,
  now: Date,
): { from: string; to: string } {
  const from = new Date(now);

  from.setHours(0, 0, 0, 0);
  from.setDate(from.getDate() - PERIOD_DAYS[period]);

  return { from: from.toISOString(), to: now.toISOString() };
}

export function toApiFilters(
  module: ActivityModule,
  state: ActivityFilterState,
  now: Date,
): ActivityFilters {
  const q = state.q.trim();

  return {
    action: state.action === ALL ? undefined : state.action,
    actorId: state.actorId === ALL ? undefined : state.actorId,
    module,
    ownerId: state.ownerId === ALL ? undefined : state.ownerId,
    q: q === "" ? undefined : q,
    ...periodRange(state.period, now),
  };
}
