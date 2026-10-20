import { StyleSheet, TextStyle } from "react-native";

import { useKitTheme } from "@components/utils/useKitTheme";
import { isWeb } from "@utils/platform";

const CHIP_HEIGHT = 28;
const MAX_MENU_HEIGHT = 280;

function useStyles() {
  const theme = useKitTheme();
  const { colors, radius, sizes, spacing, typography } = theme;

  return {
    styles: StyleSheet.create({
      chip: {
        alignItems: "center",
        backgroundColor: colors.accentSoft,
        borderRadius: radius.full,
        flexDirection: "row",
        height: CHIP_HEIGHT,
        paddingLeft: spacing.sm,
      },
      chipRemove: {
        alignItems: "center",
        height: CHIP_HEIGHT,
        justifyContent: "center",
        width: CHIP_HEIGHT,
      },
      frame: {
        alignItems: "center",
        columnGap: spacing.xs,
        flexDirection: "row",
        flexWrap: "wrap",
        minHeight: sizes.inputHeight,
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        rowGap: spacing.xs,
      },
      input: {
        ...typography.input,
        // The frame already draws the focus border/ring; hide the browser's own outline (web only, not typed by RN).
        ...(isWeb()
          ? ({ outlineStyle: "none", outlineWidth: 0 } as TextStyle)
          : {}),
        color: colors.textPrimary,
        flexBasis: 80,
        flexGrow: 1,
        minHeight: CHIP_HEIGHT,
        paddingHorizontal: spacing.xs,
        paddingVertical: 0,
      },
      menu: {
        backgroundColor: colors.surface,
        borderColor: colors.border,
        borderRadius: radius.md,
        borderWidth: 1,
        elevation: 4,
        marginTop: spacing.xxs,
        maxHeight: MAX_MENU_HEIGHT,
        overflow: "hidden",
        shadowColor: colors.scrim,
        shadowOffset: { height: 4, width: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 8,
      },
      option: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "space-between",
        minHeight: sizes.touchTarget,
        paddingHorizontal: spacing.md,
      },
      optionActive: { backgroundColor: colors.surfaceRaised },
      srOnly: { height: 1, overflow: "hidden", position: "absolute", width: 1 },
    }),
    theme,
  };
}

export default useStyles;
