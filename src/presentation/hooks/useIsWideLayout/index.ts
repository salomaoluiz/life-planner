import useWindowSize from "@components/utils/useWindowSize";
import { getBreakpoint } from "@presentation/theme/constants";

// True from the medium width up (web / tablet): for a shared sheet that offers a wide variant (the icon picker).
function useIsWideLayout(): boolean {
  const { width } = useWindowSize();

  return getBreakpoint(width) !== "compact";
}

export default useIsWideLayout;
