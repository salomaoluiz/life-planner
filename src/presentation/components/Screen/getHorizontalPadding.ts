const MAX_CONTENT_WIDTH = 720;

export function getHorizontalPadding(
  width: number,
  breakpoint: "compact" | "expanded" | "medium",
  lg: number,
  maxContent: number = MAX_CONTENT_WIDTH,
): number {
  if (breakpoint === "compact") {
    return lg;
  }

  return Math.max(lg, (width - maxContent) / 2);
}
