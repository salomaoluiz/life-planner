import { useWindowDimensions } from "react-native";

import { Breakpoint, getBreakpoint } from "./constants/breakpoints";

export function useBreakpoint(): Breakpoint {
  const { width } = useWindowDimensions();

  return getBreakpoint(width);
}
