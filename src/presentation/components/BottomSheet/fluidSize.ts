const MARGIN = 64;
const MIN_WIDTH = 1040;
const MAX_WIDTH = 1440;
const MAX_HEIGHT = 960;

// Spec 048 FR 26: the import wizard grows with the window (width − 64 px, 1040-1440; height − 64 px, up to 960).
// Below 1040 px of window the 047 wizard sheet applies.
export function fluidSheetSize(window: {
  height: number;
  width: number;
}): undefined | { height: number; width: number } {
  if (window.width < MIN_WIDTH) {
    return undefined;
  }

  return {
    height: Math.min(window.height - MARGIN, MAX_HEIGHT),
    width: Math.min(Math.max(window.width - MARGIN, MIN_WIDTH), MAX_WIDTH),
  };
}
