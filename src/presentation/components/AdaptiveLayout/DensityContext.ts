import { createContext, useContext } from "react";

import { useBreakpoint } from "@presentation/theme";

export interface Density {
  density: "compact" | "regular";
  view: "compact" | "wide";
}

export const DensityContext = createContext<Density | null>(null);

// Inside an AdaptiveLayout: the density and the View rendered. Outside: derived from the breakpoint, as if the wide View were rendered.
export function useDensity(): Density {
  const context = useContext(DensityContext);
  const breakpoint = useBreakpoint();

  if (context) return context;

  return {
    density: breakpoint === "compact" ? "compact" : "regular",
    view: "wide",
  };
}
