import { StyleSheet, ViewStyle } from "react-native";

import { useKitTheme } from "@components/utils/useKitTheme";
import { isWeb } from "@utils/platform";

const GRABBER = { height: 4, width: 40 };
const DIALOG_MAX_WIDTH = 480;

function useStyles(wide: boolean) {
  const { colors, radius, spacing } = useKitTheme();

  return StyleSheet.create({
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: colors.scrim,
    },
    body: { gap: spacing.md, padding: spacing.lg },
    footer: { padding: spacing.lg },
    grabber: {
      alignSelf: "center",
      backgroundColor: colors.border,
      borderRadius: radius.full,
      height: GRABBER.height,
      marginVertical: spacing.xs,
      width: GRABBER.width,
    },
    grabberArea: { paddingVertical: spacing.xs },
    header: {
      alignItems: "center",
      flexDirection: "row",
      justifyContent: "space-between",
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.sm,
    },
    overlay: { flex: 1, justifyContent: wide ? "center" : "flex-end" },
    // react-native-web passes scrollbarColor through; RN's ViewStyle does not declare it.
    scroll: isWeb()
      ? ({ scrollbarColor: `${colors.border} transparent` } as ViewStyle)
      : {},
    sheet: wide
      ? {
          alignSelf: "center",
          backgroundColor: colors.surface,
          borderRadius: radius.lg,
          maxHeight: "90%",
          maxWidth: DIALOG_MAX_WIDTH,
          // Outer breathing room: the close button never touches the dialog border.
          paddingTop: spacing.xs,
          width: "100%",
        }
      : {
          backgroundColor: colors.surface,
          borderTopLeftRadius: radius.sheet,
          borderTopRightRadius: radius.sheet,
          maxHeight: "90%",
        },
    title: { flex: 1 },
  });
}

export default useStyles;
