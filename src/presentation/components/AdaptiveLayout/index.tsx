import { ComponentType, useMemo } from "react";

import { useBreakpoint } from "@presentation/theme";

import { Density, DensityContext } from "./DensityContext";

export { Density, useDensity } from "./DensityContext";

export interface AdaptiveLayoutProps<VM = void> {
  // Rendered only on a compact width (< 768) and only when given.
  compact?: ComponentType<AdaptiveViewProps<VM>>;
  // Omitted for Views with no ViewModel.
  vm?: VM;
  // Default View: every width unless a compact View applies.
  wide: ComponentType<AdaptiveViewProps<VM>>;
}

// Both Views receive exactly the same `vm`, so a View can never hold data the other one lacks.
export type AdaptiveViewProps<VM = void> = VM extends void
  ? object
  : { vm: VM };

// Renders nothing of its own: the frame (Screen, BottomSheet) stays inside each View.
function AdaptiveLayout<VM = void>(props: AdaptiveLayoutProps<VM>) {
  const breakpoint = useBreakpoint();
  const isCompactWidth = breakpoint === "compact";
  const showCompact = isCompactWidth && props.compact !== undefined;
  const View = (showCompact ? props.compact : props.wide) as ComponentType<
    Record<string, unknown>
  >;
  const value = useMemo<Density>(
    () => ({
      density: isCompactWidth ? "compact" : "regular",
      view: showCompact ? "compact" : "wide",
    }),
    [isCompactWidth, showCompact],
  );
  const viewProps = props.vm === undefined ? {} : { vm: props.vm };

  return (
    <DensityContext.Provider value={value}>
      <View {...viewProps} />
    </DensityContext.Provider>
  );
}

export default AdaptiveLayout;
