import { StyleSheet } from "react-native";

import { useKitTheme } from "@components/utils/useKitTheme";

const GRABBER = { height: 4, width: 40 };
const DIALOG_MAX_WIDTH = 480;

function useStyles(wide: boolean) {
  const { colors, radius, spacing } = useKitTheme();

  return StyleSheet.create({
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: colors.scrim,
    },
    body: { gap: spacing.md, padding: spacing.md },
    footer: { padding: spacing.md },
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
      paddingHorizontal: spacing.md,
    },
    overlay: { flex: 1, justifyContent: wide ? "center" : "flex-end" },
    sheet: wide
      ? {
          alignSelf: "center",
          backgroundColor: colors.surface,
          borderRadius: radius.lg,
          maxHeight: "90%",
          maxWidth: DIALOG_MAX_WIDTH,
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
