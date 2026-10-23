import { useWindowDimensions } from "react-native";

// The window size; a hook of its own so tests can set it.
function useWindowSize(): { height: number; width: number } {
  const { height, width } = useWindowDimensions();

  return { height, width };
}

export default useWindowSize;
