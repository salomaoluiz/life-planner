const MIN_WIDTH = 960;
const WINDOW_SHARE = 0.7;

// Spec 052 FR 11: the Overview takes 70% of the window (at least 960 px), never more than the area next to the rail.
function overviewMaxWidth(windowWidth: number, railWidth: number): number {
  return Math.min(
    Math.max(MIN_WIDTH, windowWidth * WINDOW_SHARE),
    windowWidth - railWidth,
  );
}

export default overviewMaxWidth;
