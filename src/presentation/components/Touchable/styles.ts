import { StyleSheet } from "react-native";

import { useKitTheme } from "@components/utils/useKitTheme";

function useStyles(options: { minTouchTarget: boolean }) {
  const { colors, sizes } = useKitTheme();

  return {
    colors,
    styles: StyleSheet.create({
      disabled: { opacity: 0.5 },
      hover: {
        backgroundColor: colors.surfaceRaised,
        bottom: 0,
        left: 0,
        opacity: 0.6,
        position: "absolute",
        right: 0,
        top: 0,
      },
      pressed: { opacity: 0.7 },
      root: options.minTouchTarget
        ? { minHeight: sizes.touchTarget, minWidth: sizes.touchTarget }
        : {},
    }),
  };
}

export default useStyles;
