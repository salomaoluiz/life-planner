export type Breakpoint = "compact" | "expanded" | "medium";

/** Minimum window width (px) of each breakpoint. */
export const breakpoints: Record<Breakpoint, number> = {
  compact: 0,
  expanded: 1024,
  medium: 768,
};

export function getBreakpoint(width: number): Breakpoint {
  if (width >= breakpoints.expanded) return "expanded";
  if (width >= breakpoints.medium) return "medium";

  return "compact";
}
