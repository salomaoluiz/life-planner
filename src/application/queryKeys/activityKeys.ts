// Spec 127: every activity query key lives here, under one root.
type Key = string[];

const ROOT = "activity";

export const activityKeys = {
  all: (): Key => [ROOT],
  items: (id: string, q: string): Key => [ROOT, "items", id, q],
  list: (filter: string): Key => [ROOT, "list", filter],
};
