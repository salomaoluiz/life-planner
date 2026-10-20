import { StyleSheet, ViewStyle } from "react-native";

import { useKitTheme } from "@components/utils/useKitTheme";
import { isWeb } from "@utils/platform";

const FOOTER_BUTTON_MIN_WIDTH = 200;
const GRABBER = { height: 4, width: 40 };

function useStyles(wide: boolean, form: boolean, medium: boolean) {
  const { colors, radius, sizes, spacing } = useKitTheme();
  const wideForm = wide && form;
  let maxWidth = sizes.formMaxWidth;
  if (wideForm) {
    maxWidth = medium
      ? sizes.formDialogMaxWidthMedium
      : sizes.formDialogMaxWidth;
  }

  return StyleSheet.create({
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: colors.scrim,
    },
    body: wideForm
      ? {
          gap: spacing.md,
          paddingHorizontal: spacing.xxl,
          paddingVertical: spacing.xl,
        }
      : { gap: spacing.md, padding: spacing.lg },
    footer: wideForm
      ? {
          alignItems: "center",
          borderTopColor: colors.border,
          borderTopWidth: 1,
          flexDirection: "row",
          paddingHorizontal: spacing.xxl,
          paddingVertical: spacing.lg,
        }
      : { gap: spacing.xs, padding: spacing.lg },
    footerAction: { minWidth: FOOTER_BUTTON_MIN_WIDTH },
    // A fullWidth primary button is not stretched on a wide form.
    footerEnd: { flexDirection: "row", gap: spacing.md },
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
    headerForm: {
      alignItems: "center",
      flexDirection: "row",
      justifyContent: "space-between",
      paddingLeft: spacing.xxl,
      paddingRight: spacing.lg,
      paddingTop: spacing.lg,
    },
    // Wide: the dialog keeps `spacing.xl` of air on both sides of a narrow window.
    overlay: wide
      ? { flex: 1, justifyContent: "center", paddingHorizontal: spacing.xl }
      : { flex: 1, justifyContent: "flex-end" },
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
          maxWidth,
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
