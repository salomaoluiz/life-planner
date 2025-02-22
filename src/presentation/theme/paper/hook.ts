import { useTheme } from "react-native-paper";
import { ThemeProp } from "react-native-paper/lib/typescript/types";

function usePaperTheme() {
  return useTheme<ThemeProp>();
}

export default usePaperTheme;
